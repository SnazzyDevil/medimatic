import { Link, useLocation } from "react-router-dom";
import { Calendar, CreditCard, Home, Settings, Users, Package, Pill, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard", icon: Home, href: "/", color: "from-blue-500 to-blue-600" },
  { name: "Patients", icon: Users, href: "/patients", color: "from-violet-500 to-violet-600" },
  { name: "Scheduler", icon: Calendar, href: "/scheduler", color: "from-emerald-500 to-teal-600" },
  { name: "Inventory", icon: Package, href: "/inventory", color: "from-amber-500 to-orange-600" },
  { name: "Dispensing", icon: Pill, href: "/dispensing", color: "from-pink-500 to-rose-600" },
  { name: "Billing", icon: CreditCard, href: "/billing", color: "from-indigo-500 to-blue-600" },
  { name: "Reports", icon: FileText, href: "/reports", color: "from-cyan-500 to-blue-500" },
  { name: "Settings", icon: Settings, href: "/settings", color: "from-gray-500 to-gray-600" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="h-screen w-16 fixed left-0 top-0 border-r border-border bg-white shadow-md z-10 flex flex-col items-center py-6 animate-fade-in">
      <Link to="/" className="h-10 w-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg mb-8 flex items-center justify-center">
        <span className="text-white font-bold">M</span>
      </Link>
      
      <nav className="flex-1 flex flex-col items-center space-y-4 mt-8">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/" && location.pathname.startsWith(item.href));
              
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link to={item.href}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-10 w-10 rounded-lg transition-all duration-300 relative group",
                        isActive
                          ? "bg-gradient-to-r text-white hover:shadow-md" 
                          : "text-healthcare-gray hover:bg-healthcare-secondary hover:text-healthcare-primary"
                      )}
                      style={
                        isActive 
                          ? { backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                              "--tw-gradient-from": item.color.split(" ")[0].replace("from-", ""),
                              "--tw-gradient-to": item.color.split(" ")[1].replace("to-", "")
                            } as React.CSSProperties
                          : {}
                      }
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "")} />
                      <span className="sr-only">{item.name}</span>
                      
                      {/* Colored indicator for active state */}
                      {isActive && (
                        <span className="absolute -left-1 top-1/2 transform -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-white"></span>
                      )}
                      
                      {/* Hover indicator */}
                      {!isActive && (
                        <span className="absolute -left-1 top-1/2 transform -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-transparent transition-all duration-300 group-hover:bg-healthcare-primary opacity-0 group-hover:opacity-100"></span>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white shadow-md border border-gray-100">
                  <div className="px-2 py-1 text-sm font-medium">{item.name}</div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
