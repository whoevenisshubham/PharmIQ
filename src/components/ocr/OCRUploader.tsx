import React, { useRef, useState } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { toast } from 'sonner';

interface OCRResult {
  success: boolean;
  invoice: any;
  extractedData: any;
  message: string;
}

interface OCRUploaderProps {
  supplierId: string;
  onSuccess?: (invoice: any, extractedData: any) => void;
}

export const OCRUploader: React.FC<OCRUploaderProps> = ({ supplierId, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState('');

  const processText = async (text: string) => {
    if (!text.trim()) {
      setError('OCR text is empty. Paste extracted text or upload a text file.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.processOCRInvoice({
        supplierId,
        imageUrl: '',
        ocrRawText: text,
      });

      setResult(response);
      toast.success('Invoice processed successfully!');
      onSuccess?.(response.invoice, response.extractedData);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to process invoice';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = [
      'text/plain',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!allowed.includes(file.type)) {
      setError('Unsupported file type. Use JPG/PNG/PDF/DOCX/TXT/JSON.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.uploadAndProcessOCRFile({
        supplierId,
        file,
      });

      setResult(response);
      if (response.extractedText) {
        setOcrText(response.extractedText);
      }
      toast.success('Invoice file processed successfully!');
      onSuccess?.(response.invoice, response.extractedData);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to process uploaded file';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".jpg,.jpeg,.png,.webp,.pdf,.docx,.doc,.txt,.json"
          disabled={isProcessing}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex flex-col items-center gap-3 mx-auto"
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
          <div>
            <p className="font-semibold text-gray-700">
              {isProcessing ? 'Processing Invoice...' : 'Upload invoice/document file'}
            </p>
            <p className="text-sm text-gray-500">JPG, PNG, PDF, DOCX, TXT, JSON</p>
          </div>
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Paste OCR Text</label>
        <textarea
          value={ocrText}
          onChange={(e) => setOcrText(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          placeholder="Paste raw OCR text from OCR.ipynb here, then click Process OCR Text"
        />
        <button
          onClick={() => processText(ocrText)}
          disabled={isProcessing || !supplierId}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? 'Processing...' : 'Process OCR Text'}
        </button>
      </div>

      {error && (
        <div className="flex gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-700">{result.message}</p>
              <p className="text-sm text-green-700">
                Invoice No: {result.invoice?.invoiceNumber || result.extractedData?.invoice_number || 'N/A'}
              </p>
              <p className="text-sm text-green-600">Invoice ID: {result.invoice.id}</p>
            </div>
          </div>

          {result.extractedData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Extracted Data</h3>
              <pre className="text-xs overflow-auto max-h-48 text-gray-700">
                {JSON.stringify(result.extractedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
