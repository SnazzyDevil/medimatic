
import { Pill, UserPlus, Package, FileText, Calendar, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    switch (action) {
      case "dispensing":
        navigate("/dispensing");
        break;
      case "newPatient":
        navigate("/patients/new");
        break;
      case "inventory":
        navigate("/inventory");
        break;
      case "reports":
        navigate("/reports");
        break;
      case "schedule":
        navigate("/scheduler");
        break;
      default:
        break;
    }
  };

  return (
    <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Quick Actions
        </CardTitle>
        <p className="text-sm text-muted-foreground">Common tasks</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Button 
            className="justify-center flex-col h-24 px-2 bg-gradient-to-b from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
            onClick={() => handleAction("dispensing")}
          >
            <Pill className="h-6 w-6 mb-2" />
            <span>New Dispensing</span>
          </Button>
          <Button 
            className="justify-center flex-col h-24 px-2 bg-gradient-to-b from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 shadow-md transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
            onClick={() => handleAction("newPatient")}
          >
            <UserPlus className="h-6 w-6 mb-2" />
            <span>New Patient</span>
          </Button>
          <Button 
            className="justify-center flex-col h-24 px-2 bg-gradient-to-b from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
            onClick={() => handleAction("inventory")}
          >
            <Package className="h-6 w-6 mb-2" />
            <span>Add Inventory</span>
          </Button>
          <Button 
            className="justify-center flex-col h-24 px-2 bg-gradient-to-b from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
            onClick={() => handleAction("reports")}
          >
            <FileText className="h-6 w-6 mb-2" />
            <span>Reports</span>
          </Button>
          <Button 
            className="justify-center flex-col h-24 px-2 bg-gradient-to-b from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-md transform transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg"
            onClick={() => handleAction("schedule")}
          >
            <Calendar className="h-6 w-6 mb-2" />
            <span>Schedule</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
