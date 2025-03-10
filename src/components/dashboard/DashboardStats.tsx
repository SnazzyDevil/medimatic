
import { 
  Package, 
  Users, 
  Pill,
  Calendar,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const stats = [
  {
    label: "Total Inventory Items",
    value: "2487",
    change: "+5.2% vs. last month",
    trend: "up",
    icon: Package,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Active Patients",
    value: "356",
    change: "+2.8% vs. last month",
    trend: "up",
    icon: Users,
    color: "bg-violet-50 text-violet-600",
  },
  {
    label: "Dispensed Today",
    value: "78",
    change: "-1.2% vs. yesterday",
    trend: "down",
    icon: Pill,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Scheduled Dispensing",
    value: "24",
    change: "For today",
    trend: "neutral",
    icon: Calendar,
    color: "bg-amber-50 text-amber-600",
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="health-stat-card bg-white border border-healthcare-gray-light rounded-xl p-5"
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
            </div>
            <div className={`p-2 rounded-md ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {stat.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-green-500 mr-1.5" />}
            {stat.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500 mr-1.5" />}
            <p className={`text-xs ${stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-500"}`}>
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
