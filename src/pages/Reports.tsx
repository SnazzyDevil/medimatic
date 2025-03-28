
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, Filter, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";

type ReportType = "inventory" | "patients" | "financials" | "dispensing";

// Function to fetch inventory data
const fetchInventoryData = async () => {
  const { data, error } = await supabase
    .from('inventory')
    .select('id, item_code, name, category, stock, unit_cost, supplier_name, status')
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  return data || [];
};

// Function to fetch patients data
const fetchPatientsData = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('id, first_name, last_name, contact_number, email, medical_aid_number, address')
    .order('last_name', { ascending: true });
  
  if (error) throw error;
  
  return data.map(patient => ({
    id: patient.id,
    name: `${patient.first_name} ${patient.last_name}`,
    contact: patient.contact_number,
    email: patient.email || 'N/A',
    medicalAid: patient.medical_aid_number || 'N/A',
    address: patient.address || 'N/A'
  })) || [];
};

// Function to fetch financial data
const fetchFinancialData = async () => {
  const { data: invoicesData, error: invoicesError } = await supabase
    .from('invoices')
    .select('id, patient_id, invoice_date, total_amount, status, paid_amount')
    .order('invoice_date', { ascending: false });
  
  if (invoicesError) throw invoicesError;
  
  // Get patient names
  const patientIds = invoicesData.map(inv => inv.patient_id);
  const { data: patientsData, error: patientsError } = await supabase
    .from('patients')
    .select('id, first_name, last_name')
    .in('id', patientIds);
  
  if (patientsError) throw patientsError;
  
  // Create patient lookup
  const patientMap = patientsData.reduce((acc, p) => {
    acc[p.id] = `${p.first_name} ${p.last_name}`;
    return acc;
  }, {});
  
  // Format financial data
  return invoicesData.map(inv => ({
    id: inv.id,
    invoiceNumber: `INV-${inv.id.substring(0, 8)}`,
    patient: patientMap[inv.patient_id] || 'Unknown Patient',
    date: new Date(inv.invoice_date).toLocaleDateString(),
    amount: inv.total_amount,
    status: inv.status,
    paymentMethod: inv.paid_amount > 0 ? 'Credit Card' : 'Pending'
  })) || [];
};

// Function to fetch dispensing data
const fetchDispensingData = async () => {
  const { data, error } = await supabase
    .from('dispensing')
    .select('id, medication_name, patient_name, quantity, dosage, frequency, dispensing_staff, dispensing_date')
    .order('dispensing_date', { ascending: false });
  
  if (error) throw error;
  
  return data || [];
};

