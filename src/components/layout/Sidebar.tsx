
import { Link, useLocation } from "react-router-dom";
import { Calendar, CreditCard, Home, Settings, Users, Package, Pill } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Patients", icon: Users, href: "/patients" },
  { name: "Scheduler", icon: Calendar, href: "/scheduler" },
  { name: "Inventory", icon: Package, href: "/inventory" },
  { name: "Dispensing", icon: Pill, href: "/dispensing" },
  { name: "Billing", icon: CreditCard, href: "/billing" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="h-screen w-16 fixed left-0 top-0 border-r border-border bg-sidebar z-10 flex flex-col items-center py-6 animate-fade-in">
      <div className="h-8 w-8 bg-healthcare-primary rounded-lg mb-8 flex items-center justify-center">
        <span className="text-white font-bold">M</span>
      </div>
      
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
                        "h-10 w-10 rounded-lg transition-all duration-300",
                        isActive
                          ? "bg-healthcare-highlight text-healthcare-primary"
                          : "text-healthcare-gray hover:bg-healthcare-secondary hover:text-healthcare-primary"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.name}</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
