
import { Activity, Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch recent activity from multiple tables
const fetchRecentActivity = async () => {
  // Get recent dispensing
  const { data: dispensingData, error: dispensingError } = await supabase
    .from('dispensing')
    .select('id, patient_name, medication_name, created_at')
    .order('created_at', { ascending: false })
    .limit(2);
  
  if (dispensingError) throw dispensingError;
  
  // Get recent inventory changes
  const { data: inventoryData, error: inventoryError } = await supabase
    .from('inventory')
    .select('id, name, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);
  
  if (inventoryError) throw inventoryError;
  
  // Get recent appointments
  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from('appointments')
    .select('id, patient_id, appointment_date, created_at')
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (appointmentsError) throw appointmentsError;
  
  const activities = [];
  
  // Format dispensing activities
  dispensingData.forEach(item => {
    const createdAt = new Date(item.created_at);
    const today = new Date();
    const isToday = createdAt.toDateString() === today.toDateString();
    const time = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    activities.push({
      id: item.id,
      action: "Prescription filled",
      patient: item.patient_name,
      time: isToday ? time : "Yesterday",
      date: isToday ? "Today" : createdAt.toLocaleDateString()
    });
  });
  
  // Format inventory activities
  inventoryData.forEach(item => {
    const updatedAt = new Date(item.updated_at);
    const today = new Date();
    const isToday = updatedAt.toDateString() === today.toDateString();
    const time = updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    activities.push({
      id: item.id,
      action: "Inventory updated",
      item: item.name,
      time: isToday ? time : "Yesterday",
      date: isToday ? "Today" : updatedAt.toLocaleDateString()
    });
  });
  
  // Format appointment activities
  appointmentsData.forEach(item => {
    const createdAt = new Date(item.created_at);
    const today = new Date();
    const isToday = createdAt.toDateString() === today.toDateString();
    const time = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    activities.push({
      id: item.id,
      action: "Appointment scheduled",
      patient: `Patient ID: ${item.patient_id}`,
      time: isToday ? time : "Yesterday",
      date: isToday ? "Today" : createdAt.toLocaleDateString()
    });
  });
  
  // Sort by time (assuming most recent first)
  activities.sort((a, b) => {
    if (a.date === "Today" && b.date !== "Today") return -1;
    if (a.date !== "Today" && b.date === "Today") return 1;
    return 0;
  });
  
  return activities;
};

export function RecentActivity() {
  const { data: activityItems, isLoading, isError } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: fetchRecentActivity
  });

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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading activity data
          </div>
        ) : activityItems && activityItems.length > 0 ? (
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
            
            <Link to="/reports">
              <Button variant="ghost" size="sm" className="w-full justify-between mt-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                View all activity
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activity
          </div>
        )}
      </CardContent>
    </Card>
  );
}
