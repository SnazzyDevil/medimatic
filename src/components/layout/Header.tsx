import { useState, useEffect } from "react";
import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PracticeService } from "@/services/practiceService";
import { PracticeInformation } from "@/types/practice";

// Create a hook to manage doctor settings
export const useDoctorSettings = () => {
  const [doctorSettings, setDoctorSettings] = useState({
    name: "Dr. Jane Smith",
    email: "info@medicare-clinic.com",
    practiceName: "MediCare Clinic",
    image: "https://i.pravatar.cc/100?img=11",
    // Default image
    practiceImage: "/lovable-uploads/54b4c6e4-26d2-43bd-89bf-2488dc489f30.png" // Practice image
  });
  const [practiceInfo, setPracticeInfo] = useState<PracticeInformation | null>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedSettings = localStorage.getItem("doctorSettings");
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        console.log("Loaded settings from localStorage:", parsedSettings);
        setDoctorSettings(parsedSettings);
      } catch (error) {
        console.error("Error parsing stored settings:", error);
      }
    }

    // Also fetch practice info from database
    const fetchPracticeInfo = async () => {
      try {
        const info = await PracticeService.getCurrentPractice();
        if (info) {
          setPracticeInfo(info);

          // Update doctor settings with the most recent information from database
          const updatedSettings = {
            ...doctorSettings,
            name: info.doctorName || doctorSettings.name,
            practiceName: info.name || doctorSettings.practiceName,
            email: info.email || doctorSettings.email
          };
          setDoctorSettings(updatedSettings);
          localStorage.setItem("doctorSettings", JSON.stringify(updatedSettings));
        }
      } catch (error) {
        console.error("Error fetching practice information in header:", error);
      }
    };
    fetchPracticeInfo();
  }, []);

  // Update settings function - improved to ensure settings are saved properly
  const updateDoctorSettings = newSettings => {
    const updatedSettings = {
      ...doctorSettings,
      ...newSettings
    };
    console.log("Updating doctor settings:", updatedSettings);

    // First update state
    setDoctorSettings(updatedSettings);

    // Then save to localStorage
    try {
      localStorage.setItem("doctorSettings", JSON.stringify(updatedSettings));
      console.log("Settings saved to localStorage");
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  };
  return {
    doctorSettings,
    updateDoctorSettings,
    practiceInfo
  };
};
export function Header() {
  const {
    doctorSettings,
    practiceInfo
  } = useDoctorSettings();
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // Use practice info when available, fallback to doctorSettings
  const practiceName = practiceInfo?.name || doctorSettings.practiceName;
  const practiceImage = practiceInfo?.practiceImageUrl || doctorSettings.practiceImage;
  return <header className="h-16 border-b bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-between sticky top-0 z-10 animate-fade-in rounded mx-[24px] my-0 px-[13px] py-[4px]">
      <div className="flex items-center">
        <h1 className="font-semibold text-xl text-white">Medimatic</h1>
        <span className="text-xs text-white/80 ml-2 px-2 py-0.5 bg-white/20 rounded-full">Beta</span>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/20">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-rose-500 rounded-full"></span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 mt-2">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">New Appointment</span>
                  <span className="text-xs text-gray-500">2 min ago</span>
                </div>
                <span className="text-sm text-gray-600 mt-1">
                  Sarah Johnson scheduled an appointment for tomorrow at 10:00 AM
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">Prescription Renewal</span>
                  <span className="text-xs text-gray-500">1 hour ago</span>
                </div>
                <span className="text-sm text-gray-600 mt-1">
                  Michael Brown requested a prescription renewal for Lisinopril
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-3">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">Inventory Alert</span>
                  <span className="text-xs text-gray-500">3 hours ago</span>
                </div>
                <span className="text-sm text-gray-600 mt-1">
                  Low stock alert: Amoxicillin 500mg (5 units remaining)
                </span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center text-violet-600 font-medium">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2 pl-2 pr-2 hover:bg-white/20">
              <span className="hidden sm:inline text-sm text-white">{practiceName}</span>
              <Avatar className="h-8 w-8 border border-white/30">
                <AvatarImage src={practiceImage} alt={practiceName} />
                <AvatarFallback className="bg-white/20 text-white">
                  {practiceName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
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
    </header>;
}