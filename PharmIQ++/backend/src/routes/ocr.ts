import { Router, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { z } from 'zod';
import axios from 'axios';
import multer from 'multer';
import { createWorker } from 'tesseract.js';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();
const prisma = new PrismaClient();

const maxFileSize = Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
});

// Initialize Gemini client if API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface OCRInvoiceData {
  supplier?: { name: string; address?: string };
  invoice_number?: string;
  invoice_date?: string;
  medicines?: Array<{
    name: string;
    composition?: string;
    quantity: number;
    unit_rate: number;
    hsn_code?: string;
    batch_number?: string;
    expiry_date?: string;
  }>;
  subtotal?: number;
  gst_amount?: number;
  total_amount?: number;
  error?: string;
}

const processInvoiceSchema = z.object({
  supplierId: z.string(),
  invoiceNumber: z.string().optional(),
  imageUrl: z.string().optional(),
  ocrRawText: z.string().optional(),
});

const uploadInvoiceSchema = z.object({
  supplierId: z.string(),
  invoiceNumber: z.string().optional(),
});

/**
 * Process OCR invoice and extract structured data
 * Expects raw OCR text from frontend (extracted by PaddleOCR)
 */
router.post('/process-invoice', async (req: AuthRequest, res: Response) => {
  try {
    const { supplierId, invoiceNumber, ocrRawText } = processInvoiceSchema.parse(req.body);

    if (!ocrRawText) {
      throw new AppError('OCR raw text is required', 400);
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, tenantId: req.tenantId },
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    // Call Gemini API to structure the invoice data
    const structuredData = await structureInvoiceData(ocrRawText);

    if (structuredData.error) {
      return res.status(400).json({
        error: 'Failed to extract invoice data',
        details: structuredData.error,
      });
    }

    const finalInvoiceNumber = structuredData.invoice_number || invoiceNumber || `INV-${Date.now()}`;

    // Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        tenantId: req.tenantId!,
        supplierId,
        invoiceNumber: finalInvoiceNumber,
        invoiceDate: structuredData.invoice_date
          ? new Date(structuredData.invoice_date)
          : new Date(),
        subtotal: structuredData.subtotal || 0,
        gstAmount: structuredData.gst_amount || 0,
        totalAmount: structuredData.total_amount || 0,
        ocrData: structuredData as Prisma.InputJsonValue,
        status: 'PENDING',
      },
      include: { supplier: true },
    });

    res.status(201).json({
      success: true,
      invoice,
      extractedData: structuredData,
      message: 'Invoice processed successfully. Review and create batches.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

/**
 * Upload invoice file (jpg/png/pdf/docx/txt/json), extract text and process OCR
 */
router.post('/upload-and-process', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const { supplierId, invoiceNumber } = uploadInvoiceSchema.parse(req.body);

    if (!req.file) {
      throw new AppError('Invoice file is required', 400);
    }

    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, tenantId: req.tenantId },
    });

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    const extractedText = await extractTextFromFile(req.file);
    if (!extractedText || !extractedText.trim()) {
      throw new AppError('Could not extract readable text from file', 400);
    }

    const structuredData = await structureInvoiceData(extractedText);

    if (structuredData.error) {
      return res.status(400).json({
        error: 'Failed to extract invoice data',
        details: structuredData.error,
      });
    }

    const finalInvoiceNumber = structuredData.invoice_number || invoiceNumber || `INV-${Date.now()}`;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: req.tenantId!,
        supplierId,
        invoiceNumber: finalInvoiceNumber,
        invoiceDate: structuredData.invoice_date ? new Date(structuredData.invoice_date) : new Date(),
        subtotal: structuredData.subtotal || 0,
        gstAmount: structuredData.gst_amount || 0,
        totalAmount: structuredData.total_amount || 0,
        ocrData: {
          ...structuredData,
          originalFileName: req.file.originalname,
          mimeType: req.file.mimetype,
        } as Prisma.InputJsonValue,
        status: 'PENDING',
      },
      include: { supplier: true },
    });

    return res.status(201).json({
      success: true,
      invoice,
      extractedText,
      extractedData: structuredData,
      message: `Invoice processed from ${req.file.originalname}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

/**
 * Create batches from invoice OCR data
 */
router.post('/create-batches-from-invoice', async (req: AuthRequest, res: Response) => {
  try {
    const { invoiceId, branchId, medicines } = z.object({
      invoiceId: z.string(),
      branchId: z.string().optional(),
      medicines: z.array(
        z.object({
          name: z.string(),
          composition: z.string().optional(),
          quantity: z.number().positive(),
          unit_rate: z.number().positive(),
          batch_number: z.string().optional(),
          expiry_date: z.string().optional(),
          hsn_code: z.string().optional(),
        }),
      ).min(1),
    }).parse(req.body);

    // Verify invoice exists
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId: req.tenantId },
      include: { supplier: true },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    const targetBranch = branchId
      ? await prisma.branch.findFirst({ where: { id: branchId, tenantId: req.tenantId } })
      : await prisma.branch.findFirst({ where: { tenantId: req.tenantId }, orderBy: { createdAt: 'asc' } });

    if (!targetBranch) {
      throw new AppError('No branch available for batch creation', 400);
    }

    const createdBatches = [];

    // Process each medicine
    for (const med of medicines) {
      // Find or create medicine
      const medicine = await prisma.medicine.upsert({
        where: {
          tenantId_name: {
            tenantId: req.tenantId!,
            name: med.name,
          },
        },
        create: {
          tenantId: req.tenantId!,
          name: med.name,
          generic: med.composition || med.name,
          composition: med.composition,
          hsnCode: med.hsn_code,
          unit: 'unit',
        },
        update: {},
      });

      // Create batch
      if (med.expiry_date) {
        const batch = await prisma.batch.create({
          data: {
            tenantId: req.tenantId!,
            medicineId: medicine.id,
            batchNumber: med.batch_number || `BATCH-${Date.now()}`,
            expiryDate: new Date(med.expiry_date),
            quantity: Math.floor(med.quantity),
            costPrice: med.unit_rate,
            sellingPrice: med.unit_rate * 1.3, // 30% margin by default
            supplierId: invoice.supplierId,
            invoiceId,
          },
          include: { medicine: true },
        });

        await prisma.branchStock.upsert({
          where: {
            branchId_batchId: {
              branchId: targetBranch.id,
              batchId: batch.id,
            },
          },
          create: {
            tenantId: req.tenantId!,
            branchId: targetBranch.id,
            batchId: batch.id,
            quantity: batch.quantity,
            status: 'Available',
          },
          update: {
            quantity: { increment: batch.quantity },
            status: 'Available',
          },
        });

        createdBatches.push(batch);
      }
    }

    // Update invoice status
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PROCESSED' },
    });

    res.json({
      success: true,
      batchesCreated: createdBatches.length,
      batches: createdBatches,
      message: `Created ${createdBatches.length} batches from invoice`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    throw error;
  }
});

/**
 * Structure invoice data using Gemini API
 */
async function structureInvoiceData(rawText: string): Promise<OCRInvoiceData> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️  Gemini API key not configured. Returning raw structure.');
    return parseRawInvoiceText(rawText);
  }

  const prompt = `
    You are a highly accurate pharmacy invoice extraction system.
    Your task is to extract key entities from the raw OCR text of a pharmacy supplier invoice.

    RAW OCR TEXT:
    ${rawText}

    INSTRUCTIONS:
    1. Extract the supplier's name and address.
    2. Extract the invoice number and date (Format: YYYY-MM-DD).
    3. Extract all medicine entries with the following details for each:
       - Medicine name/brand
       - Generic composition (if available)
       - Quantity/Batch quantity
       - Unit rate (price per unit)
       - HSN/SAC code (for GST calculation)
       - Batch number (if visible)
       - Expiry date (if visible, Format: YYYY-MM-DD)
    4. Extract the subtotal, GST amount, and total amount.
    5. If a value is missing or illegible, return null. Do not guess.

    Return the extracted data STRICTLY as a valid JSON object with this structure:
    {
        "supplier": {"name": "", "address": ""},
        "invoice_number": "",
        "invoice_date": "",
        "medicines": [
            {
                "name": "",
                "composition": "",
                "quantity": 0,
                "unit_rate": 0,
                "hsn_code": "",
                "batch_number": "",
                "expiry_date": ""
            }
        ],
        "subtotal": 0,
        "gst_amount": 0,
        "total_amount": 0
    }
  `;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
      },
    );

    let responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from markdown code blocks if present
    if (responseText.includes('```json')) {
      responseText = responseText.split('```json')[1].split('```')[0].trim();
    } else if (responseText.includes('```')) {
      responseText = responseText.split('```')[1].split('```')[0].trim();
    }

    const structuredData = JSON.parse(responseText);
    return structuredData;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to simple parsing
    return parseRawInvoiceText(rawText);
  }
}

