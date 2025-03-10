
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { InventoryLevels } from "@/components/dashboard/InventoryLevels";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { UpcomingDispensing } from "@/components/dashboard/UpcomingDispensing";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16"> {/* 16 = width of sidebar */}
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Dashboard</h1>
            <div className="flex gap-3">
              <Button variant="outline" className="btn-hover">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
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
          
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <UpcomingDispensing />
              </div>
              <div className="lg:col-span-1">
                <QuickActions />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
