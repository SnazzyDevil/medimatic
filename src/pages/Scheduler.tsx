
import { useState } from "react";
import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SchedulerCalendar } from "@/components/scheduler/Calendar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/scheduler/AppointmentForm";
import { toast } from "@/components/ui/use-toast";

const Scheduler = () => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const handleNewAppointment = () => {
    setShowAppointmentForm(true);
  };

  const handleFormSubmit = (data: any) => {
    console.log("New appointment data:", data);
    
    // Here you would normally save the appointment to your database
    // For now, we'll just show a success message
    toast({
      title: "Appointment Scheduled",
      description: `Appointment for ${data.patientName} on ${data.date.toDateString()} at ${data.time} has been scheduled.`,
    });
    
    setShowAppointmentForm(false);
  };

  const handleFormCancel = () => {
    setShowAppointmentForm(false);
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Scheduler</h1>
            <Button 
              className="btn-hover"
              onClick={handleNewAppointment}
            >
              <CalendarPlus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
          
          <SchedulerCalendar onNewAppointment={handleNewAppointment} />
          
          <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>New Appointment</DialogTitle>
              </DialogHeader>
              <AppointmentForm 
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Scheduler;
