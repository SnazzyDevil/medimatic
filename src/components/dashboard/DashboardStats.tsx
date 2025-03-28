
import { 
  Package, 
  Users, 
  Pill,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Function to fetch dashboard stats from Supabase
const fetchDashboardStats = async () => {
  // Get inventory count
  const { data: inventoryData, error: inventoryError } = await supabase
    .from('inventory')
    .select('id', { count: 'exact' });
  
  if (inventoryError) throw inventoryError;
  
  // Get patients count
  const { data: patientsData, error: patientsError } = await supabase
    .from('patients')
    .select('id', { count: 'exact' });
  
  if (patientsError) throw patientsError;
  
  // Get dispensing count for today
  const today = new Date().toISOString().split('T')[0];
  const { data: dispensingTodayData, error: dispensingTodayError } = await supabase
    .from('dispensing')
    .select('id', { count: 'exact' })
    .eq('dispensing_date', today);
  
  if (dispensingTodayError) throw dispensingTodayError;
  
  // Get scheduled dispensing count for today that were created recently (last 24 hours)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const { data: scheduledDispensingData, error: scheduledDispensingError } = await supabase
    .from('dispensing')
    .select('id', { count: 'exact' })
    .eq('dispensing_date', today)
    .gt('created_at', yesterday.toISOString());
  
  if (scheduledDispensingError) throw scheduledDispensingError;
  
  // Get previous month dispensing count for comparison
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
  const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
  
  const { data: lastMonthDispensingData, error: lastMonthDispensingError } = await supabase
    .from('dispensing')
    .select('id', { count: 'exact' })
    .gte('dispensing_date', lastMonthStart.toISOString().split('T')[0])
    .lte('dispensing_date', lastMonthEnd.toISOString().split('T')[0]);
  
  if (lastMonthDispensingError) throw lastMonthDispensingError;
  
  // Get previous month patients count for comparison
  const { data: lastMonthPatientsData, error: lastMonthPatientsError } = await supabase
    .from('patients')
    .select('id', { count: 'exact' })
    .lte('created_at', lastMonthEnd.toISOString());
  
  if (lastMonthPatientsError) throw lastMonthPatientsError;
  
  // Calculate month-over-month changes
  const prevMonthPatients = lastMonthPatientsData.length;
  const currentPatients = patientsData.length;
  const patientChange = prevMonthPatients > 0 
    ? ((currentPatients - prevMonthPatients) / prevMonthPatients * 100).toFixed(1)
    : "0.0";
  
  const prevMonthDispensing = lastMonthDispensingData.length;
  const currentMonthDispensing = dispensingTodayData.length;
  const dispensingChange = prevMonthDispensing > 0 
    ? ((currentMonthDispensing - prevMonthDispensing) / prevMonthDispensing * 100).toFixed(1)
    : "0.0";
  
  return {
    inventoryCount: inventoryData.length,
    patientsCount: patientsData.length,
    dispensingTodayCount: dispensingTodayData.length,
    scheduledDispensingCount: scheduledDispensingData.length,
    patientChange: parseFloat(patientChange),
    dispensingChange: parseFloat(dispensingChange)
  };
};

export function DashboardStats() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  });
  
  // Create stats based on real data
  const getStatsItems = () => {
    if (isLoading) {
      return [
        {
          label: "Total Inventory Items",
          value: "...",
          change: "Loading...",
          trend: "neutral",
          icon: Package,
          gradientClasses: "from-blue-500 to-blue-700"
        },
        {
          label: "Active Patients",
          value: "...",
          change: "Loading...",
          trend: "neutral",
          icon: Users,
          gradientClasses: "from-purple-500 to-violet-700"
        },
        {
          label: "Dispensed Today",
          value: "...",
          change: "Loading...",
          trend: "neutral",
          icon: Pill,
          gradientClasses: "from-emerald-500 to-teal-700"
        },
        {
          label: "Scheduled Dispensing",
          value: "...",
          change: "For today",
          trend: "neutral",
          icon: Calendar,
          gradientClasses: "from-pink-500 to-rose-700"
        },
      ];
    }
    
    if (isError) {
      return [
        {
          label: "Total Inventory Items",
          value: "Error",
          change: "Could not load data",
          trend: "neutral",
          icon: Package,
          gradientClasses: "from-blue-500 to-blue-700"
        },
        {
          label: "Active Patients",
          value: "Error",
          change: "Could not load data",
          trend: "neutral",
          icon: Users,
          gradientClasses: "from-purple-500 to-violet-700"
        },
        {
          label: "Dispensed Today",
          value: "Error",
          change: "Could not load data",
          trend: "neutral",
          icon: Pill,
          gradientClasses: "from-emerald-500 to-teal-700"
        },
        {
          label: "Scheduled Dispensing",
          value: "Error",
          change: "Could not load data",
          trend: "neutral",
          icon: Calendar,
          gradientClasses: "from-pink-500 to-rose-700"
        },
      ];
    }
    
    return [
      {
        label: "Total Inventory Items",
        value: stats?.inventoryCount.toString() || "0",
        change: `${stats?.patientChange >= 0 ? "+" : ""}${stats?.patientChange || 0}% vs. last month`,
        trend: stats?.patientChange >= 0 ? "up" : "down",
        icon: Package,
        gradientClasses: "from-blue-500 to-blue-700"
      },
      {
        label: "Active Patients",
        value: stats?.patientsCount.toString() || "0",
        change: `${stats?.patientChange >= 0 ? "+" : ""}${stats?.patientChange || 0}% vs. last month`,
        trend: stats?.patientChange >= 0 ? "up" : "down",
        icon: Users,
        gradientClasses: "from-purple-500 to-violet-700"
      },
      {
        label: "Dispensed Today",
        value: stats?.dispensingTodayCount.toString() || "0",
        change: `${stats?.dispensingChange >= 0 ? "+" : ""}${stats?.dispensingChange || 0}% vs. last month`,
        trend: stats?.dispensingChange >= 0 ? "up" : "down",
        icon: Pill,
        gradientClasses: "from-emerald-500 to-teal-700"
      },
      {
        label: "Scheduled Dispensing",
        value: stats?.scheduledDispensingCount.toString() || "0",
        change: "For today",
        trend: "neutral",
        icon: Calendar,
        gradientClasses: "from-pink-500 to-rose-700"
      },
    ];
  };

  const statsItems = getStatsItems();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {statsItems.map((stat) => (
        <div 
          key={stat.label} 
          className={cn(
            "rounded-xl p-5 shadow-md transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg bg-gradient-to-r",
            stat.gradientClasses
          )}
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <p className="text-sm text-white font-medium mb-1 opacity-90">{stat.label}</p>
              <p className="text-3xl font-bold mb-1 text-white">{stat.value}</p>
            </div>
            <div className="p-2 rounded-md bg-white/20">
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {stat.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-white mr-1.5" />}
            {stat.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-white mr-1.5" />}
            <p className="text-xs text-white opacity-90">
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
