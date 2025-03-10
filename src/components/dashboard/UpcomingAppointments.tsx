
import { Calendar, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const appointments = [
  {
    id: 1,
    patientName: "Emily Johnson",
    appointmentType: "Check-up",
    date: "Today",
    time: "2:30 PM",
    status: "Confirmed"
  },
  {
    id: 2,
    patientName: "Robert Garcia",
    appointmentType: "Follow-up",
    date: "Today",
    time: "4:15 PM",
    status: "Confirmed"
  },
  {
    id: 3,
    patientName: "Sofia Chen",
    appointmentType: "Consultation",
    date: "Tomorrow",
    time: "10:00 AM",
    status: "Pending"
  }
];

export function UpcomingAppointments() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Upcoming Appointments</CardTitle>
        <p className="text-sm text-muted-foreground">Next scheduled visits</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex flex-col p-4 border rounded-lg hover:bg-healthcare-secondary transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{appointment.patientName}</h4>
                <Badge 
                  variant={appointment.status === "Confirmed" ? "default" : "outline"} 
                  className={appointment.status === "Confirmed" ? "bg-green-100 text-green-800 border-green-300" : "bg-yellow-50 text-yellow-800 border-yellow-300"}
                >
                  {appointment.status}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-healthcare-gray mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                {appointment.date}
              </div>
              <div className="flex items-center text-sm text-healthcare-gray mt-1">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                {appointment.time}
              </div>
              <div className="flex items-center text-sm text-healthcare-gray mt-1">
                <User className="h-3.5 w-3.5 mr-1.5" />
                {appointment.appointmentType}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
