
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isValidData, safelyAccess, mapQueryResultSafely } from "@/utils/supabaseHelpers";

// Define the types for the data we expect
interface DispensingItem {
  id: string;
  patientName: string;
  medication: string;
  time: string;
  status: string;
  staff: string;
}

// Function to fetch upcoming dispensing from Supabase
const fetchUpcomingDispensing = async (): Promise<DispensingItem[]> => {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('dispensing')
    .select('id, patient_name, medication_name, dispensing_date, created_at, dispensing_staff')
    .eq('dispensing_date', today as any)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  if (!isValidData(data) || !Array.isArray(data)) {
    return [];
  }
  
  return mapQueryResultSafely(data, item => ({
    id: safelyAccess(item, 'id', ''),
    patientName: safelyAccess(item, 'patient_name', ''),
    medication: safelyAccess(item, 'medication_name', ''),
    time: safelyAccess(item, 'created_at', '') 
      ? new Date(safelyAccess(item, 'created_at', '')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : '',
    status: "Scheduled",
    staff: safelyAccess(item, 'dispensing_staff', '')
  }));
};

export function UpcomingDispensing() {
  const { data: dispensingSchedule, isLoading, isError } = useQuery({
    queryKey: ['upcoming-dispensing'],
    queryFn: fetchUpcomingDispensing
  });

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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading dispensing data
          </div>
        ) : dispensingSchedule && dispensingSchedule.length > 0 ? (
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
                  Today at {schedule.time} by {schedule.staff}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No dispensing scheduled for today
          </div>
        )}
      </CardContent>
    </Card>
  );
}
