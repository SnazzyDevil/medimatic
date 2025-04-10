
import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, addDays, startOfWeek } from "date-fns";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", 
  "4:00 PM", "5:00 PM"
];

const APPOINTMENT_TYPE_COLORS = {
  "Check-up": "bg-blue-100 border-blue-300 text-blue-800",
  "Follow-up": "bg-violet-100 border-violet-300 text-violet-800",
  "Consultation": "bg-emerald-100 border-emerald-300 text-emerald-800",
  "Physical": "bg-amber-100 border-amber-300 text-amber-800",
  "Vaccination": "bg-pink-100 border-pink-300 text-pink-800",
  "Other": "bg-gray-100 border-gray-300 text-gray-800"
};

interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  user_id?: string;
  patientName?: string;
  color?: string;
  day?: number;
}

interface SchedulerCalendarProps {
  onNewAppointment?: () => void;
  refreshTrigger?: number;
}

export function SchedulerCalendar({ onNewAppointment, refreshTrigger = 0 }: SchedulerCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [formattedWeek, setFormattedWeek] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
      
      if (data.user) {
        console.log("Fetching appointments for user:", data.user.id);
      }
    };

    getCurrentUser();
  }, []);
  
  useEffect(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
    const weekEnd = addDays(weekStart, 6); // Sunday
    
    setFormattedWeek(`${format(weekStart, "MMMM d")} - ${format(weekEnd, "d, yyyy")}`);
    
    if (currentUser?.id) {
      fetchAppointments(weekStart, weekEnd);
    }
  }, [currentWeek, refreshTrigger, currentUser]);
  
  const fetchAppointments = async (startDate: Date, endDate: Date) => {
    setLoading(true);
    
    try {
      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");
      
      console.log("Fetching appointments between", startDateStr, "and", endDateStr);
      
      // Add user_id filter to only fetch appointments for the current user
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, patient_id, appointment_date, appointment_time, appointment_type')
        .gte('appointment_date', startDateStr)
        .lte('appointment_date', endDateStr)
        .eq('user_id', currentUser.id); // Filter by current user ID
      
      if (appointmentsError) {
        throw appointmentsError;
      }
      
      console.log("Fetched appointments:", appointmentsData?.length || 0);
      
      if (!appointmentsData || appointmentsData.length === 0) {
        setAppointments([]);
        setLoading(false);
        return;
      }
      
      const patientIds = [...new Set(appointmentsData.map(app => app.patient_id))];
      
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .in('id', patientIds)
        .eq('user_id', currentUser.id); // Also filter patients by current user ID
      
      if (patientsError) {
        throw patientsError;
      }
      
      const patientMap: Record<string, string> = {};
      if (patientsData) {
        patientsData.forEach(patient => {
          if (patient && patient.id && patient.first_name && patient.last_name) {
            patientMap[patient.id] = `${patient.first_name} ${patient.last_name}`;
          }
        });
      }
      
      const processedAppointments = appointmentsData.map(app => {
        const appointmentDate = parseISO(app.appointment_date);
        const dayIndex = (appointmentDate.getDay() === 0) ? 6 : appointmentDate.getDay() - 1;
        
        const result: Appointment = {
          id: app.id,
          patient_id: app.patient_id,
          appointment_date: app.appointment_date,
          appointment_time: app.appointment_time,
          appointment_type: app.appointment_type,
          patientName: patientMap[app.patient_id] || "Unknown Patient",
          color: APPOINTMENT_TYPE_COLORS[app.appointment_type as keyof typeof APPOINTMENT_TYPE_COLORS] || APPOINTMENT_TYPE_COLORS.Other,
          day: dayIndex,
        };
        
        return result;
      });
      
      setAppointments(processedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const previousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };
  
  const nextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };
  
  const getAppointmentForTime = (day: number, time: string) => {
    return appointments.find(
      app => app.day === day && app.appointment_time === time
    );
  };
  
  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-healthcare-primary" />
          <h2 className="text-xl font-semibold">Schedule</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium px-2">{formattedWeek}</div>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            className="ml-2 btn-hover"
            onClick={onNewAppointment}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Appointment
          </Button>
        </div>
      </div>
      
      <Card className="animate-fade-in border border-healthcare-gray-light">
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b">
            <div className="p-3 border-r bg-healthcare-secondary"></div>
            {DAYS.map((day, index) => {
              const date = addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), index);
              const isToday = format(new Date(), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
              
              return (
                <div 
                  key={day} 
                  className={cn(
                    "p-3 text-center font-medium border-r last:border-r-0",
                    isToday && "bg-healthcare-highlight text-healthcare-primary"
                  )}
                >
                  {day}
                  <div className="text-sm font-normal text-healthcare-gray">
                    {format(date, "MMM d")}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-8">
            <div className="border-r">
              {HOURS.map((hour) => (
                <div key={hour} className="border-b last:border-b-0 p-2 h-20 text-center">
                  <span className="text-sm text-healthcare-gray">
                    {hour}
                  </span>
                </div>
              ))}
            </div>
            
            {DAYS.map((_, dayIndex) => {
              const date = addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), dayIndex);
              const isToday = format(new Date(), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
              
              return (
                <div key={dayIndex} className="border-r last:border-r-0">
                  {HOURS.map((hour) => {
                    const appointment = getAppointmentForTime(dayIndex, hour);
                    
                    return (
                      <div 
                        key={hour} 
                        className={cn(
                          "border-b last:border-b-0 h-20 p-1 relative",
                          isToday && "bg-healthcare-highlight/20"
                        )}
                      >
                        {appointment ? (
                          <div 
                            className={cn(
                              "absolute inset-1 rounded-md p-2 border card-hover cursor-pointer",
                              appointment.color
                            )}
                          >
                            <div className="font-medium text-sm truncate">{appointment.patientName}</div>
                            <div className="flex items-center text-xs mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {appointment.appointment_time} (30 min)
                            </div>
                            <div className="flex items-center text-xs mt-0.5">
                              <User className="h-3 w-3 mr-1" />
                              <Badge variant="outline" className="text-[10px] py-0 h-4">
                                {appointment.appointment_type}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 absolute right-1 top-1 opacity-0 hover:opacity-100 transition-opacity"
                            onClick={onNewAppointment}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
