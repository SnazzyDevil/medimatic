
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SchedulerCalendar } from "@/components/scheduler/Calendar";

const Scheduler = () => {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Scheduler</h1>
            <Button className="btn-hover">
              <CalendarPlus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
          
          <SchedulerCalendar />
        </main>
      </div>
    </div>
  );
};

export default Scheduler;
