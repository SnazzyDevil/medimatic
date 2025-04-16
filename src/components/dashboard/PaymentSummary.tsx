
import { ArrowRight, CreditCard, Banknote, Receipt, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch payment summary data
const fetchPaymentSummary = async () => {
  // Get all invoices
  const { data: invoicesData, error: invoicesError } = await supabase
    .from('invoices')
    .select('id, total_amount, paid_amount, invoice_date, status, created_at, patient_id')
    .order('invoice_date', { ascending: false });
  
  if (invoicesError) throw invoicesError;
  
  // Calculate current week's revenue
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const currentWeekRevenue = invoicesData.reduce((sum, invoice) => {
    const invoiceDate = new Date(invoice.invoice_date);
    if (invoiceDate >= startOfWeek && invoiceDate <= today && 
        (invoice.status === 'paid' || Number(invoice.paid_amount) > 0)) {
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
    if (invoiceDate >= startOfPrevWeek && invoiceDate <= endOfPrevWeek && 
        (invoice.status === 'paid' || Number(invoice.paid_amount) > 0)) {
      return sum + Number(invoice.paid_amount);
    }
    return sum;
  }, 0);
  
  // Calculate percentage change
  let percentChange = 0;
  if (prevWeekRevenue > 0) {
    percentChange = ((currentWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100;
  }
  
  // Get patient data for recent payments
  const paidInvoices = invoicesData
    .filter(invoice => invoice.status === 'paid' || Number(invoice.paid_amount) > 0)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2);
  
  let patientMap = {};
  if (paidInvoices.length > 0) {
    const patientIds = paidInvoices.map(invoice => invoice.patient_id).filter(Boolean);
    
    if (patientIds.length > 0) {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .in('id', patientIds);
        
      if (!patientError && patientData) {
        patientMap = patientData.reduce((acc, patient) => {
          acc[patient.id] = `${patient.first_name} ${patient.last_name}`;
          return acc;
        }, {});
      }
    }
  }
  
  // Get invoice items for service information
  const invoiceIds = paidInvoices.map(invoice => invoice.id);
  let itemMap = {};
  
  if (invoiceIds.length > 0) {
    const { data: itemData, error: itemError } = await supabase
      .from('invoice_items')
      .select('invoice_id, description')
      .in('invoice_id', invoiceIds);
      
    if (!itemError && itemData) {
      itemMap = itemData.reduce((acc, item) => {
        if (!acc[item.invoice_id]) {
          acc[item.invoice_id] = item.description;
        }
        return acc;
      }, {});
    }
  }
  
  // Format recent payments
  const recentPayments = paidInvoices.map(invoice => ({
    id: invoice.id,
    invoiceNumber: `INV-${invoice.id.substring(0, 8)}`,
    date: new Date(invoice.invoice_date).toLocaleDateString(),
    amount: invoice.paid_amount,
    patientName: patientMap[invoice.patient_id] || "Patient",
    service: itemMap[invoice.id] || "Medical Service"
  }));
  
  return {
    revenue: currentWeekRevenue,
    percentChange: percentChange.toFixed(1),
    totalPayments: invoicesData.filter(invoice => invoice.status === 'paid' || Number(invoice.paid_amount) > 0).length,
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
          <Banknote className="h-5 w-5 text-emerald-500" />
          Payment Summary
        </CardTitle>
        <p className="text-sm text-muted-foreground">Current billing period</p>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-emerald-500" />
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
                  <Banknote className="h-4 w-4 mr-1" />
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
                          <div className="text-xs text-gray-500">{payment.patientName} - {payment.date}</div>
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
