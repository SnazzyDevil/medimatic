
import { Activity, Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const activityItems = [
  {
    id: 1,
    action: "Prescription filled",
    patient: "Emily Johnson",
    time: "10:15 AM",
    date: "Today"
  },
  {
    id: 2,
    action: "New patient registered",
    patient: "Michael Brown",
    time: "9:30 AM",
    date: "Today"
  },
  {
    id: 3,
    action: "Inventory updated",
    item: "Amoxicillin 500mg",
    time: "Yesterday",
    date: "5:45 PM"
  },
  {
    id: 4,
    action: "Appointment rescheduled",
    patient: "Sarah Williams",
    time: "Yesterday",
    date: "3:20 PM"
  }
];

export function RecentActivity() {
  return (
    <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <Activity className="h-5 w-5 text-rose-500" />
          Recent Activity
        </CardTitle>
        <p className="text-sm text-muted-foreground">Latest system activities</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {activityItems.map((item) => (
            <div key={item.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between">
                <h4 className="font-medium text-gray-800">{item.action}</h4>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{item.time}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {item.patient ? `Patient: ${item.patient}` : `Item: ${item.item}`}
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{item.date}</span>
              </div>
            </div>
          ))}
          
          <Button variant="ghost" size="sm" className="w-full justify-between mt-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
            View all activity
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
