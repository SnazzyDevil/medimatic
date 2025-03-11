
import { ArrowRight, CreditCard, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function PaymentSummary() {
  return (
    <Card className="border-none shadow-md bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <DollarSign className="h-5 w-5 text-emerald-500" />
          Payment Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">Current billing period</p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3">
              <div className="text-sm text-gray-600">Revenue</div>
              <div className="text-xl font-bold text-emerald-700 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                8,250
              </div>
              <div className="flex items-center text-xs text-emerald-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+5.2% this week</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
              <div className="text-sm text-gray-600">Payments</div>
              <div className="text-xl font-bold text-blue-700 flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                7,820
              </div>
              <div className="text-xs text-gray-500 mt-1">16 transactions</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Recent Payments</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                    <Receipt className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">INV-2023-001</div>
                    <div className="text-xs text-gray-500">June 10, 2023</div>
                  </div>
                </div>
                <div className="font-medium text-gray-800">$150.00</div>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                    <Receipt className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">INV-2023-002</div>
                    <div className="text-xs text-gray-500">June 8, 2023</div>
                  </div>
                </div>
                <div className="font-medium text-gray-800">$220.00</div>
              </div>
            </div>
            <Link to="/billing">
              <Button variant="ghost" size="sm" className="w-full justify-between mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View all payments
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
