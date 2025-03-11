
import { Pill, UserPlus, Package, FileText, Calendar } from "lucide-react";
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
        navigate("/patients?new=true");
        break;
      case "inventory":
        navigate("/inventory");
        break;
      case "reports":
        toast({
          title: "Reports",
          description: "Report functionality coming soon",
        });
        break;
      case "schedule":
        navigate("/scheduler");
        break;
      default:
        break;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">Common tasks</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Button 
            className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600"
            onClick={() => handleAction("dispensing")}
          >
            <Pill className="h-6 w-6 mb-2" />
            <span>New Dispensing</span>
          </Button>
          <Button 
            className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600"
            onClick={() => handleAction("newPatient")}
          >
            <UserPlus className="h-6 w-6 mb-2" />
            <span>New Patient</span>
          </Button>
          <Button 
            className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600"
            onClick={() => handleAction("inventory")}
          >
            <Package className="h-6 w-6 mb-2" />
            <span>Add Inventory</span>
          </Button>
          <Button 
            className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600"
            onClick={() => handleAction("reports")}
          >
            <FileText className="h-6 w-6 mb-2" />
            <span>Reports</span>
          </Button>
          <Button 
            className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600"
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
