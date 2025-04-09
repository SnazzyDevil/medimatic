
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { initSessionTimeout } from "@/utils/sessionTimeout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import AddPatient from "./pages/AddPatient";
import PatientDetail from "./pages/PatientDetail";
import Scheduler from "./pages/Scheduler";
import Billing from "./pages/Billing";
import Inventory from "./pages/Inventory";
import Dispensing from "./pages/Dispensing";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Move QueryClient instantiation inside the App component to ensure
// it's properly scoped and doesn't cause hook errors
const App = () => {
  // Create a new client for each component instance
  const queryClient = new QueryClient();
  
  useEffect(() => {
    // Initialize session timeout (30 minutes)
    const cleanupTimeout = initSessionTimeout(30 * 60 * 1000);
    
    return () => {
      cleanupTimeout();
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/patients/new" element={<AddPatient />} />
                <Route path="/patients/:id" element={<PatientDetail />} />
                <Route path="/scheduler" element={<Scheduler />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/dispensing" element={<Dispensing />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
