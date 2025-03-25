
import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch alerts from inventory data
const fetchInventoryAlerts = async () => {
  // Get low stock items
  const { data: lowStockData, error: lowStockError } = await supabase
    .from('inventory')
    .select('id, name, stock, threshold, category')
    .lt('stock', 10)
    .limit(5);
  
  if (lowStockError) throw lowStockError;
  
  // Get expiring items (within 30 days)
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const { data: expiringData, error: expiringError } = await supabase
    .from('inventory')
    .select('id, name, expiry_date, category')
    .lt('expiry_date', thirtyDaysLater.toISOString().split('T')[0])
    .gt('expiry_date', new Date().toISOString().split('T')[0])
    .limit(2);
  
  if (expiringError) throw expiringError;
  
  // Format alerts
  const alerts = [];
  
  // Add low stock alerts
  lowStockData.forEach(item => {
    if (item.stock === 0) {
      alerts.push({
        id: item.id,
        type: "Out of Stock",
        description: `${item.name} - ${item.category}`,
        severity: "Critical",
        time: `${Math.floor(Math.random() * 24)} hours ago`,
        icon: AlertTriangle,
        color: "#f43f5e", // rose-500
      });
    } else if (item.stock < item.threshold) {
      alerts.push({
        id: item.id,
        type: "Low Stock",
        description: `${item.name} - ${item.stock} units remaining`,
        severity: "Low Stock",
        time: `${Math.floor(Math.random() * 24)} hours ago`,
        icon: AlertTriangle,
        color: "#f97316", // orange-500
      });
    }
  });
  
  // Add expiring alerts
  expiringData.forEach(item => {
    const daysToExpiry = Math.floor((new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    alerts.push({
      id: item.id,
      type: "Expiring Soon",
      description: `${item.name}`,
      severity: `Expires in ${daysToExpiry} days`,
      time: `${Math.floor(Math.random() * 12)} hours ago`,
      icon: Clock,
      color: "#f59e0b", // amber-500
    });
  });
  
  return alerts;
};

export function RecentAlerts() {
  const { data: alerts, isLoading, isError } = useQuery({
    queryKey: ['inventory-alerts'],
    queryFn: fetchInventoryAlerts
  });

  return (
    <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="text-xl font-semibold text-gray-800">Recent Alerts</CardTitle>
        <p className="text-sm text-muted-foreground">System notifications</p>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading alert data
          </div>
        ) : alerts && alerts.length > 0 ? (
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            No urgent alerts at this time
          </div>
        )}
      </CardContent>
    </Card>
  );
}
