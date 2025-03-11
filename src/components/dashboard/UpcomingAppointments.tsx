
import { Calendar, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const appointments = [
  {
    id: 1,
    patientName: "Emily Johnson",
    appointmentType: "Check-up",
    date: "Today",
    time: "2:30 PM",
    status: "Confirmed",
    avatar: "https://i.pravatar.cc/100?img=1"
  },
  {
    id: 2,
    patientName: "Robert Garcia",
    appointmentType: "Follow-up",
    date: "Today",
    time: "4:15 PM",
    status: "Confirmed",
    avatar: "https://i.pravatar.cc/100?img=3"
  },
  {
    id: 3,
    patientName: "Sofia Chen",
    appointmentType: "Consultation",
    date: "Tomorrow",
    time: "10:00 AM",
    status: "Pending",
    avatar: "https://i.pravatar.cc/100?img=5"
  }
];

export function UpcomingAppointments() {
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
                  {appointment.date}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Clock className="h-3.5 w-3.5 mr-1.5 text-violet-400" />
                  {appointment.time}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <User className="h-3.5 w-3.5 mr-1.5 text-violet-400" />
                  {appointment.appointmentType}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
