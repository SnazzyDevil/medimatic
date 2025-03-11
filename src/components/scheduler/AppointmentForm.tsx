import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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

const END_TIME_MAP: Record<string, string> = {
  "8:00 AM": "8:30 AM",
  "8:30 AM": "9:00 AM", 
  "9:00 AM": "9:30 AM", 
  "9:30 AM": "10:00 AM", 
  "10:00 AM": "10:30 AM", 
  "10:30 AM": "11:00 AM", 
  "11:00 AM": "11:30 AM", 
  "11:30 AM": "12:00 PM", 
  "12:00 PM": "12:30 PM", 
  "12:30 PM": "1:00 PM", 
  "1:00 PM": "1:30 PM", 
  "1:30 PM": "2:00 PM", 
  "2:00 PM": "2:30 PM", 
  "2:30 PM": "3:00 PM", 
  "3:00 PM": "3:30 PM", 
  "3:30 PM": "4:00 PM", 
  "4:00 PM": "4:30 PM", 
  "4:30 PM": "5:00 PM", 
  "5:00 PM": "5:30 PM"
};

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface AppointmentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function AppointmentForm({ onSubmit, onCancel }: AppointmentFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(TIME_SLOTS);
  const [availableEndTimeSlots, setAvailableEndTimeSlots] = useState<string[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState<boolean>(false);

  useEffect(() => {
    async function fetchPatients() {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .order('last_name', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setPatients(data || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPatients();
  }, []);

  useEffect(() => {
    if (date) {
      checkBookedTimeSlots(date);
    }
  }, [date]);

  useEffect(() => {
    if (time) {
      setEndTime("");
      
      const selectedIndex = TIME_SLOTS.findIndex(slot => slot === time);
      
      if (selectedIndex !== -1 && selectedIndex < TIME_SLOTS.length - 1) {
        const validEndTimeSlots = TIME_SLOTS.filter((_, index) => index > selectedIndex);
        setAvailableEndTimeSlots(validEndTimeSlots);
      } else {
        setAvailableEndTimeSlots([]);
      }
    } else {
      setEndTime("");
      setAvailableEndTimeSlots([]);
    }
  }, [time]);

  const checkBookedTimeSlots = async (selectedDate: Date) => {
    setIsCheckingAvailability(true);
    setValidationError(null);
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('appointment_date', formattedDate);
      
      if (error) {
        throw error;
      }
      
      const bookedTimes = data?.map(appointment => appointment.appointment_time) || [];
      const available = TIME_SLOTS.filter(slot => !bookedTimes.includes(slot));
      
      setAvailableTimeSlots(available);
      
      if (time && bookedTimes.includes(time)) {
        setTime("");
        setEndTime("");
        setValidationError("Your previously selected time is no longer available");
      }
    } catch (err) {
      console.error('Error checking appointment availability:', err);
      setError('Failed to check appointment availability. Please try again.');
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!date || !time || !endTime || !patientId || !appointmentType) {
      setValidationError("Please fill in all required fields");
      return;
    }
    
    const startTimeIndex = TIME_SLOTS.indexOf(time);
    const endTimeIndex = TIME_SLOTS.indexOf(endTime);
    
    if (startTimeIndex >= endTimeIndex) {
      setValidationError("End time must be after start time");
      return;
    }
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('appointment_date', formattedDate)
        .eq('appointment_time', time)
        .single();
      
      if (data) {
        setValidationError("This time slot has just been booked. Please select another time.");
        await checkBookedTimeSlots(date);
        return;
      }
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      const selectedPatient = patients.find(p => p.id === patientId);
      
      const appointmentData = {
        date,
        time,
        endTime,
        patientId,
        patientName: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : '',
        appointmentType,
        formattedDate: format(date, 'yyyy-MM-dd')
      };
      
      const { error: insertError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          appointment_date: format(date, 'yyyy-MM-dd'),
          appointment_time: time,
          appointment_type: appointmentType
        });
      
      if (insertError) {
        console.error('Error inserting appointment:', insertError);
        if (insertError.code === '23505') {
          setValidationError("This time slot has just been booked. Please select another time.");
          await checkBookedTimeSlots(date);
          return;
        }
        throw insertError;
      }
      
      onSubmit(appointmentData);
    } catch (err) {
      console.error('Error saving appointment:', err);
      setValidationError("Failed to save appointment. Please try again.");
    }
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
        <Label htmlFor="time">From</Label>
        {isCheckingAvailability && (
          <div className="text-sm text-muted-foreground">
            Checking available time slots...
          </div>
        )}
        <Select onValueChange={setTime} value={time} disabled={isCheckingAvailability}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select start time">
              {time ? (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {time}
                </div>
              ) : (
                "Select start time"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm">
                No available time slots for this date
              </div>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endTime">To</Label>
        <Select onValueChange={setEndTime} value={endTime} disabled={!time}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select end time">
              {endTime ? (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {endTime}
                </div>
              ) : (
                "Select end time"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableEndTimeSlots.length > 0 ? (
              availableEndTimeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-sm">
                Select a start time first
              </div>
            )}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground">
          Select any end time after your start time
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="patientId">Patient Name</Label>
        {error && (
          <div className="flex items-center text-destructive text-sm mb-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
        <Select onValueChange={setPatientId} value={patientId}>
          <SelectTrigger className="w-full" disabled={isLoading}>
            <SelectValue placeholder={isLoading ? "Loading patients..." : "Select patient"} />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="appointmentType">Type of Visit</Label>
        <Select onValueChange={setAppointmentType} value={appointmentType}>
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
      
      {validationError && (
        <div className="flex items-center text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {validationError}
        </div>
      )}
      
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
          disabled={isLoading || isCheckingAvailability || !patientId || !time || !endTime || !appointmentType}
        >
          Create Appointment
        </Button>
      </div>
    </form>
  );
}
