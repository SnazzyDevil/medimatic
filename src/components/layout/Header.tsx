
import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10 animate-fade-in">
      <div className="flex items-center">
        <h1 className="font-semibold text-xl text-healthcare-primary">Medimatic</h1>
        <span className="text-xs text-healthcare-gray ml-2 px-2 py-0.5 bg-healthcare-secondary rounded-full">Beta</span>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-healthcare-gray" />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-healthcare-danger rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-healthcare-secondary">
              <User className="h-4 w-4 text-healthcare-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
