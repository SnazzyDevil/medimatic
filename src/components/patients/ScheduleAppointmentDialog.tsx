
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleAppointment: (appointment: {
    date: string;
    time: string;
    type: string;
    doctor: string;
    notes: string;
  }) => void;
  patientId?: string;
}

export function ScheduleAppointmentDialog({
  isOpen,
  onClose,
  onScheduleAppointment,
  patientId,
}: ScheduleAppointmentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    type: "",
    doctor: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!appointmentData.date || !appointmentData.time || !appointmentData.type || !appointmentData.doctor) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!patientId) {
      toast({
        title: "Error",
        description: "Patient ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          appointment_date: appointmentData.date,
          appointment_time: appointmentData.time,
          appointment_type: appointmentData.type,
          doctor: appointmentData.doctor,
        });
      
      if (error) throw error;
      
      // Call onScheduleAppointment to update UI
      onScheduleAppointment(appointmentData);
      
      // Reset form
      setAppointmentData({
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        type: "",
        doctor: "",
        notes: "",
      });
      
      onClose();
      
      toast({
        title: "Appointment scheduled",
        description: `Appointment on ${appointmentData.date} at ${appointmentData.time} has been scheduled.`,
      });
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast({
        title: "Error",
        description: "Failed to schedule appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Enter the details to schedule a new appointment for the patient.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={appointmentData.date}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={appointmentData.time}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Appointment Type
              </Label>
              <Input
                id="type"
                name="type"
                value={appointmentData.type}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Regular Check-up, Follow-up, etc."
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctor" className="text-right">
                Doctor
              </Label>
              <Input
                id="doctor"
                name="doctor"
                value={appointmentData.doctor}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={appointmentData.notes}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
                placeholder="Additional information about the appointment"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