async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const mimeType = (file.mimetype || '').toLowerCase();
  const name = (file.originalname || '').toLowerCase();

  // Plain text / json
  if (
    mimeType.includes('text/plain') ||
    mimeType.includes('application/json') ||
    name.endsWith('.txt') ||
    name.endsWith('.json')
  ) {
    return file.buffer.toString('utf-8');
  }

  // DOCX
  if (
    mimeType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
    name.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  // Legacy DOC not reliably supported without external converters
  if (mimeType.includes('application/msword') || name.endsWith('.doc')) {
    throw new AppError('Legacy .doc is not supported. Please save as .docx or PDF.', 400);
  }

  // PDF text extraction (works for digital PDFs)
  if (mimeType.includes('application/pdf') || name.endsWith('.pdf')) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const parsed = await parser.getText();
      const text = parsed.text?.trim() || '';
      if (!text) {
        throw new AppError('No text found in PDF. For scanned PDFs, upload image pages or use OCR-ready PDF.', 400);
      }
      return text;
    } finally {
      await parser.destroy();
    }
  }

  // Image OCR (png/jpg/jpeg/webp)
  if (
    mimeType.startsWith('image/') ||
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp')
  ) {
    const worker = await createWorker('eng');
    try {
      const result = await worker.recognize(file.buffer);
      return result.data.text || '';
    } finally {
      await worker.terminate();
    }
  }

  throw new AppError(`Unsupported file type: ${file.mimetype || file.originalname}`, 400);
}

