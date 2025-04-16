
import { 
  ArrowRight, 
  Calendar, 
  ChevronDown, 
  CreditCard, 
  Banknote, 
  Download, 
  File, 
  Filter, 
  Search, 
  TrendingUp, 
  User,
  X,
  MoreHorizontal,
  Loader2
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface Invoice {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  service: string;
}

// Function to format date to readable string
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  } catch (error) {
    return dateString;
  }
};

// Function to fetch invoices from Supabase
const fetchInvoices = async () => {
  const { data: invoicesData, error: invoicesError } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_date,
      due_date,
      total_amount,
      paid_amount,
      status,
      notes,
      patients(first_name, last_name)
    `)
    .order('invoice_date', { ascending: false });

  if (invoicesError) throw new Error(invoicesError.message);

  // Get invoice items to determine services
  const { data: itemsData, error: itemsError } = await supabase
    .from('invoice_items')
    .select('invoice_id, description');

  if (itemsError) throw new Error(itemsError.message);
  
  // Create a map of invoice_id to service descriptions
  const serviceMap: Record<string, string> = {};
  itemsData.forEach(item => {
    if (!serviceMap[item.invoice_id]) {
      serviceMap[item.invoice_id] = item.description;
    }
  });

  // Format invoices data
  return invoicesData.map(invoice => ({
    id: invoice.id,
    patientName: `${invoice.patients?.first_name || ''} ${invoice.patients?.last_name || ''}`.trim(),
    date: formatDate(invoice.invoice_date),
    amount: Number(invoice.total_amount),
    status: invoice.status as "paid" | "pending" | "overdue",
    service: serviceMap[invoice.id] || "Consultation"
  }));
};

// Function to fetch revenue data from Supabase
const fetchRevenueData = async () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const months = [];
  
  // Generate the last 6 months including current month
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({
      month: format(month, "MMM"),
      year: month.getFullYear(),
      monthIndex: month.getMonth()
    });
  }
  
  // Fetch all paid invoices for the current year
  const { data: invoicesData, error: invoicesError } = await supabase
    .from('invoices')
    .select('invoice_date, paid_amount, status')
    .gte('invoice_date', `${currentYear}-01-01`)
    .lte('invoice_date', `${currentYear}-12-31`);
  
  if (invoicesError) throw new Error(invoicesError.message);
  
  // Calculate monthly revenue
  const monthlyRevenue = months.map(monthData => {
    const amount = invoicesData
      .filter(invoice => {
        const invoiceDate = new Date(invoice.invoice_date);
        return (
          invoiceDate.getMonth() === monthData.monthIndex &&
          invoiceDate.getFullYear() === monthData.year &&
          (invoice.status === 'paid' || Number(invoice.paid_amount) > 0)
        );
      })
      .reduce((sum, invoice) => sum + Number(invoice.paid_amount), 0);
    
    return {
      month: monthData.month,
      amount
    };
  });
  
  // Calculate percentage change from previous month if available
  let percentChange = 0;
  if (monthlyRevenue.length >= 2) {
    const currentMonth = monthlyRevenue[monthlyRevenue.length - 1].amount;
    const prevMonth = monthlyRevenue[monthlyRevenue.length - 2].amount;
    
    if (prevMonth > 0) {
      percentChange = ((currentMonth - prevMonth) / prevMonth) * 100;
    }
  }
  
  return {
    monthlyRevenue,
    currentMonthRevenue: monthlyRevenue[monthlyRevenue.length - 1]?.amount || 0,
    percentChange
  };
};

// Function to fetch payment summary data
const fetchPaymentSummary = async () => {
  const { data: invoicesData, error: invoicesError } = await supabase
    .from('invoices')
    .select('status, total_amount, paid_amount');
  
  if (invoicesError) throw new Error(invoicesError.message);
  
  const paidInvoices = invoicesData.filter(invoice => invoice.status === 'paid');
  const pendingInvoices = invoicesData.filter(invoice => invoice.status === 'pending');
  const overdueInvoices = invoicesData.filter(invoice => invoice.status === 'overdue');
  
  const paidAmount = paidInvoices.reduce((sum, invoice) => sum + Number(invoice.paid_amount), 0);
  const pendingAmount = pendingInvoices.reduce((sum, invoice) => sum + Number(invoice.total_amount) - Number(invoice.paid_amount), 0);
  const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + Number(invoice.total_amount) - Number(invoice.paid_amount), 0);
  
  return {
    paidAmount,
    pendingAmount,
    overdueAmount,
    paidCount: paidInvoices.length,
    pendingCount: pendingInvoices.length,
    overdueCount: overdueInvoices.length
  };
};

export function BillingOverview() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    minAmount: "",
    maxAmount: "",
    date: "",
    service: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);

  // Fetch invoices data using React Query
  const { 
    data: invoices, 
    isLoading: invoicesLoading, 
    error: invoicesError 
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices
  });

  // Fetch revenue data using React Query
  const { 
    data: revenueData, 
    isLoading: revenueLoading,
    error: revenueError
  } = useQuery({
    queryKey: ['revenue'],
    queryFn: fetchRevenueData
  });

  // Fetch payment summary data using React Query
  const { 
    data: paymentSummary, 
    isLoading: paymentSummaryLoading,
    error: paymentSummaryError
  } = useQuery({
    queryKey: ['payment-summary'],
    queryFn: fetchPaymentSummary
  });

  // Apply filters to invoices
  const filteredInvoices = invoices ? invoices.filter(invoice => {
    if (activeTab !== 'all' && invoice.status !== activeTab) {
      return false;
    }

    const matchesSearch = searchQuery.trim() === '' || 
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCustomFilters = true;
    
    if (filterOptions.minAmount && parseFloat(filterOptions.minAmount) > invoice.amount) {
      matchesCustomFilters = false;
    }
    
    if (filterOptions.maxAmount && parseFloat(filterOptions.maxAmount) < invoice.amount) {
      matchesCustomFilters = false;
    }
    
    if (filterOptions.date && !invoice.date.includes(filterOptions.date)) {
      matchesCustomFilters = false;
    }
    
    if (filterOptions.service && !invoice.service.includes(filterOptions.service)) {
      matchesCustomFilters = false;
    }
    
    return matchesSearch && matchesCustomFilters;
  }) : [];

  const applyFilters = () => {
    const newFilters: string[] = [];
    
    if (filterOptions.minAmount && filterOptions.maxAmount) {
      newFilters.push(`Amount: R${filterOptions.minAmount} - R${filterOptions.maxAmount}`);
    } else if (filterOptions.minAmount) {
      newFilters.push(`Min Amount: R${filterOptions.minAmount}`);
    } else if (filterOptions.maxAmount) {
      newFilters.push(`Max Amount: R${filterOptions.maxAmount}`);
    }
    
    if (filterOptions.date) {
      newFilters.push(`Date: ${filterOptions.date}`);
    }
    
    if (filterOptions.service) {
      newFilters.push(`Service: ${filterOptions.service}`);
    }
    
    setActiveFilters(newFilters);
    setShowFilters(newFilters.length > 0);
    setFilterDialogOpen(false);
  };
  
  const clearFilters = () => {
    setFilterOptions({
      minAmount: "",
      maxAmount: "",
      date: "",
      service: ""
    });
    setActiveFilters([]);
    setShowFilters(false);
  };
  
  const removeFilter = (filter: string) => {
    const newFilters = activeFilters.filter(f => f !== filter);
    
    if (filter.startsWith("Amount:") || filter.startsWith("Min Amount:") || filter.startsWith("Max Amount:")) {
      setFilterOptions(prev => ({...prev, minAmount: "", maxAmount: ""}));
    } else if (filter.startsWith("Date:")) {
      setFilterOptions(prev => ({...prev, date: ""}));
    } else if (filter.startsWith("Service:")) {
      setFilterOptions(prev => ({...prev, service: ""}));
    }
    
    setActiveFilters(newFilters);
    setShowFilters(newFilters.length > 0);
  };

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Invoices are being exported to CSV",
    });
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: "paid" | "pending" | "overdue") => {
    setStatusUpdateLoading(invoiceId);
    
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId);
          
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Invoice status changed to ${newStatus}`,
      });

      // Refresh queries
      await Promise.all([
        fetchInvoices(),
        fetchPaymentSummary(),
        fetchRevenueData()
      ]);
      
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast({
        title: "Update failed",
        description: "Could not update invoice status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border border-healthcare-gray-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Banknote className="h-4 w-4 mr-1 text-healthcare-primary" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-healthcare-primary" />
              </div>
            ) : revenueError ? (
              <div className="text-center text-red-500 py-4">
                Failed to load revenue data
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  R {revenueData?.currentMonthRevenue.toFixed(2)}
                </div>
                <div className="flex items-center text-sm text-healthcare-success">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  <span>{revenueData?.percentChange.toFixed(1)}% from last month</span>
                </div>
                <div className="pt-4 h-24 flex items-end space-x-2">
                  {revenueData?.monthlyRevenue.map((item) => {
                    const maxRevenue = Math.max(...revenueData.monthlyRevenue.map(i => i.amount));
                    const heightPercentage = maxRevenue > 0 ? (item.amount / maxRevenue) * 80 : 0;
                    const isCurrentMonth = item.month === revenueData.monthlyRevenue[revenueData.monthlyRevenue.length - 1].month;
                    
                    return (
                      <div key={item.month} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-healthcare-primary rounded-t-sm transition-all animate-pulse-subtle" 
                          style={{ 
                            height: `${heightPercentage}px`,
                            opacity: isCurrentMonth ? 1 : 0.6 
                          }}
                        />
                        <div className="text-xs mt-1 text-healthcare-gray">{item.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
            {paymentSummaryLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-healthcare-primary" />
              </div>
            ) : paymentSummaryError ? (
              <div className="text-center text-red-500 py-4">
                Failed to load payment data
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-healthcare-highlight rounded-lg p-3">
                  <div className="text-sm text-healthcare-gray">Paid</div>
                  <div className="text-xl font-bold text-healthcare-primary">
                    R {paymentSummary?.paidAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-healthcare-gray mt-1">
                    {paymentSummary?.paidCount} invoices
                  </div>
                </div>
                <div className="bg-healthcare-secondary rounded-lg p-3">
                  <div className="text-sm text-healthcare-gray">Pending</div>
                  <div className="text-xl font-bold">
                    R {paymentSummary?.pendingAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-healthcare-gray mt-1">
                    {paymentSummary?.pendingCount} invoices
                  </div>
                </div>
                <div className="col-span-2 bg-red-50 rounded-lg p-3">
                  <div className="text-sm text-healthcare-danger">Overdue</div>
                  <div className="text-xl font-bold text-healthcare-danger">
                    R {paymentSummary?.overdueAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-healthcare-gray mt-1">
                    {paymentSummary?.overdueCount} invoice{paymentSummary?.overdueCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}
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
            {invoicesLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-healthcare-primary" />
              </div>
            ) : invoicesError ? (
              <div className="text-center text-red-500 py-4">
                Failed to load activity data
              </div>
            ) : (
              <div className="space-y-3">
                {invoices && invoices.length > 0 ? (
                  invoices.slice(0, 3).map((invoice) => (
                    <div key={invoice.id} className="flex items-center p-2 rounded-lg hover:bg-healthcare-secondary transition-colors">
                      <div className="h-8 w-8 rounded-full bg-healthcare-gray-light flex items-center justify-center mr-3">
                        <File className="h-4 w-4 text-healthcare-gray" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-medium">{invoice.patientName}</div>
                        <div className="flex justify-between">
                          <div className="text-xs text-healthcare-gray">{invoice.date}</div>
                          <div className="text-xs font-medium">R {invoice.amount.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent activity
                  </div>
                )}
                <Button variant="ghost" size="sm" className="w-full justify-between mt-2">
                  View all transactions
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-healthcare-gray-light animate-fade-in">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl font-semibold">Invoices</CardTitle>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFilterDialogOpen(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="border rounded-lg p-4 mt-4 bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Active filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="outline" className="bg-white flex items-center gap-1">
                    {filter}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeFilter(filter)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-healthcare-primary" />
            </div>
          ) : invoicesError ? (
            <div className="text-center py-8 text-red-500">
              Error loading invoice data
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No invoices found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id.substring(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-healthcare-gray" />
                          {invoice.patientName || "Unknown Patient"}
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
                          <Banknote className="h-4 w-4 mr-1 text-healthcare-gray" />
                          R {invoice.amount.toFixed(2)}
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              disabled={statusUpdateLoading === invoice.id}
                            >
                              {statusUpdateLoading === invoice.id ? (
                                <div className="h-4 w-4 border-2 border-t-transparent border-healthcare-primary animate-spin rounded-full"></div>
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => updateInvoiceStatus(invoice.id, "paid")}
                              disabled={invoice.status === "paid"}
                              className={invoice.status === "paid" ? "bg-gray-100" : ""}
                            >
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateInvoiceStatus(invoice.id, "pending")}
                              disabled={invoice.status === "pending"}
                              className={invoice.status === "pending" ? "bg-gray-100" : ""}
                            >
                              Mark as Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateInvoiceStatus(invoice.id, "overdue")}
                              disabled={invoice.status === "overdue"}
                              className={invoice.status === "overdue" ? "bg-gray-100" : ""}
                            >
                              Mark as Overdue
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Invoices</DialogTitle>
            <DialogDescription>
              Filter invoices by amount, date, and service type
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount">Min Amount</Label>
                <Input
                  id="minAmount"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  value={filterOptions.minAmount}
                  onChange={(e) => setFilterOptions({...filterOptions, minAmount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount">Max Amount</Label>
                <Input
                  id="maxAmount"
                  placeholder="1000.00"
                  type="number"
                  step="0.01"
                  value={filterOptions.maxAmount}
                  onChange={(e) => setFilterOptions({...filterOptions, maxAmount: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Select
                value={filterOptions.date}
                onValueChange={(value) => setFilterOptions({...filterOptions, date: value})}
              >
                <SelectTrigger id="date">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-dates">All dates</SelectItem>
                  <SelectItem value="January">January {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="February">February {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="March">March {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="April">April {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="May">May {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="June">June {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="July">July {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="August">August {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="September">September {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="October">October {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="November">November {new Date().getFullYear()}</SelectItem>
                  <SelectItem value="December">December {new Date().getFullYear()}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service">Service Type</Label>
              <Select
                value={filterOptions.service}
                onValueChange={(value) => setFilterOptions({...filterOptions, service: value})}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-services">All services</SelectItem>
                  <SelectItem value="Check-up">Check-up</SelectItem>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Physical">Physical</SelectItem>
                  <SelectItem value="Lab Tests">Lab Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
