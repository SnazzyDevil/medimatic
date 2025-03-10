
import { ArrowRight, CreditCard, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PaymentSummary() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Payment Summary</CardTitle>
        <p className="text-sm text-muted-foreground">Current billing period</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-healthcare-gray">Revenue</div>
              <div className="text-xl font-bold text-healthcare-primary flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                8,250
              </div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+5.2% this week</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-healthcare-gray">Payments</div>
              <div className="text-xl font-bold text-green-600 flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                7,820
              </div>
              <div className="text-xs text-healthcare-gray mt-1">16 transactions</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium mb-1">Recent Payments</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-md hover:bg-healthcare-secondary">
                <div className="flex items-center">
                  <Receipt className="h-4 w-4 text-healthcare-gray mr-2" />
                  <div>
                    <div className="text-sm font-medium">INV-2023-001</div>
                    <div className="text-xs text-healthcare-gray">June 10, 2023</div>
                  </div>
                </div>
                <div className="font-medium">$150.00</div>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md hover:bg-healthcare-secondary">
                <div className="flex items-center">
                  <Receipt className="h-4 w-4 text-healthcare-gray mr-2" />
                  <div>
                    <div className="text-sm font-medium">INV-2023-002</div>
                    <div className="text-xs text-healthcare-gray">June 8, 2023</div>
                  </div>
                </div>
                <div className="font-medium">$220.00</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full justify-between mt-2">
              View all payments
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
