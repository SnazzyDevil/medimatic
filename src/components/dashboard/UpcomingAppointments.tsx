
import { useState, useEffect } from "react";
import { Calendar, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isToday, addDays, isTomorrow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Appointment {
  id: string;
  patient_id: string;
  patientName: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  avatar?: string;
  displayDate?: string; // Add this property to fix the type error
}

export function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Get today's date in ISO format for database comparison
        const today = new Date();
        const todayStr = format(today, "yyyy-MM-dd");
        const nextWeekStr = format(addDays(today, 7), "yyyy-MM-dd");
        
        // Fetch upcoming appointments for the next 7 days
        const { data: appointmentsData, error } = await supabase
          .from('appointments')
          .select('id, patient_id, appointment_date, appointment_time, appointment_type')
          .gte('appointment_date', todayStr)
          .lte('appointment_date', nextWeekStr)
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true })
          .limit(3); // Only show the next 3 appointments
        
        if (error) {
          console.error("Error fetching appointments:", error);
          return;
        }
        
        if (!appointmentsData || appointmentsData.length === 0) {
          setAppointments([]);
          setLoading(false);
          return;
        }
        
        // Fetch patient details for each appointment
        const patientIds = appointmentsData.map(app => app.patient_id);
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .in('id', patientIds);
          
        if (patientsError) {
          console.error("Error fetching patient details:", patientsError);
          return;
        }
        
        // Create a map of patient IDs to names
        const patientMap = patientsData ? patientsData.reduce((acc, patient) => {
          acc[patient.id] = `${patient.first_name} ${patient.last_name}`;
          return acc;
        }, {}) : {};
        
        // Transform the data for display
        const formattedAppointments = appointmentsData.map(app => {
          const appointmentDate = new Date(app.appointment_date);
          let dateDisplay = '';
          
          if (isToday(appointmentDate)) {
            dateDisplay = 'Today';
          } else if (isTomorrow(appointmentDate)) {
            dateDisplay = 'Tomorrow';
          } else {
            dateDisplay = format(appointmentDate, 'EEE, MMM d');
          }
          
          // Get avatar placeholder for this patient
          const avatarIndex = Math.floor(Math.random() * 10) + 1; // Random avatar for demo purposes
          
          return {
            id: app.id,
            patient_id: app.patient_id,
            patientName: patientMap[app.patient_id] || "Unknown Patient",
            appointment_date: app.appointment_date,
            appointment_time: app.appointment_time,
            appointment_type: app.appointment_type,
            displayDate: dateDisplay, // Ensure this property is added to the return object
            status: isToday(appointmentDate) ? "Confirmed" : "Pending",
            avatar: `https://i.pravatar.cc/100?img=${avatarIndex}`
          };
        });
        
        setAppointments(formattedAppointments);
      } catch (error) {
        console.error("Error processing appointments data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  return (
    <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <Calendar className="h-5 w-5 text-violet-500" />
          Upcoming Appointments
        </CardTitle>
        <p className="text-sm text-muted-foreground">Next scheduled visits</p>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 border rounded-lg">
                <div className="flex items-start">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start p-4 border rounded-lg hover:bg-violet-50 transition-colors"
              >
                <Avatar className="h-10 w-10 mr-3 border border-violet-200">
                  <AvatarImage src={appointment.avatar} alt={appointment.patientName} />
                  <AvatarFallback className="bg-violet-100 text-violet-700">
                    {appointment.patientName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-gray-800">{appointment.patientName}</h4>
                    <Badge 
                      variant={appointment.status === "Confirmed" ? "default" : "outline"} 
                      className={appointment.status === "Confirmed" ? 
                        "bg-green-100 text-green-800 border-green-300 hover:bg-green-200" : 
                        "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-violet-400" />
                    {appointment.displayDate}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1.5 text-violet-400" />
                    {appointment.appointment_time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <User className="h-3.5 w-3.5 mr-1.5 text-violet-400" />
                    {appointment.appointment_type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
