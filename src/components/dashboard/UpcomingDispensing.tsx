
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
];

export function UpcomingDispensing() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Upcoming Dispensing</CardTitle>
        <p className="text-sm text-muted-foreground">Scheduled for today</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dispensingSchedule.map((schedule) => (
            <div
              key={schedule.id}
              className="flex flex-col p-4 border rounded-lg hover:bg-healthcare-secondary transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{schedule.patientName}</h4>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">{schedule.time}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    {schedule.status}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-healthcare-gray">{schedule.medication}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
