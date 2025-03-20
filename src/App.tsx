
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { DoctorSettingsProvider } from '@/components/layout/Header';
import './App.css';

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Patients = lazy(() => import('@/pages/Patients'));
const PatientDetail = lazy(() => import('@/pages/PatientDetail'));
const AddPatient = lazy(() => import('@/pages/AddPatient'));
const Scheduler = lazy(() => import('@/pages/Scheduler'));
const Dispensing = lazy(() => import('@/pages/Dispensing'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const Billing = lazy(() => import('@/pages/Billing'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const Index = lazy(() => import('@/pages/Index'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DoctorSettingsProvider>
        <Router>
          <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/add-patient" element={<AddPatient />} />
              <Route path="/scheduler" element={<Scheduler />} />
              <Route path="/dispensing" element={<Dispensing />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </Router>
      </DoctorSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
