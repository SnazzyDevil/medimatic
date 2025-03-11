
import { Settings, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { InventoryLevels } from "@/components/dashboard/InventoryLevels";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { UpcomingDispensing } from "@/components/dashboard/UpcomingDispensing";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { PaymentSummary } from "@/components/dashboard/PaymentSummary";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container pb-10">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl p-6 mb-8 shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-bold text-3xl mb-2">Good morning, Dr. Anderson</h1>
                <p className="text-violet-100">Here are your important tasks, updates and alerts for today</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="bg-white/20 border-white/10 text-white hover:bg-white/30">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Avatar className="h-12 w-12 border-2 border-white/30">
                  <AvatarImage src="https://i.pravatar.cc/100?img=11" alt="User" />
                  <AvatarFallback>DR</AvatarFallback>
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
