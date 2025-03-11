
import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const alerts = [
  {
    id: 1,
    type: "Low Stock",
    description: "IV Fluids - 0.9% Sodium Chloride",
    severity: "Critical",
    time: "15 minutes ago",
    icon: AlertTriangle,
    color: "#f43f5e", // rose-500
  },
  {
    id: 2,
    type: "Expiring Soon",
    description: "Amoxicillin 500mg Capsules",
    severity: "Expires in 5 days",
    time: "2 hours ago",
    icon: Clock,
    color: "#f59e0b", // amber-500
  },
  {
    id: 3,
    type: "Stock Warning",
    description: "Ibuprofen 200mg Tablets",
    severity: "Low Stock",
    time: "3 hours ago",
    icon: AlertTriangle,
    color: "#f97316", // orange-500
  },
];

export function RecentAlerts() {
  return (
    <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">Recent Alerts</CardTitle>
        <p className="text-sm text-muted-foreground">System notifications</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start p-3 border border-l-4 rounded-lg hover:bg-gray-50 transition-colors"
              style={{
                borderLeftColor: alert.color,
              }}
            >
              <div className="flex-shrink-0 mr-3">
                <alert.icon 
                  className="h-5 w-5" 
                  color={alert.color} 
                />
              </div>
              <div className="flex-grow">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-800">{alert.type}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline"
                      className="bg-white"
                      style={{
                        borderColor: alert.color,
                        color: alert.color
                      }}
                    >
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
