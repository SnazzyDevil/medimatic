
import { Pill, UserPlus, Package, FileText } from "lucide-react";
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
        <div className="grid grid-cols-1 gap-3">
          <Button className="justify-start h-12 bg-blue-500 hover:bg-blue-600">
            <Pill className="mr-2 h-5 w-5" />
            New Dispensing
          </Button>
          <Button className="justify-start h-12 bg-blue-500 hover:bg-blue-600">
            <UserPlus className="mr-2 h-5 w-5" />
            New Patient
          </Button>
          <Button className="justify-start h-12 bg-blue-500 hover:bg-blue-600">
            <Package className="mr-2 h-5 w-5" />
            Add Inventory
          </Button>
          <Button className="justify-start h-12 bg-blue-500 hover:bg-blue-600">
            <FileText className="mr-2 h-5 w-5" />
            Reports
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
