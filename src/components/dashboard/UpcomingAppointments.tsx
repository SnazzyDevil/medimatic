
import { 
  Calendar,
  Clock,
  MoreVertical,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample data for upcoming appointments
const appointments = [
  {
    id: 1,
    patientName: "Sarah Johnson",
    time: "9:00 AM",
    date: "Today",
    type: "Check-up",
    status: "confirmed",
    avatar: "SJ",
  },
  {
    id: 2,
    patientName: "Michael Chen",
    time: "10:30 AM",
    date: "Today",
    type: "Follow-up",
    status: "confirmed",
    avatar: "MC",
  },
  {
    id: 3,
    patientName: "Emma Wilson",
    time: "2:15 PM",
    date: "Today",
    type: "Consultation",
    status: "pending",
    avatar: "EW",
  },
  {
    id: 4,
    patientName: "David Miller",
    time: "11:00 AM",
    date: "Tomorrow",
    type: "Physical",
    status: "confirmed",
    avatar: "DM",
  },
];

export function UpcomingAppointments() {
  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Upcoming Appointments</CardTitle>
        <Button variant="outline" size="sm" className="btn-hover">
          <Calendar className="h-4 w-4 mr-2" />
          View Calendar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="flex items-center p-3 rounded-lg hover:bg-healthcare-secondary transition-colors group"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-healthcare-primary text-white flex items-center justify-center mr-4">
                {appointment.avatar}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center">
                  <h4 className="font-medium text-healthcare-accent group-hover:text-healthcare-primary transition-colors">
                    {appointment.patientName}
                  </h4>
                  <Badge variant={appointment.status === "confirmed" ? "default" : "outline"} className="ml-2">
                    {appointment.status}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <div className="flex items-center mr-4">
                    <Clock className="h-3.5 w-3.5 mr-1 text-healthcare-gray" />
                    {appointment.time}
                  </div>
                  <div className="flex items-center mr-4">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-healthcare-gray" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center">
                    <User className="h-3.5 w-3.5 mr-1 text-healthcare-gray" />
                    {appointment.type}
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