export default function Reports() {
  const [fromDate, setFromDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState<ReportType>("inventory");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  // Filter dialog state
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    minAmount: "",
    maxAmount: "",
    status: "",
    category: ""
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data based on report type
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report-data', reportType],
    queryFn: () => {
      switch (reportType) {
        case 'inventory':
          return fetchInventoryData();
        case 'patients':
          return fetchPatientsData();
        case 'financials':
          return fetchFinancialData();
        case 'dispensing':
          return fetchDispensingData();
        default:
          return [];
      }
    }
  });
  
  // Apply filters to the data
  const getFilteredData = () => {
    if (!reportData) return [];
    
    let filtered = [...reportData];
    
    // Apply amount filter if present
    if (filterOptions.minAmount && filterOptions.maxAmount) {
      const min = parseFloat(filterOptions.minAmount);
      const max = parseFloat(filterOptions.maxAmount);
      
      if (reportType === 'inventory') {
        filtered = filtered.filter(item => 
          item.unit_cost >= min && item.unit_cost <= max
        );
      } else if (reportType === 'financials') {
        filtered = filtered.filter(item => 
          item.amount >= min && item.amount <= max
        );
      }
    } else if (filterOptions.minAmount) {
      const min = parseFloat(filterOptions.minAmount);
      
      if (reportType === 'inventory') {
        filtered = filtered.filter(item => item.unit_cost >= min);
      } else if (reportType === 'financials') {
        filtered = filtered.filter(item => item.amount >= min);
      }
    } else if (filterOptions.maxAmount) {
      const max = parseFloat(filterOptions.maxAmount);
      
      if (reportType === 'inventory') {
        filtered = filtered.filter(item => item.unit_cost <= max);
      } else if (reportType === 'financials') {
        filtered = filtered.filter(item => item.amount <= max);
      }
    }
    
    // Apply status filter if present
    if (filterOptions.status && filterOptions.status !== 'all-statuses') {
      filtered = filtered.filter(item => item.status === filterOptions.status);
    }
    
    // Apply category filter if present
    if (filterOptions.category && filterOptions.category !== 'all-categories') {
      if (reportType === 'inventory') {
        filtered = filtered.filter(item => item.category === filterOptions.category);
      }
    }
    
    return filtered;
  };

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      toast({
        title: "Date range required",
        description: "Please select both from and to dates",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const fromDateStr = format(fromDate, "yyyy-MM-dd");
      const toDateStr = format(toDate, "yyyy-MM-dd");
      
      const filteredData = getFilteredData();
      const csvData = prepareCSVData(filteredData);
      
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${reportType}_report_${fromDateStr}_to_${toDateStr}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Generated",
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been downloaded`,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const prepareCSVData = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeader = headers.join(',');
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap fields with commas in quotes
        const formatted = typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
        return formatted;
      }).join(',');
    });
    
    return [csvHeader, ...csvRows].join('\n');
  };

  const applyFilters = () => {
    const newFilters: string[] = [];
    
    if (filterOptions.minAmount && filterOptions.maxAmount) {
      newFilters.push(`Amount: R${filterOptions.minAmount} - R${filterOptions.maxAmount}`);
    } else if (filterOptions.minAmount) {
      newFilters.push(`Min Amount: R${filterOptions.minAmount}`);
    } else if (filterOptions.maxAmount) {
      newFilters.push(`Max Amount: R${filterOptions.maxAmount}`);
    }
    
    if (filterOptions.status && filterOptions.status !== 'all-statuses') {
      newFilters.push(`Status: ${filterOptions.status}`);
    }
    
    if (filterOptions.category && filterOptions.category !== 'all-categories') {
      newFilters.push(`Category: ${filterOptions.category}`);
    }
    
    setActiveFilters(newFilters);
    setShowFilters(newFilters.length > 0);
    setFilterDialogOpen(false);
  };
  
  const clearFilters = () => {
    setFilterOptions({
      minAmount: "",
      maxAmount: "",
      status: "",
      category: ""
    });
    setActiveFilters([]);
    setShowFilters(false);
  };
  
  const removeFilter = (filter: string) => {
    const newFilters = activeFilters.filter(f => f !== filter);
    
    // Reset the corresponding filter option
    if (filter.startsWith("Amount:") || filter.startsWith("Min Amount:") || filter.startsWith("Max Amount:")) {
      setFilterOptions(prev => ({...prev, minAmount: "", maxAmount: ""}));
    } else if (filter.startsWith("Status:")) {
      setFilterOptions(prev => ({...prev, status: ""}));
    } else if (filter.startsWith("Category:")) {
      setFilterOptions(prev => ({...prev, category: ""}));
    }
    
    setActiveFilters(newFilters);
    setShowFilters(newFilters.length > 0);
  };

  // Get available categories based on the report type
  const getFilterCategories = () => {
    if (!reportData || reportData.length === 0) return [];
    
    if (reportType === 'inventory') {
      const categories = new Set(reportData.map(item => item.category));
      return Array.from(categories);
    }
    
    return [];
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 pl-16 px-4 py-8 md:px-8 lg:px-12">
        <Header />
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Reports</h1>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-medium mb-4">Report Type</h2>
                <Tabs 
                  value={reportType} 
                  onValueChange={(value) => setReportType(value as ReportType)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="patients">Patients</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="dispensing">Dispensing</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-4">Date Range</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-2 block">From</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fromDate ? (
                            format(fromDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fromDate}
                          onSelect={setFromDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground mb-2 block">To</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {toDate ? (
                            format(toDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={toDate}
                          onSelect={setToDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => setFilterDialogOpen(true)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Add Filters
              </Button>
              
              <Button 
                className="gap-2" 
                onClick={handleGenerateReport} 
                disabled={isGenerating || !fromDate || !toDate || isLoading || !reportData}
              >
                <Download className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>
            </div>
            
            {showFilters && (
              <div className="border rounded-lg p-4 mt-6 bg-slate-50">
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
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report Preview
            </h2>
            <p className="text-muted-foreground mb-4">
              This report will include {reportType} data from {fromDate ? format(fromDate, "MMMM d, yyyy") : "[select date]"} to {toDate ? format(toDate, "MMMM d, yyyy") : "[select date]"}.
            </p>
            
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : !reportData || reportData.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No data available for this report type
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(reportData[0]).map((header) => (
                          <TableHead key={header}>
                            {header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredData().slice(0, 5).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.values(row).map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>
                              {cell !== null && cell !== undefined ? cell.toString() : 'N/A'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</DialogTitle>
            <DialogDescription>
              Add filters to customize your report
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(reportType === "financials" || reportType === "inventory") && (
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
            )}
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filterOptions.status}
                onValueChange={(value) => setFilterOptions({...filterOptions, status: value})}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all-statuses" value="all-statuses">All</SelectItem>
                  {reportType === "inventory" && (
                    <>
                      <SelectItem key="In Stock" value="In Stock">In Stock</SelectItem>
                      <SelectItem key="Low Stock" value="Low Stock">Low Stock</SelectItem>
                      <SelectItem key="Out of Stock" value="Out of Stock">Out of Stock</SelectItem>
                    </>
                  )}
                  {reportType === "financials" && (
                    <>
                      <SelectItem key="paid" value="paid">Paid</SelectItem>
                      <SelectItem key="pending" value="pending">Pending</SelectItem>
                      <SelectItem key="overdue" value="overdue">Overdue</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {reportType === "inventory" && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filterOptions.category}
                  onValueChange={(value) => setFilterOptions({...filterOptions, category: value})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all-categories" value="all-categories">All</SelectItem>
                    {getFilterCategories().map((category, index) => (
                      <SelectItem key={`category-${index}`} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
