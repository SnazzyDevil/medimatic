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

type ReportType = "inventory" | "patients" | "financials" | "dispensing";

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
      
      const headers = getReportHeaders(reportType);
      const sampleData = getSampleData(reportType);
      
      const csvContent = `${headers.join(",")}\n${sampleData.map(row => row.join(",")).join("\n")}`;
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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

  const applyFilters = () => {
    const newFilters: string[] = [];
    
    if (filterOptions.minAmount && filterOptions.maxAmount) {
      newFilters.push(`Amount: R${filterOptions.minAmount} - R${filterOptions.maxAmount}`);
    } else if (filterOptions.minAmount) {
      newFilters.push(`Min Amount: R${filterOptions.minAmount}`);
    } else if (filterOptions.maxAmount) {
      newFilters.push(`Max Amount: R${filterOptions.maxAmount}`);
    }
    
    if (filterOptions.status) {
      newFilters.push(`Status: ${filterOptions.status}`);
    }
    
    if (filterOptions.category) {
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

  const getReportHeaders = (type: ReportType): string[] => {
    switch (type) {
      case "inventory":
        return ["Item Code", "Name", "Category", "Quantity", "Unit Cost", "Supplier", "Status"];
      case "patients":
        return ["Patient ID", "Name", "Contact", "Email", "Medical Aid Number", "Address"];
      case "financials":
        return ["Invoice Number", "Patient", "Date", "Amount", "Status", "Payment Method"];
      case "dispensing":
        return ["Medication", "Patient", "Quantity", "Dosage", "Frequency", "Dispensed By", "Dispensing Date"];
      default:
        return [];
    }
  };

  const getSampleData = (type: ReportType): string[][] => {
    switch (type) {
      case "inventory":
        return [
          ["MED001", "Paracetamol 500mg", "Analgesics", "240", "R 0.15", "PharmSupply Inc", "In Stock"],
          ["MED002", "Amoxicillin 250mg", "Antibiotics", "180", "R 0.25", "MedSource Ltd", "Low Stock"],
          ["MED003", "Salbutamol Inhaler", "Respiratory", "45", "R 12.50", "BreathEasy Co", "In Stock"],
          ["MED004", "Metformin 500mg", "Diabetes", "320", "R 0.18", "DiaCare Supplies", "In Stock"],
          ["MED005", "Lisinopril 10mg", "Cardiovascular", "90", "R 0.30", "HeartHealth Ltd", "Out of Stock"]
        ];
      case "patients":
        return [
          ["PAT001", "John Smith", "555-123-4567", "john.smith@email.com", "MA12345", "123 Main St"],
          ["PAT002", "Sarah Johnson", "555-234-5678", "sarah.j@email.com", "MA23456", "456 Oak Ave"],
          ["PAT003", "Michael Brown", "555-345-6789", "m.brown@email.com", "MA34567", "789 Pine Dr"],
          ["PAT004", "Emily Davis", "555-456-7890", "e.davis@email.com", "MA45678", "101 Cedar Ln"],
          ["PAT005", "David Wilson", "555-567-8901", "d.wilson@email.com", "MA56789", "202 Maple Rd"]
        ];
      case "financials":
        return [
          ["INV2024-001", "John Smith", "2024-05-01", "R 125.00", "Paid", "Credit Card"],
          ["INV2024-002", "Sarah Johnson", "2024-05-03", "R 75.50", "Pending", "Insurance"],
          ["INV2024-003", "Michael Brown", "2024-05-05", "R 210.25", "Paid", "Cash"],
          ["INV2024-004", "Emily Davis", "2024-05-08", "R 45.00", "Overdue", "Credit Card"],
          ["INV2024-005", "David Wilson", "2024-05-10", "R 180.75", "Paid", "Insurance"]
        ];
      case "dispensing":
        return [
          ["Paracetamol 500mg", "John Smith", "30", "1 tablet", "3x daily", "Dr. Jones", "2024-05-01"],
          ["Amoxicillin 250mg", "Sarah Johnson", "21", "1 capsule", "3x daily", "Dr. Smith", "2024-05-03"],
          ["Salbutamol Inhaler", "Michael Brown", "1", "2 puffs", "As needed", "Dr. Wilson", "2024-05-05"],
          ["Metformin 500mg", "Emily Davis", "60", "1 tablet", "2x daily", "Dr. Harris", "2024-05-08"],
          ["Lisinopril 10mg", "David Wilson", "30", "1 tablet", "Daily", "Dr. Taylor", "2024-05-10"]
        ];
      default:
        return [];
    }
  };

  const getFilterCategories = (): string[] => {
    switch (reportType) {
      case "inventory":
        return ["Antibiotics", "Pain Relief", "Respiratory", "Diabetes", "Cardiovascular"];
      case "patients":
        return ["Male", "Female", "Pediatric", "Geriatric", "New Patients"];
      case "financials":
        return ["Consultations", "Medications", "Procedures", "Lab Tests", "Supplies"];
      case "dispensing":
        return ["Antibiotics", "Pain Relief", "Respiratory", "Diabetes", "Cardiovascular"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <main className="flex-1 pl-16 px-4 py-8 md:px-8 lg:px-12">
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
                disabled={isGenerating || !fromDate || !toDate}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      {getReportHeaders(reportType).map((header, i) => (
                        <TableHead key={i}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getSampleData(reportType).map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <SelectItem value="all-statuses">All</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
                  <SelectItem value="all-categories">All</SelectItem>
                  {getFilterCategories().map((category, index) => (
                    <SelectItem key={index} value={category}>{category}</SelectItem>
                  ))}
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