/**
 * Simple fallback parser when Gemini is not available
 */
function parseRawInvoiceText(rawText: string): OCRInvoiceData {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const data: OCRInvoiceData = {
    supplier: { name: 'Unknown Supplier', address: '' },
    invoice_number: 'INV-' + Date.now(),
    invoice_date: new Date().toISOString().split('T')[0],
    medicines: [],
    subtotal: 0,
    gst_amount: 0,
    total_amount: 0,
  };

  const parseLastAmount = (line: string): number | undefined => {
    const matches = line.match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?/g);
    if (!matches || matches.length === 0) return undefined;
    const value = matches[matches.length - 1].replace(/,/g, '');
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : undefined;
  };

  const parseMoney = (token: string): number | undefined => {
    const normalized = token.replace(/,/g, '').trim();
    if (!/^\d+(?:\.\d+)?$/.test(normalized)) return undefined;
    const amount = Number(normalized);
    return Number.isFinite(amount) ? amount : undefined;
  };

  const parseQuantityToken = (token: string): number | undefined => {
    const cleaned = token.replace(/[^a-z0-9]/gi, '').toUpperCase();
    if (!cleaned) return undefined;
    if (/^\d+$/.test(cleaned)) {
      const qty = Number(cleaned);
      return Number.isFinite(qty) && qty > 0 ? qty : undefined;
    }

    const map: Record<string, string> = {
      O: '0',
      Q: '0',
      D: '0',
      I: '1',
      L: '1',
      Z: '2',
      S: '5',
      H: '5',
      G: '6',
      B: '8',
    };

    const mapped = cleaned
      .split('')
      .map((ch) => map[ch] ?? ch)
      .join('');

    if (!/^\d+$/.test(mapped)) return undefined;
    const qty = Number(mapped);
    return Number.isFinite(qty) && qty > 0 ? qty : undefined;
  };

  const maybeExtractTableRow = (line: string): {
    name: string;
    quantity: number;
    unit_rate: number;
    batch_number?: string;
    expiry_date?: string;
  } | undefined => {
    if (/\b(item|qty|quantity|rate|batch|expiry)\b/i.test(line)) return undefined;

    const normalized = line.replace(/\s+/g, ' ').trim();
    const rowMatch = normalized.match(/^(.+?)\s+([^\s]+)\s+(\d+(?:\.\d+)?)\s+([a-z0-9\-\/]+)\s+(\d{4}-\d{2}-\d{2})$/i);
    if (!rowMatch) return undefined;

    const [, rawName, qtyToken, rateToken, batchNo, expiry] = rowMatch;
    const quantity = parseQuantityToken(qtyToken);
    const unitRate = parseMoney(rateToken);
    if (!quantity || unitRate === undefined) return undefined;

    const name = rawName.replace(/\s+/g, ' ').trim();
    if (name.length < 3) return undefined;

    return {
      name,
      quantity,
      unit_rate: unitRate,
      batch_number: batchNo,
      expiry_date: expiry,
    };
  };

  // Extract supplier header section before invoice/body rows.
  const invoiceLineIndex = lines.findIndex((line) => /\binvoice\b/i.test(line));
  const headerLines = invoiceLineIndex > 0 ? lines.slice(0, invoiceLineIndex) : lines.slice(0, Math.min(5, lines.length));

  for (const headerLine of headerLines) {
    const clean = headerLine.trim();
    if (!clean) continue;

    if (/^address\s*:/i.test(clean)) {
      const addr = clean.split(':').slice(1).join(':').trim();
      if (addr) data.supplier!.address = addr;
      continue;
    }

    if (/\bgstin\b/i.test(clean)) {
      continue;
    }

    if (data.supplier!.name === 'Unknown Supplier' && /[A-Za-z]/.test(clean) && clean.length > 5) {
      data.supplier!.name = clean.replace(/\s+/g, ' ').trim();
    }
  }

  // Regex-based fallback parsing for common OCR invoice formats
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    const lower = cleanLine.toLowerCase();

    if (lower.includes('supplier') || lower.includes('from:') || lower.includes('vendor')) {
      const parsedName = cleanLine.split(':')[1]?.trim();
      if (parsedName) {
        data.supplier!.name = parsedName;
      }
    }

    if (lower.startsWith('address')) {
      const parsedAddress = cleanLine.split(':').slice(1).join(':').trim();
      if (parsedAddress) {
        data.supplier!.address = parsedAddress;
      }
    }

    if (lower.includes('invoice')) {
      const match = cleanLine.match(/invoice\s*(?:no\.?|number|#)\s*[:\-]?\s*([a-z0-9\-\/]+)/i);
      if (match) data.invoice_number = match[1];
    }

    if (lower.includes('date')) {
      const match = cleanLine.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) data.invoice_date = match[1];
    }

    if (lower.includes('subtotal')) {
      const amount = parseLastAmount(cleanLine);
      if (amount !== undefined) data.subtotal = amount;
    }

    if (lower.includes('gst') || lower.includes('tax')) {
      const amount = parseLastAmount(cleanLine);
      if (amount !== undefined) data.gst_amount = amount;
    }

    if (lower.includes('total') && !lower.includes('subtotal')) {
      const amount = parseLastAmount(cleanLine);
      if (amount !== undefined) data.total_amount = amount;
    }

    // Fallback medicine line extraction for typical OCR text:
    // "Paracetamol 500mg ... Qty: 10 ... Rate: 45 ... Batch: B001 ... Exp: 2027-06-30"
    const qtyMatch = cleanLine.match(/(?:qty|quantity)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
    const rateMatch = cleanLine.match(/(?:rate|mrp|price)\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
    const batchMatch = cleanLine.match(/(?:batch)\s*[:\-]?\s*([a-z0-9\-\/]+)/i);
    const expMatch = cleanLine.match(/(?:exp|expiry|expires?)\s*[:\-]?\s*(\d{4}-\d{2}-\d{2})/i);

    if (qtyMatch && rateMatch) {
      const name = cleanLine
        .split(/(?:qty|quantity)\s*[:\-]?/i)[0]
        .replace(/[\-–:]\s*$/, '')
        .trim();

      if (name) {
        data.medicines!.push({
          name,
          quantity: Number(qtyMatch[1]),
          unit_rate: Number(rateMatch[1]),
          batch_number: batchMatch?.[1],
          expiry_date: expMatch?.[1],
        });
      }
      continue;
    }

    const tableMedicine = maybeExtractTableRow(cleanLine);
    if (tableMedicine) {
      data.medicines!.push(tableMedicine);
    }
  }

  // Heuristic defaults when totals are missing but medicine rows exist
  if ((!data.subtotal || data.subtotal <= 0) && data.medicines && data.medicines.length > 0) {
    data.subtotal = data.medicines.reduce((sum, m) => sum + m.quantity * m.unit_rate, 0);
  }
  if ((!data.total_amount || data.total_amount <= 0) && data.subtotal) {
    data.total_amount = data.subtotal + (data.gst_amount || 0);
  }

  return data;
}

export default router;
