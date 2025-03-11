
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const APPOINTMENT_TYPES = [
  "Check-up",
  "Follow-up",
  "Consultation",
  "Physical",
  "Vaccination",
  "Other"
];

const TIME_SLOTS = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", 
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM"
];

interface AppointmentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AppointmentForm({ onSubmit, onCancel }: AppointmentFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [patientName, setPatientName] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const appointmentData = {
      date,
      time,
      patientName,
      appointmentType
    };
    
    onSubmit(appointmentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time">Time</Label>
        <Select onValueChange={setTime} defaultValue={time}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select time">
              {time ? (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {time}
                </div>
              ) : (
                "Select time"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TIME_SLOTS.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="patientName">Patient Name</Label>
        <Input
          id="patientName"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Enter patient name"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="appointmentType">Type of Visit</Label>
        <Select onValueChange={setAppointmentType} defaultValue={appointmentType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select appointment type" />
          </SelectTrigger>
          <SelectContent>
            {APPOINTMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="btn-hover"
        >
          Create Appointment
        </Button>
      </div>
    </form>
  );
}
