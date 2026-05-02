import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiError {
  error: string;
  statusCode?: number;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          window.location.href = '/#/login';
        }
        throw error;
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // ============= AUTH =============
  async register(data: {
    tenantName: string;
    email: string;
    password: string;
    gstNumber?: string;
    phone?: string;
  }) {
    const response = await this.client.post('/auth/register', data);
    if (response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.token) {
      this.setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('tenant', JSON.stringify(response.data.tenant));
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // ============= MEDICINES =============
  async getMedicines() {
    const response = await this.client.get('/medicines');
    return response.data;
  }

  async getMedicineById(id: string) {
    const response = await this.client.get(`/medicines/${id}`);
    return response.data;
  }

  async createMedicine(data: any) {
    const response = await this.client.post('/medicines', data);
    return response.data;
  }

  async updateMedicine(id: string, data: any) {
    const response = await this.client.put(`/medicines/${id}`, data);
    return response.data;
  }

  async getLowStockMedicines() {
    const response = await this.client.get('/medicines/low-stock/alert');
    return response.data;
  }

  async getExpiringMedicines() {
    const response = await this.client.get('/medicines/expiry/soon');
    return response.data;
  }

  // ============= BATCHES =============
  async getBatches() {
    const response = await this.client.get('/batches');
    return response.data;
  }

  async getBatchById(id: string) {
    const response = await this.client.get(`/batches/${id}`);
    return response.data;
  }

  async createBatch(data: any) {
    const response = await this.client.post('/batches', data);
    return response.data;
  }

  async updateBatchQuantity(id: string, quantity: number) {
    const response = await this.client.patch(`/batches/${id}/quantity`, { quantity });
    return response.data;
  }

  async getLowStockBatches() {
    const response = await this.client.get('/batches/stock/low');
    return response.data;
  }

  async getExpiringBatches() {
    const response = await this.client.get('/batches/expiry/alert');
    return response.data;
  }

  // ============= BRANCHES / INVENTORY =============
  async getBranches() {
    const response = await this.client.get('/branches');
    return response.data;
  }

  async getBranchInventory(branchId: string) {
    const response = await this.client.get(`/branches/${branchId}/inventory`);
    return response.data;
  }

  async createBranchMedicineBatch(branchId: string, data: any) {
    const response = await this.client.post(`/branches/${branchId}/inventory/medicine-batch`, data);
    return response.data;
  }

  async importBranchCsv(branchId: string, csvText: string) {
    const response = await this.client.post(`/branches/${branchId}/inventory/import`, { csvText });
    return response.data;
  }

  async toggleBranchBatchBlocked(branchId: string, batchId: string) {
    const response = await this.client.patch(`/branches/${branchId}/inventory/batches/${batchId}/block`);
    return response.data;
  }

  async transferBranchStock(data: { sourceBranchId: string; destinationBranchId: string; lines: Array<{ medicineId: string; quantity: number }> }) {
    const response = await this.client.post('/branches/transfer', data);
    return response.data;
  }

  // ============= CUSTOMERS =============
  async getCustomers() {
    const response = await this.client.get('/customers');
    return response.data;
  }

  async getCustomerById(id: string) {
    const response = await this.client.get(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(data: any) {
    const response = await this.client.post('/customers', data);
    return response.data;
  }

  async updateCustomer(id: string, data: any) {
    const response = await this.client.put(`/customers/${id}`, data);
    return response.data;
  }

  async getCustomerHistory(id: string) {
    const response = await this.client.get(`/customers/${id}/history`);
    return response.data;
  }

  async searchCustomers(query: string) {
    const response = await this.client.get(`/customers/search/${query}`);
    return response.data;
  }

  // ============= SUPPLIERS =============
  async getSuppliers() {
    const response = await this.client.get('/suppliers');
    return response.data;
  }

  async getSupplierById(id: string) {
    const response = await this.client.get(`/suppliers/${id}`);
    return response.data;
  }

  async createSupplier(data: any) {
    const response = await this.client.post('/suppliers', data);
    return response.data;
  }

  async updateSupplier(id: string, data: any) {
    const response = await this.client.put(`/suppliers/${id}`, data);
    return response.data;
  }

  async deleteSupplier(id: string) {
    const response = await this.client.delete(`/suppliers/${id}`);
    return response.data;
  }

  // ============= INVOICES =============
  async getInvoices(status?: string) {
    const response = await this.client.get('/invoices', {
      params: { status },
    });
    return response.data;
  }

  async getInvoiceById(id: string) {
    const response = await this.client.get(`/invoices/${id}`);
    return response.data;
  }

  async createInvoice(data: any) {
    const response = await this.client.post('/invoices', data);
    return response.data;
  }

  async updateInvoiceStatus(id: string, status: string) {
    const response = await this.client.patch(`/invoices/${id}/status`, { status });
    return response.data;
  }

  async getRecentInvoices() {
    const response = await this.client.get('/invoices/summary/recent');
    return response.data;
  }

  // ============= OCR =============
  async processOCRInvoice(data: {
    supplierId: string;
    invoiceNumber?: string;
    imageUrl: string;
    ocrRawText: string;
  }) {
    const response = await this.client.post('/ocr/process-invoice', data);
    return response.data;
  }

  async uploadAndProcessOCRFile(data: {
    supplierId: string;
    file: File;
    invoiceNumber?: string;
  }) {
    const formData = new FormData();
    formData.append('supplierId', data.supplierId);
    formData.append('file', data.file);
    if (data.invoiceNumber) {
      formData.append('invoiceNumber', data.invoiceNumber);
    }

    const response = await this.client.post('/ocr/upload-and-process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async createBatchesFromInvoice(invoiceId: string, medicines: any[], branchId?: string) {
    const response = await this.client.post('/ocr/create-batches-from-invoice', {
      invoiceId,
      branchId,
      medicines,
    });
    return response.data;
  }

  // ============= POS TRANSACTIONS =============
  async createPOSTransaction(data: any) {
    const response = await this.client.post('/pos/transaction', data);
    return response.data;
  }

  async getPOSTransactionById(id: string) {
    const response = await this.client.get(`/pos/transaction/${id}`);
    return response.data;
  }

  async getPOSTransactions(from?: string, to?: string, branchId?: string) {
    const response = await this.client.get('/pos', {
      params: { from, to, branchId },
    });
    return response.data;
  }

  async getPOSDashboardSummary(branchId?: string) {
    const response = await this.client.get('/pos/summary/dashboard', {
      params: { branchId },
    });
    return response.data;
  }

  async getDashboardAnalytics(branchId?: string) {
    const response = await this.client.get('/analytics/dashboard', {
      params: { branchId },
    });
    return response.data;
  }

  // ============= PRESCRIPTIONS =============
  async getPrescriptions() {
    const response = await this.client.get('/prescriptions');
    return response.data;
  }

  async getPrescriptionById(id: string) {
    const response = await this.client.get(`/prescriptions/${id}`);
    return response.data;
  }

  async createPrescription(data: any) {
    const response = await this.client.post('/prescriptions', data);
    return response.data;
  }

  async verifyPrescription(id: string, status: string) {
    const response = await this.client.patch(`/prescriptions/${id}/verify`, {
      verificationStatus: status,
    });
    return response.data;
  }

  async getPendingPrescriptions() {
    const response = await this.client.get('/prescriptions/pending/list');
    return response.data;
  }

  async getCustomerPrescriptions(customerId: string) {
    const response = await this.client.get(`/prescriptions/customer/${customerId}`);
    return response.data;
  }

  // ============= USERS =============
  async getUsers() {
    const response = await this.client.get('/users');
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.client.post('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put(`/users/${id}`, data);
    return response.data;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const response = await this.client.post(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async deactivateUser(id: string) {
    const response = await this.client.post(`/users/${id}/deactivate`);
    return response.data;
  }

  async reactivateUser(id: string) {
    const response = await this.client.post(`/users/${id}/reactivate`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
