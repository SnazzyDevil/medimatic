
import { Settings, Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { InventoryLevels } from "@/components/dashboard/InventoryLevels";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { UpcomingDispensing } from "@/components/dashboard/UpcomingDispensing";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { PaymentSummary } from "@/components/dashboard/PaymentSummary";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Header, useDoctorSettings } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PracticeService } from "@/services/practiceService";
import { PracticeInformation } from "@/types/practice";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { doctorSettings } = useDoctorSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { autoLogout } = useAuth();
  const [practiceInfo, setPracticeInfo] = useState<PracticeInformation | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Add event listener for when user navigates away or closes the browser
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Log a message to console for debugging
      console.log("User is leaving dashboard - initiating auto logout");
      
      // We need to handle this synchronously because the page is about to unload
      // Store a flag in localStorage indicating that a logout should happen on next page load
      localStorage.setItem('medimatic_auto_logout', 'true');
    };

    // Add event listener for page close/navigation
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Check if we need to auto-logout from a previous session
    const shouldAutoLogout = localStorage.getItem('medimatic_auto_logout');
    if (shouldAutoLogout === 'true') {
      console.log("Auto-logout flag detected from previous session");
      // Clear the flag
      localStorage.removeItem('medimatic_auto_logout');
      // Perform auto logout
      autoLogout().then(() => {
        console.log("Auto logout completed from previous session");
        navigate('/');
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoLogout, navigate]);
  
  // Fetch practice information to display the correct doctor name
  useEffect(() => {
    const fetchPracticeInfo = async () => {
      try {
        setLoading(true);
        const info = await PracticeService.getCurrentPractice();
        setPracticeInfo(info);
        console.log("Fetched practice info for dashboard:", info);
      } catch (error) {
        console.error("Error fetching practice information:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeInfo();
  }, []);
  
  // Log doctor settings to verify they're being loaded correctly
  useEffect(() => {
    console.log("Doctor settings loaded:", doctorSettings);
  }, [doctorSettings]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Get the doctor name from practice info or fallback to settings
  const doctorName = practiceInfo?.doctorName || doctorSettings.name;
  
  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container pb-10">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl p-6 mb-8 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-bold text-3xl mb-2">
                  Good morning, {doctorName}
                </h1>
                <p className="text-violet-100">Here are your important tasks, updates and alerts for today</p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
                <Avatar className="h-12 w-12 border-2 border-white/30">
                  <AvatarImage src={doctorSettings.practiceImage} alt={practiceInfo?.name || doctorSettings.practiceName} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {(practiceInfo?.name || doctorSettings.practiceName).split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
          
          <section className="mb-8">
            <DashboardStats />
          </section>
          
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InventoryLevels />
              </div>
              <div className="lg:col-span-1">
                <RecentAlerts />
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <UpcomingDispensing />
              </div>
              <div className="lg:col-span-1">
                <UpcomingAppointments />
              </div>
              <div className="lg:col-span-1">
                <PaymentSummary />
              </div>
            </div>
          </section>
          
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <QuickActions />
              </div>
              <div className="lg:col-span-1">
                <RecentActivity />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
