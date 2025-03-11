
import { useState } from "react";
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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", 
  "4:00 PM", "5:00 PM"
];

// Sample appointments
const APPOINTMENTS = [
  { 
    id: 1, 
    patientName: "Sarah Johnson", 
    time: "9:00 AM", 
    duration: 30, 
    day: 0, // Monday
    type: "Check-up",
    color: "bg-blue-100 border-blue-300 text-blue-800"
  },
  { 
    id: 2, 
    patientName: "Michael Chen", 
    time: "11:00 AM", 
    duration: 45, 
    day: 0, // Monday
    type: "Follow-up",
    color: "bg-violet-100 border-violet-300 text-violet-800"
  },
  { 
    id: 3, 
    patientName: "Emma Wilson", 
    time: "2:00 PM", 
    duration: 60, 
    day: 1, // Tuesday
    type: "Consultation",
    color: "bg-emerald-100 border-emerald-300 text-emerald-800"
  },
  { 
    id: 4, 
    patientName: "David Miller", 
    time: "10:00 AM", 
    duration: 30, 
    day: 2, // Wednesday
    type: "Physical",
    color: "bg-amber-100 border-amber-300 text-amber-800"
  },
  { 
    id: 5, 
    patientName: "Olivia Davis", 
    time: "3:00 PM", 
    duration: 30, 
    day: 4, // Friday
    type: "Check-up",
    color: "bg-blue-100 border-blue-300 text-blue-800"
  },
];

interface SchedulerCalendarProps {
  onNewAppointment?: () => void;
}

export function SchedulerCalendar({ onNewAppointment }: SchedulerCalendarProps = {}) {
  const [currentWeek, setCurrentWeek] = useState("June 12 - 18, 2023");
  
  // Function to get appointments for a specific day and time
  const getAppointmentForTime = (day: number, time: string) => {
    return APPOINTMENTS.find(
      app => app.day === day && app.time === time
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
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium px-2">{currentWeek}</div>
          <Button variant="outline" size="sm">
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
            {DAYS.map((day, index) => (
              <div 
                key={day} 
                className={cn(
                  "p-3 text-center font-medium border-r last:border-r-0",
                  index === 0 && "bg-healthcare-highlight text-healthcare-primary"
                )}
              >
                {day}
                <div className="text-sm font-normal text-healthcare-gray">
                  {/* This would normally be calculated based on the current week */}
                  June {12 + index}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-8">
            {/* Time column */}
            <div className="border-r">
              {HOURS.map((hour) => (
                <div key={hour} className="border-b last:border-b-0 p-2 h-20 text-center">
                  <span className="text-sm text-healthcare-gray">
                    {hour}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Days columns */}
            {DAYS.map((_, dayIndex) => (
              <div key={dayIndex} className="border-r last:border-r-0">
                {HOURS.map((hour) => {
                  const appointment = getAppointmentForTime(dayIndex, hour);
                  
                  return (
                    <div 
                      key={hour} 
                      className={cn(
                        "border-b last:border-b-0 h-20 p-1 relative",
                        dayIndex === 0 && "bg-healthcare-highlight/20"
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
                            {appointment.time} ({appointment.duration} min)
                          </div>
                          <div className="flex items-center text-xs mt-0.5">
                            <User className="h-3 w-3 mr-1" />
                            <Badge variant="outline" className="text-[10px] py-0 h-4">
                              {appointment.type}
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
