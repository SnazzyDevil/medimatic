
import { 
  Activity, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Users 
} from "lucide-react";

const stats = [
  {
    label: "Patients",
    value: "142",
    change: "+12% from last month",
    trend: "up",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Appointments",
    value: "38",
    change: "Next 7 days",
    trend: "neutral",
    icon: Calendar,
    color: "bg-violet-50 text-violet-600",
  },
  {
    label: "Revenue",
    value: "$8,492",
    change: "+8.1% from last month",
    trend: "up",
    icon: CreditCard,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Avg Wait Time",
    value: "12 min",
    change: "-3 min from last month",
    trend: "down",
    icon: Activity,
    color: "bg-amber-50 text-amber-600",
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="health-stat-card bg-white border border-healthcare-gray-light"
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
            <div className={`p-2 rounded-md ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {stat.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-healthcare-success mr-1.5" />}
            {stat.trend === "down" && <TrendingUp className="h-3.5 w-3.5 text-healthcare-danger mr-1.5 transform rotate-180" />}
            <p className="text-xs text-healthcare-gray">
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
