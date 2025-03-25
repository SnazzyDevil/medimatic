
import { ArrowRight, CreditCard, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch payment summary data
const fetchPaymentSummary = async () => {
  // Get total revenue
  const { data: invoicesData, error: invoicesError } = await supabase
    .from('invoices')
    .select('id, total_amount, paid_amount, invoice_date, status')
    .order('invoice_date', { ascending: false })
    .limit(10);
  
  if (invoicesError) throw invoicesError;
  
  // Calculate current week's revenue
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const currentWeekRevenue = invoicesData.reduce((sum, invoice) => {
    const invoiceDate = new Date(invoice.invoice_date);
    if (invoiceDate >= startOfWeek && invoiceDate <= today) {
      return sum + Number(invoice.paid_amount);
    }
    return sum;
  }, 0);
  
  // Calculate previous week's revenue
  const startOfPrevWeek = new Date(startOfWeek);
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);
  const endOfPrevWeek = new Date(startOfWeek);
  endOfPrevWeek.setDate(endOfPrevWeek.getDate() - 1);
  
  const prevWeekRevenue = invoicesData.reduce((sum, invoice) => {
    const invoiceDate = new Date(invoice.invoice_date);
    if (invoiceDate >= startOfPrevWeek && invoiceDate <= endOfPrevWeek) {
      return sum + Number(invoice.paid_amount);
    }
    return sum;
  }, 0);
  
  // Calculate percentage change
  let percentChange = 0;
  if (prevWeekRevenue > 0) {
    percentChange = ((currentWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100;
  }
  
  // Get recent payments
  const recentPayments = invoicesData
    .filter(invoice => invoice.status === 'paid' || invoice.paid_amount > 0)
    .map(invoice => ({
      id: invoice.id,
      invoiceNumber: `INV-${invoice.id.substring(0, 8)}`,
      date: new Date(invoice.invoice_date).toLocaleDateString(),
      amount: invoice.paid_amount
    }))
    .slice(0, 2);
  
  return {
    revenue: currentWeekRevenue,
    percentChange: percentChange.toFixed(1),
    totalPayments: invoicesData.filter(invoice => invoice.status === 'paid' || invoice.paid_amount > 0).length,
    recentPayments
  };
};

export function PaymentSummary() {
  const { data: paymentData, isLoading, isError } = useQuery({
    queryKey: ['payment-summary'],
    queryFn: fetchPaymentSummary
  });

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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading payment data
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3">
                <div className="text-sm text-gray-600">Revenue</div>
                <div className="text-xl font-bold text-emerald-700 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  R {paymentData?.revenue.toFixed(2) || '0.00'}
                </div>
                <div className="flex items-center text-xs text-emerald-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{paymentData?.percentChange || '0.0'}% this week</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                <div className="text-sm text-gray-600">Payments</div>
                <div className="text-xl font-bold text-blue-700 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  R {paymentData?.revenue.toFixed(2) || '0.00'}
                </div>
                <div className="text-xs text-gray-500 mt-1">{paymentData?.totalPayments || 0} transactions</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-1">Recent Payments</div>
              <div className="space-y-2">
                {paymentData?.recentPayments && paymentData.recentPayments.length > 0 ? (
                  paymentData.recentPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                          <Receipt className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{payment.invoiceNumber}</div>
                          <div className="text-xs text-gray-500">{payment.date}</div>
                        </div>
                      </div>
                      <div className="font-medium text-gray-800">R {Number(payment.amount).toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-500 text-sm">No recent payments</div>
                )}
              </div>
              <Link to="/billing">
                <Button variant="ghost" size="sm" className="w-full justify-between mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View all payments
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
