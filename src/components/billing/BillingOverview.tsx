
import { 
  ArrowRight, 
  Calendar, 
  ChevronDown, 
  CreditCard, 
  DollarSign, 
  Download, 
  File, 
  Filter, 
  Search, 
  TrendingUp, 
  User 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample invoices data
const invoices = [
  {
    id: "INV-2023-001",
    patientName: "Sarah Johnson",
    date: "June 10, 2023",
    amount: 150.00,
    status: "paid",
    service: "Check-up"
  },
  {
    id: "INV-2023-002",
    patientName: "Michael Chen",
    date: "June 8, 2023",
    amount: 220.00,
    status: "paid",
    service: "Follow-up + Lab Tests"
  },
  {
    id: "INV-2023-003",
    patientName: "Emma Wilson",
    date: "June 5, 2023",
    amount: 185.50,
    status: "pending",
    service: "Consultation"
  },
  {
    id: "INV-2023-004",
    patientName: "David Miller",
    date: "June 2, 2023",
    amount: 310.75,
    status: "overdue",
    service: "Physical"
  },
  {
    id: "INV-2023-005",
    patientName: "Olivia Davis",
    date: "May 28, 2023",
    amount: 150.00,
    status: "paid",
    service: "Check-up"
  },
];

// Sample revenue data for chart
const revenueData = [
  { month: "Jan", amount: 4200 },
  { month: "Feb", amount: 4800 },
  { month: "Mar", amount: 5100 },
  { month: "Apr", amount: 4900 },
  { month: "May", amount: 5400 },
  { month: "Jun", amount: 8200 },
];

export function BillingOverview() {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border border-healthcare-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <DollarSign className="h-4 w-4 mr-1 text-healthcare-primary" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">$8,200</div>
              <div className="flex items-center text-sm text-healthcare-success">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                <span>+12% from last month</span>
              </div>
              <div className="pt-4 h-24 flex items-end space-x-2">
                {revenueData.map((item) => (
                  <div key={item.month} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-healthcare-primary rounded-t-sm transition-all animate-pulse-subtle" 
                      style={{ 
                        height: `${(item.amount / 10000) * 80}px`,
                        opacity: item.month === "Jun" ? 1 : 0.6 
                      }}
                    />
                    <div className="text-xs mt-1 text-healthcare-gray">{item.month}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-healthcare-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <CreditCard className="h-4 w-4 mr-1 text-healthcare-primary" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-healthcare-highlight rounded-lg p-3">
                <div className="text-sm text-healthcare-gray">Paid</div>
                <div className="text-xl font-bold text-healthcare-primary">$7,650</div>
                <div className="text-xs text-healthcare-gray mt-1">12 invoices</div>
              </div>
              <div className="bg-healthcare-secondary rounded-lg p-3">
                <div className="text-sm text-healthcare-gray">Pending</div>
                <div className="text-xl font-bold">$550</div>
                <div className="text-xs text-healthcare-gray mt-1">3 invoices</div>
              </div>
              <div className="col-span-2 bg-red-50 rounded-lg p-3">
                <div className="text-sm text-healthcare-danger">Overdue</div>
                <div className="text-xl font-bold text-healthcare-danger">$310.75</div>
                <div className="text-xs text-healthcare-gray mt-1">1 invoice</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-healthcare-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-healthcare-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.slice(0, 3).map((invoice) => (
                <div key={invoice.id} className="flex items-center p-2 rounded-lg hover:bg-healthcare-secondary transition-colors">
                  <div className="h-8 w-8 rounded-full bg-healthcare-gray-light flex items-center justify-center mr-3">
                    <File className="h-4 w-4 text-healthcare-gray" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm font-medium">{invoice.patientName}</div>
                    <div className="flex justify-between">
                      <div className="text-xs text-healthcare-gray">{invoice.date}</div>
                      <div className="text-xs font-medium">${invoice.amount.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full justify-between mt-2">
                View all transactions
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-healthcare-gray-light animate-fade-in">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-semibold">Invoices</CardTitle>
            <Tabs defaultValue="all">
              <TabsList className="p-0 h-8 bg-transparent">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-healthcare-highlight data-[state=active]:text-healthcare-primary"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="paid"
                  className="data-[state=active]:bg-healthcare-highlight data-[state=active]:text-healthcare-primary"
                >
                  Paid
                </TabsTrigger>
                <TabsTrigger 
                  value="pending"
                  className="data-[state=active]:bg-healthcare-highlight data-[state=active]:text-healthcare-primary"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger 
                  value="overdue"
                  className="data-[state=active]:bg-healthcare-highlight data-[state=active]:text-healthcare-primary"
                >
                  Overdue
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search invoices..." 
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-healthcare-gray" />
                      {invoice.patientName}
                    </div>
                  </TableCell>
                  <TableCell>{invoice.service}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-healthcare-gray" />
                      {invoice.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-healthcare-gray" />
                      {invoice.amount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        invoice.status === "paid" 
                          ? "default" 
                          : invoice.status === "pending" 
                            ? "outline" 
                            : "destructive"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
