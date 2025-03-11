
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
    <header className="h-16 border-b bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-between px-6 sticky top-0 z-10 animate-fade-in">
      <div className="flex items-center">
        <h1 className="font-semibold text-xl text-white">Medimatic</h1>
        <span className="text-xs text-white/80 ml-2 px-2 py-0.5 bg-white/20 rounded-full">Beta</span>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-rose-500 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
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
