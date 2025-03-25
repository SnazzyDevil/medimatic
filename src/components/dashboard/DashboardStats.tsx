
import { 
  Package, 
  Users, 
  Pill,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
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
  
  // Get scheduled dispensing count for today
  const { data: scheduledDispensingData, error: scheduledDispensingError } = await supabase
    .from('dispensing')
    .select('id', { count: 'exact' })
    .eq('dispensing_date', today)
    .gt('created_at', new Date(new Date().setDate(new Date().getDate() - 1)).toISOString());
  
  if (scheduledDispensingError) throw scheduledDispensingError;
  
  return {
    inventoryCount: inventoryData.length,
    patientsCount: patientsData.length,
    dispensingTodayCount: dispensingTodayData.length,
    scheduledDispensingCount: scheduledDispensingData.length
  };
};

export function DashboardStats() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  });
  
  // Default stats while loading
  const defaultStats = [
    {
      label: "Total Inventory Items",
      value: isLoading ? "..." : (stats?.inventoryCount || 0).toString(),
      change: "+5.2% vs. last month",
      trend: "up",
      icon: Package,
      gradientClasses: "from-blue-500 to-blue-700"
    },
    {
      label: "Active Patients",
      value: isLoading ? "..." : (stats?.patientsCount || 0).toString(),
      change: "+2.8% vs. last month",
      trend: "up",
      icon: Users,
      gradientClasses: "from-purple-500 to-violet-700"
    },
    {
      label: "Dispensed Today",
      value: isLoading ? "..." : (stats?.dispensingTodayCount || 0).toString(),
      change: "-1.2% vs. yesterday",
      trend: "down",
      icon: Pill,
      gradientClasses: "from-emerald-500 to-teal-700"
    },
    {
      label: "Scheduled Dispensing",
      value: isLoading ? "..." : (stats?.scheduledDispensingCount || 0).toString(),
      change: "For today",
      trend: "neutral",
      icon: Calendar,
      gradientClasses: "from-pink-500 to-rose-700"
    },
  ];

  if (isError) {
    console.error("Error fetching dashboard stats");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {defaultStats.map((stat) => (
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
