
import { useEffect, useState } from "react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDoctorSettings } from "@/components/layout/Header";

export function PaymentSummary() {
  const { doctorSettings } = useDoctorSettings();
  const currencySymbol = doctorSettings.currency === "ZAR" ? "R" : 
                         doctorSettings.currency === "USD" ? "$" : 
                         doctorSettings.currency === "EUR" ? "€" : 
                         doctorSettings.currency === "GBP" ? "£" : "R";
  
  const [paymentsData, setPaymentsData] = useState({
    totalOutstanding: 12850,
    recentPayments: [
      { id: 1, patient: "Michael Brown", amount: 450, date: "2023-06-01", status: "paid" },
      { id: 2, patient: "Emma Wilson", amount: 850, date: "2023-06-02", status: "paid" },
      { id: 3, patient: "James Taylor", amount: 1200, date: "2023-06-05", status: "paid" },
    ],
    paymentsByMonth: [
      { month: "Jan", amount: 8500 },
      { month: "Feb", amount: 9200 },
      { month: "Mar", amount: 8900 },
      { month: "Apr", amount: 10500 },
      { month: "May", amount: 9800 },
      { month: "Jun", amount: 11200 },
    ]
  });

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Payment Summary</CardTitle>
        <CardDescription>Recent payments and outstanding amounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-violet-50 p-4 rounded-md">
            <p className="text-sm font-medium text-violet-600">Total Outstanding</p>
            <p className="text-2xl font-bold text-violet-700">{currencySymbol} {paymentsData.totalOutstanding.toLocaleString()}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Recent Payments</h4>
            <div className="space-y-2">
              {paymentsData.recentPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-md">
                  <span className="font-medium">{payment.patient}</span>
                  <div className="flex items-center">
                    <span className="text-green-600 font-medium">{currencySymbol} {payment.amount}</span>
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      Paid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 text-xs text-center text-healthcare-gray">
            <a href="/billing" className="text-violet-600 font-medium hover:underline">
              View all payments
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
