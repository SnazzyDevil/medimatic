
import { PlusCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
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
              <Button className="btn-hover">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </div>
          </div>
          
          <section className="mb-8">
            <DashboardStats />
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <UpcomingAppointments />
              </div>
              <div className="lg:col-span-1">
                <div className="h-full bg-healthcare-highlight rounded-xl p-6 flex flex-col justify-center items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <PlusCircle className="h-8 w-8 text-healthcare-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Ready to streamline your practice?
                  </h3>
                  <p className="text-healthcare-gray mb-4 max-w-xs">
                    Explore our AI-powered tools for predictive diagnostics and advanced patient analytics.
                  </p>
                  <Button className="btn-hover">Learn More</Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
