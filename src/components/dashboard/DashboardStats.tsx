
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
    bgColor: "from-blue-500 to-indigo-600",
    textColor: "text-blue-50"
  },
  {
    label: "Active Patients",
    value: "356",
    change: "+2.8% vs. last month",
    trend: "up",
    icon: Users,
    color: "bg-violet-50 text-violet-600",
    bgColor: "from-purple-500 to-violet-600",
    textColor: "text-violet-50"
  },
  {
    label: "Dispensed Today",
    value: "78",
    change: "-1.2% vs. yesterday",
    trend: "down",
    icon: Pill,
    color: "bg-emerald-50 text-emerald-600",
    bgColor: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-50"
  },
  {
    label: "Scheduled Dispensing",
    value: "24",
    change: "For today",
    trend: "neutral",
    icon: Calendar,
    color: "bg-amber-50 text-amber-600",
    bgColor: "from-pink-500 to-rose-600",
    textColor: "text-pink-50"
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="bg-gradient-to-r rounded-xl p-5 shadow-md transform transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg"
          style={{ 
            backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
            "--tw-gradient-from": stat.bgColor.split(" ")[0].replace("from-", ""),
            "--tw-gradient-to": stat.bgColor.split(" ")[1].replace("to-", "")
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <p className={`text-sm ${stat.textColor} mb-1 opacity-80`}>{stat.label}</p>
              <p className={`text-3xl font-bold mb-1 ${stat.textColor}`}>{stat.value}</p>
            </div>
            <div className="p-2 rounded-md bg-white/20">
              <stat.icon className={`h-6 w-6 text-white`} />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {stat.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-white mr-1.5" />}
            {stat.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-white mr-1.5" />}
            <p className={`text-xs text-white opacity-90`}>
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
