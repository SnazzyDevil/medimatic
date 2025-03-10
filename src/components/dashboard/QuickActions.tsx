
import { Pill, UserPlus, Package, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">Common tasks</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Button className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600">
            <Pill className="h-6 w-6 mb-2" />
            <span>New Dispensing</span>
          </Button>
          <Button className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600">
            <UserPlus className="h-6 w-6 mb-2" />
            <span>New Patient</span>
          </Button>
          <Button className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600">
            <Package className="h-6 w-6 mb-2" />
            <span>Add Inventory</span>
          </Button>
          <Button className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600">
            <FileText className="h-6 w-6 mb-2" />
            <span>Reports</span>
          </Button>
          <Button className="justify-center flex-col h-24 px-2 bg-blue-500 hover:bg-blue-600">
            <Calendar className="h-6 w-6 mb-2" />
            <span>Schedule</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
