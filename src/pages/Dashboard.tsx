
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
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { doctorSettings } = useDoctorSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  
  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container pb-10">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl p-6 mb-8 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-bold text-3xl mb-2">Good morning, {doctorSettings.name}</h1>
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
                  <AvatarImage src={doctorSettings.practiceImage} alt={doctorSettings.practiceName} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {doctorSettings.practiceName.split(' ').map(n => n[0]).join('')}
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
