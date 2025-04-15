
import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfToday } from "date-fns";
import { CalendarIcon, Clock, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { isSelectQueryError } from "@/utils/supabaseHelpers";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface AppointmentFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  currentUser?: any;  // Add current user prop
  editData?: any;
}

const APPOINTMENT_TYPES = [
  "Check-up",
  "Follow-up",
  "Consultation",
  "Physical", 
  "Vaccination",
  "Other"
];

const APPOINTMENT_TIMES = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", 
  "4:00 PM", "5:00 PM"
];

export function AppointmentForm({ onSubmit, onCancel, currentUser, editData }: AppointmentFormProps) {
  const [date, setDate] = useState<Date | undefined>(startOfToday());
  const [time, setTime] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchPatients = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Modified query to handle both cases: with user_id filter or without
        let query = supabase
          .from('patients')
          .select('id, first_name, last_name');
        
        // Only add the filter if user_id is not undefined or null
        if (currentUser.id) {
          query = query.eq('user_id', currentUser.id);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        console.log("Fetched patients:", data); 
        
        if (data && !isSelectQueryError(data) && data.length > 0) {
          const formattedPatients: Patient[] = data.map((patient) => ({
            id: String(patient.id),
            first_name: String(patient.first_name),
            last_name: String(patient.last_name)
          }));
          setPatients(formattedPatients);
          console.log("Formatted patients:", formattedPatients);
        } else {
          console.log("No patients found or empty result");
        }
      } catch (error) {
        console.error("Error loading patients:", error);
        toast({
          title: "Error",
          description: "Could not load patients.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [currentUser]);
  
  useEffect(() => {
    if (editData) {
      if (editData.date) setDate(new Date(editData.date));
      if (editData.time) setTime(editData.time);
      if (editData.type) setType(editData.type);
      if (editData.patientId) setPatientId(editData.patientId);
    }
  }, [editData]);
  
  useEffect(() => {
    const checkTimeSlots = async () => {
      if (!date || !currentUser) return;
      
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        
        const { data, error } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('appointment_date', dateStr)
          .eq('user_id', currentUser.id);  // Filter by user_id
        
        if (error) {
          throw error;
        }
        
        if (data && !isSelectQueryError(data)) {
          const times = data.map(item => item.appointment_time);
          setTakenSlots(times);
        }
      } catch (error) {
        console.error("Error checking time slots:", error);
      }
    };
    
    checkTimeSlots();
  }, [date, currentUser]);
  
  const isTimeSlotAvailable = (slot: string) => {
    return !takenSlots.includes(slot);
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!date || !time || !type || !patientId) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to create appointments.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const dateStr = format(date, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          appointment_date: dateStr,
          appointment_time: time,
          appointment_type: type,
          user_id: currentUser.id, 
          doctor: "Dr. Default" // Placeholder, could be from practice settings
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      const selectedPatient = patients.find(p => p.id === patientId);
      const patientName = selectedPatient 
        ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
        : "Unknown Patient";
      
      onSubmit({
        id: data[0].id,
        patientId,
        patientName,
        date,
        time,
        type
      });
      
    } catch (error: any) {
      console.error("Error saving appointment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save appointment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>Patient</Label>
        <Select value={patientId} onValueChange={setPatientId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a patient" />
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
        <Label>Date</Label>
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
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(date) => date < startOfToday()}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <Label>Time</Label>
        <Select value={time} onValueChange={setTime}>
          <SelectTrigger>
            <SelectValue placeholder="Select a time">
              {time ? (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {time}
                </div>
              ) : (
                "Select a time"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {APPOINTMENT_TIMES.map((slot) => (
              <SelectItem 
                key={slot} 
                value={slot} 
                disabled={!isTimeSlotAvailable(slot)}
                className="relative"
              >
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {slot}
                  {time === slot && <Check className="ml-auto h-4 w-4" />}
                  {!isTimeSlotAvailable(slot) && (
                    <span className="ml-auto text-xs text-destructive">Taken</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Appointment Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
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
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Appointment"}
        </Button>
      </div>
    </form>
  );
}
