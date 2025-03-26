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
  MoreHorizontal 
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
import { useState } from "react";
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

interface Invoice {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  service: string;
}

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

const revenueData = [
  { month: "Jan", amount: 4200 },
  { month: "Feb", amount: 4800 },
  { month: "Mar", amount: 5100 },
  { month: "Apr", amount: 4900 },
  { month: "May", amount: 5400 },
  { month: "Jun", amount: 8200 },
];

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
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>(invoices);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);

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

  const filteredInvoices = localInvoices.filter(invoice => {
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
  });

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Invoices are being exported to CSV",
    });
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: "paid" | "pending" | "overdue") => {
    setStatusUpdateLoading(invoiceId);
    
    try {
      if (invoiceId.length === 36) {
        const { error } = await supabase
          .from('invoices')
          .update({ status: newStatus })
          .eq('id', invoiceId);
          
        if (error) throw error;
      }
      
      setLocalInvoices(prevInvoices => 
        prevInvoices.map(invoice => 
          invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
        )
      );
      
      toast({
        title: "Status updated",
        description: `Invoice ${invoiceId} status changed to ${newStatus}`,
      });
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
            <div className="space-y-2">
              <div className="text-3xl font-bold">R 8,200</div>
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
                <div className="text-xl font-bold text-healthcare-primary">R 7,650</div>
                <div className="text-xs text-healthcare-gray mt-1">12 invoices</div>
              </div>
              <div className="bg-healthcare-secondary rounded-lg p-3">
                <div className="text-sm text-healthcare-gray">Pending</div>
                <div className="text-xl font-bold">R 550</div>
                <div className="text-xs text-healthcare-gray mt-1">3 invoices</div>
              </div>
              <div className="col-span-2 bg-red-50 rounded-lg p-3">
                <div className="text-sm text-healthcare-danger">Overdue</div>
                <div className="text-xl font-bold text-healthcare-danger">R 310.75</div>
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
                      <div className="text-xs font-medium">R {invoice.amount.toFixed(2)}</div>
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
                  <SelectItem value="May">May 2023</SelectItem>
                  <SelectItem value="June">June 2023</SelectItem>
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
