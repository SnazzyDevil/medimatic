
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
  },
  {
    id: 2,
    type: "Expiring Soon",
    description: "Amoxicillin 500mg Capsules",
    severity: "Expires in 5 days",
    time: "2 hours ago",
    icon: Clock,
  },
];

export function RecentAlerts() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Recent Alerts</CardTitle>
        <p className="text-sm text-muted-foreground">System notifications</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start p-3 border border-l-4 rounded-lg hover:bg-healthcare-secondary transition-colors"
              style={{
                borderLeftColor: alert.type === "Low Stock" ? "#F44336" : "#FFC107",
              }}
            >
              <div className="flex-shrink-0 mr-3">
                <alert.icon 
                  className="h-5 w-5" 
                  color={alert.type === "Low Stock" ? "#F44336" : "#FFC107"} 
                />
              </div>
              <div className="flex-grow">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <h4 className="font-medium">{alert.type}</h4>
                  </div>
                  <p className="text-sm text-healthcare-gray">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={alert.type === "Low Stock" ? "outline" : "secondary"}
                      className={
                        alert.type === "Low Stock" 
                          ? "border-red-500 text-red-700 bg-red-50" 
                          : "border-amber-500 text-amber-700 bg-amber-50"
                      }
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
