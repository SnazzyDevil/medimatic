
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Clock } from "lucide-react";

const dispensingSchedule = [
  {
    id: 1,
    patientName: "John Smith",
    medication: "Lisinopril 20mg",
    time: "10:30 AM",
    status: "Scheduled",
  },
  {
    id: 2,
    patientName: "Maria Garcia",
    medication: "Metformin 500mg",
    time: "11:15 AM",
    status: "Scheduled",
  },
  {
    id: 3,
    patientName: "David Johnson",
    medication: "Atorvastatin 40mg",
    time: "1:45 PM",
    status: "Scheduled",
  },
];

export function UpcomingDispensing() {
  return (
    <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <Pill className="h-5 w-5 text-indigo-500" />
          Upcoming Dispensing
        </CardTitle>
        <p className="text-sm text-muted-foreground">Scheduled for today</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {dispensingSchedule.map((schedule) => (
            <div
              key={schedule.id}
              className="flex flex-col p-4 border rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800">{schedule.patientName}</h4>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2 text-gray-600">{schedule.time}</span>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                    {schedule.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Pill className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                <p className="text-sm">{schedule.medication}</p>
              </div>
              <div className="flex items-center text-gray-500 mt-1 text-xs">
                <Clock className="h-3 w-3 mr-1.5" />
                Today at {schedule.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
