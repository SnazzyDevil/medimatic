
import { 
  Package, 
  Users, 
  Pill,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Total Inventory Items",
    value: "2487",
    change: "+5.2% vs. last month",
    trend: "up",
    icon: Package,
    gradientClasses: "from-blue-500 to-blue-700"
  },
  {
    label: "Active Patients",
    value: "356",
    change: "+2.8% vs. last month",
    trend: "up",
    icon: Users,
    gradientClasses: "from-purple-500 to-violet-700"
  },
  {
    label: "Dispensed Today",
    value: "78",
    change: "-1.2% vs. yesterday",
    trend: "down",
    icon: Pill,
    gradientClasses: "from-emerald-500 to-teal-700"
  },
  {
    label: "Scheduled Dispensing",
    value: "24",
    change: "For today",
    trend: "neutral",
    icon: Calendar,
    gradientClasses: "from-pink-500 to-rose-700"
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
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
