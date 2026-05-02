import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { POSPage } from '@/pages/POSPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { OCRProcurementPage } from '@/pages/OCRProcurementPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { PrescriptionsPage } from '@/pages/PrescriptionsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { CompliancePage } from '@/pages/CompliancePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { BatchExplorerPage } from '@/pages/BatchExplorerPage';
import { PurchaseHistoryPage } from '@/pages/PurchaseHistoryPage';
import { TransferPage } from '@/pages/TransferPage';
import { useEffect } from 'react';
import { useTenantStore } from '@/stores/tenantStore';
import { useAuthStore } from '@/stores/authStore';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { useBranchInventoryStore } from '@/stores/branchInventoryStore';
import { apiClient } from '@/api/client';

export default function App() {
  const { setTenants } = useTenantStore();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const initializeBranches = useBranchInventoryStore((state) => state.initializeBranches);
  const navigate = useNavigate();

  useEffect(() => {
    const bootstrap = async () => {
      await checkAuth();

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setTenants([]);
        return;
      }

      try {
        const branches = await apiClient.getBranches();
        const formattedBranches = branches.map((branch: any) => ({
          id: branch.id,
          name: 'PharmEZ',
          branchName: branch.name,
          city: branch.city,
          gstin: branch.gstin,
          drugLicenseNo: branch.drugLicenseNo,
          isActive: branch.isActive,
          address: branch.address,
          phone: branch.phone,
          email: branch.email,
        }));

        setTenants(formattedBranches);
        await initializeBranches(formattedBranches.map((branch: { id: string }) => branch.id));
      } catch {
        setTenants([]);
      }
    };

    void bootstrap();
    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        navigate('/pos');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        navigate('/inventory');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTenants, initializeBranches, checkAuth, navigate]);

  return (
    <Routes>
      {/* Public Routes (No AppShell) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes (Wrapped in AppShell) */}
      <Route path="/*" element={
        <RequireAuth>
          <AppShell>
            <Routes>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="pos" element={<POSPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/batches" element={<BatchExplorerPage />} />
              <Route path="inventory/transfer" element={<TransferPage />} />
              <Route path="purchases/ocr" element={<OCRProcurementPage />} />
              <Route path="purchases/history" element={<PurchaseHistoryPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="prescriptions" element={<PrescriptionsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="compliance" element={<CompliancePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppShell>
        </RequireAuth>
      } />
    </Routes>
  );
}
