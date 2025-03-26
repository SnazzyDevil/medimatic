import { useState, useEffect, useRef } from "react";
import { FileText, Download, Calendar, Banknote, Plus, X, Edit2, ChevronsDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { CustomerSection, type Patient, type PracticeInfo } from "@/components/billing/CustomerSection";
import { InvoicePreview } from "@/components/billing/InvoicePreview";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { PracticeService } from "@/services/practiceService";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  price: string;
  amount: number;
}

interface NewInvoice {
  patientName: string;
  patientId?: string;
  invoiceNumber: string;
  poNumber: string;
  invoiceDate: string;
  paymentDueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  notes: string;
  practiceInfo: PracticeInfo;
}

interface CreatedInvoice {
  id: string;
  invoice_number: string;
  patient_name: string;
  created_at: string;
  total_amount: number;
  status: string;
}

const Billing = () => {
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openInvoicesDialog, setOpenInvoicesDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [createdInvoices, setCreatedInvoices] = useState<CreatedInvoice[]>([]);
  const { toast } = useToast();
  const [afterSavePreview, setAfterSavePreview] = useState(false);
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  
  const currentDate = new Date().toISOString().split('T')[0];

  const { data: practice } = useQuery({
    queryKey: ['practiceInfo'],
    queryFn: () => PracticeService.getCurrentPractice(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const defaultPracticeInfo: PracticeInfo = {
    name: "Loading...",
    address: "",
    phone: "",
    email: "",
    regNumber: "",
    vatNumber: ""
  };

  const practiceInfo: PracticeInfo = practice ? {
    name: practice.name,
    address: `${practice.addressLine1}${practice.addressLine2 ? `, ${practice.addressLine2}` : ''}, ${practice.city}, ${practice.postalCode}`,
    phone: practice.phone,
    email: practice.email,
    website: practice.website,
    regNumber: practice.registrationNumber,
    vatNumber: practice.vatNumber || '',
  } : defaultPracticeInfo;
  
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: 1, description: "", quantity: 1, price: "", amount: 0 }
  ]);
  
  const [newInvoice, setNewInvoice] = useState<NewInvoice>({
    patientName: "",
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    poNumber: "",
    invoiceDate: currentDate,
    paymentDueDate: currentDate,
    items: invoiceItems,
    subtotal: 0,
    discount: 0,
    total: 0,
    currency: "ZAR",
    notes: "",
    practiceInfo: practiceInfo
  });
  
  useEffect(() => {
    if (practice) {
      setNewInvoice(prev => ({
        ...prev,
        practiceInfo: {
          name: practice.name,
          address: `${practice.addressLine1}${practice.addressLine2 ? `, ${practice.addressLine2}` : ''}, ${practice.city}, ${practice.postalCode}`,
          phone: practice.phone,
          email: practice.email,
          website: practice.website,
          regNumber: practice.registrationNumber,
          vatNumber: practice.vatNumber || '',
        }
      }));
    }
  }, [practice]);
  
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [paymentDueDate, setPaymentDueDate] = useState<Date>(new Date());

  const [inventoryItems, setInventoryItems] = useState<Array<{id: string, name: string, unit_cost: number, category: string}>>([]);
  const [searchResults, setSearchResults] = useState<Array<{id: string, name: string, unit_cost: number, category: string}>>([]);
  const [showItemsPopover, setShowItemsPopover] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('id, name, unit_cost, category')
          .order('name');
        
        if (error) {
          console.error('Error fetching inventory:', error);
          return;
        }
        
        setInventoryItems(data || []);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };
    
    fetchInventoryItems();
    fetchCreatedInvoices();
  }, []);

  const fetchCreatedInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id, 
          invoice_date,
          due_date,
          total_amount,
          status,
          created_at,
          patients!inner(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching invoices:', error);
        return;
      }
      
      const formattedInvoices = data?.map(invoice => ({
        id: invoice.id,
        invoice_number: invoice.id.substring(0, 8).toUpperCase(),
        patient_name: `${invoice.patients.first_name} ${invoice.patients.last_name}`,
        created_at: format(new Date(invoice.created_at), 'yyyy-MM-dd'),
        total_amount: invoice.total_amount,
        status: invoice.status
      })) || [];
      
      setCreatedInvoices(formattedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleAddItem = () => {
    const newId = invoiceItems.length ? Math.max(...invoiceItems.map(item => item.id)) + 1 : 1;
    setInvoiceItems([...invoiceItems, { id: newId, description: "", quantity: 1, price: "", amount: 0 }]);
    calculateTotals();
  };

  const handleRemoveItem = (id: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
      calculateTotals();
    }
  };
  
  const handleItemChange = (id: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoiceItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'quantity' || field === 'price') {
          const quantity = field === 'quantity' ? Number(value) : item.quantity;
          const price = field === 'price' ? value : item.price;
          updatedItem.amount = quantity * parseFloat(price.toString() || "0");
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setInvoiceItems(updatedItems);
    calculateTotals(updatedItems);
  };
  
  const calculateTotals = (items = invoiceItems) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = newInvoice.discount || 0;
    const total = subtotal - discountAmount;
    
    setNewInvoice(prev => ({
      ...prev,
      subtotal,
      total
    }));
  };

  const handlePatientSelect = (patient: Patient | null) => {
    console.log("Selected patient:", patient);
    setSelectedPatient(patient);
    
    if (patient) {
      setNewInvoice(prev => ({
        ...prev,
        patientName: `${patient.first_name} ${patient.last_name}`,
        patientId: patient.id
      }));
    } else {
      setNewInvoice(prev => ({
        ...prev,
        patientName: "",
        patientId: undefined
      }));
    }
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.patientName || !selectedPatient?.id) {
      toast({
        title: "Missing information",
        description: "Please select a patient.",
        variant: "destructive"
      });
      return;
    }

    const validItems = invoiceItems.filter(item => 
      item.description && item.price && parseFloat(item.price) > 0
    );

    if (validItems.length === 0) {
      toast({
        title: "Missing information",
        description: "Please add at least one item with description and price.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          patient_id: selectedPatient.id,
          invoice_date: newInvoice.invoiceDate,
          due_date: newInvoice.paymentDueDate,
          total_amount: newInvoice.total,
          notes: newInvoice.notes,
          status: 'pending'
        })
        .select('id')
        .single();
      
      if (invoiceError) {
        throw invoiceError;
      }
      
      const invoiceItems = validItems.map(item => ({
        invoice_id: invoiceData.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        amount: item.amount
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);
      
      if (itemsError) {
        throw itemsError;
      }
      
      toast({
        title: "Invoice created",
        description: `Invoice has been created successfully.`,
      });
      
      setOpenInvoiceDialog(false);
      setSavedInvoiceId(invoiceData.id);
      setAfterSavePreview(true);
      
      await fetchCreatedInvoices();
      
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: `Failed to create invoice: ${error.message || "Please try again."}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePreviewInvoice = () => {
    const updatedInvoice = {
      ...newInvoice,
      items: invoiceItems
    };
    setNewInvoice(updatedInvoice);
    setOpenPreviewDialog(true);
  };
  
  const resetInvoiceForm = () => {
    setInvoiceItems([{ id: 1, description: "", quantity: 1, price: "", amount: 0 }]);
    setInvoiceDate(new Date());
    setPaymentDueDate(new Date());
    setSelectedPatient(null);
    
    setNewInvoice({
      patientName: "",
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      poNumber: "",
      invoiceDate: currentDate,
      paymentDueDate: currentDate,
      items: invoiceItems,
      subtotal: 0,
      discount: 0,
      total: 0,
      currency: "ZAR",
      notes: "",
      practiceInfo: practiceInfo
    });
  };

  const handleDownloadReports = async () => {
    setDownloadingReport(true);
    try {
      const headers = [
        "Invoice Number",
        "Patient Name",
        "Issue Date",
        "Due Date",
        "Amount",
        "Status"
      ].join(",");
      
      const sampleData = [
        ["INV-2025-001", "Sarah Johnson", "2025-03-01", "2025-03-15", "R 250.00", "Paid"],
        ["INV-2025-002", "Michael Smith", "2025-03-03", "2025-03-18", "R 175.50", "Pending"],
        ["INV-2025-003", "Emma Davis", "2025-03-05", "2025-03-20", "R 320.75", "Overdue"],
        ["INV-2025-004", "Uven Rampersad", "2025-03-08", "2025-03-23", "R 195.25", "Paid"],
      ].map(row => row.join(",")).join("\n");
      
      const csvContent = `${headers}\n${sampleData}`;
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `billing_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Downloaded",
        description: "Billing report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const filtered = inventoryItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults(inventoryItems);
    }
  };
  
  const handleSelectInventoryItem = (item: {id: string, name: string, unit_cost: number, category: string}) => {
    const newId = invoiceItems.length ? Math.max(...invoiceItems.map(i => i.id)) + 1 : 1;
    
    const newItem = {
      id: newId,
      description: `${item.name} (${item.category})`,
      quantity: 1,
      price: item.unit_cost.toString(),
      amount: item.unit_cost
    };
    
    setInvoiceItems([...invoiceItems, newItem]);
    calculateTotals([...invoiceItems, newItem]);
    setShowItemsPopover(false);
    setSearchQuery("");
  };

  const handleAddCustomItem = () => {
    const newId = invoiceItems.length ? Math.max(...invoiceItems.map(item => item.id)) + 1 : 1;
    setInvoiceItems([...invoiceItems, { id: newId, description: "", quantity: 1, price: "", amount: 0 }]);
    calculateTotals();
    setShowItemsPopover(false);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (itemsPopoverRef.current && !itemsPopoverRef.current.contains(e.target as Node)) {
      setShowItemsPopover(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleEditInvoice = () => {
    setAfterSavePreview(false);
    setOpenInvoiceDialog(true);
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Billing</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="btn-hover"
                onClick={handleDownloadReports}
                disabled={downloadingReport}
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadingReport ? "Downloading..." : "Download Reports"}
              </Button>
              <Button 
                variant="outline"
                className="btn-hover"
                onClick={() => setOpenInvoicesDialog(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Invoices
              </Button>
              <Button 
                className="btn-hover"
                onClick={() => {
                  setOpenInvoiceDialog(true);
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>
          
          <BillingOverview />

          <Dialog open={openInvoiceDialog} onOpenChange={setOpenInvoiceDialog}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">New Invoice</DialogTitle>
                <DialogDescription>
                  Enter the information to create a new invoice.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <CustomerSection 
                  selectedPatient={selectedPatient} 
                  onPatientSelect={handlePatientSelect}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice number</Label>
                    <Input
                      id="invoiceNumber"
                      value={newInvoice.invoiceNumber}
                      onChange={(e) => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="poNumber">P.O./S.O. number</Label>
                    <Input
                      id="poNumber"
                      value={newInvoice.poNumber}
                      onChange={(e) => setNewInvoice({...newInvoice, poNumber: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceDate">Invoice date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !invoiceDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {invoiceDate ? format(invoiceDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={invoiceDate}
                          onSelect={(date) => {
                            setInvoiceDate(date || new Date());
                            setNewInvoice({
                              ...newInvoice, 
                              invoiceDate: date ? format(date, "yyyy-MM-dd") : currentDate
                            });
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor="paymentDueDate">Payment due</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !paymentDueDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {paymentDueDate ? format(paymentDueDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={paymentDueDate}
                          onSelect={(date) => {
                            setPaymentDueDate(date || new Date());
                            setNewInvoice({
                              ...newInvoice, 
                              paymentDueDate: date ? format(date, "yyyy-MM-dd") : currentDate
                            });
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Button variant="outline" size="sm" className="text-sm">
                    On Receipt
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" className="text-primary flex items-center">
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit columns
                  </Button>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 bg-muted p-2 text-sm font-medium">
                    <div className="col-span-6">Items</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  
                  <div className="divide-y">
                    {invoiceItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 p-2 items-center">
                        <div className="col-span-6">
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="text-center"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                            className="text-center"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          {Number(item.amount).toFixed(2)}
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-2 bg-background relative">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowItemsPopover(true);
                          setSearchResults(inventoryItems);
                        }}
                        className="text-primary"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add item
                      </Button>
                      
                      {showItemsPopover && (
                        <div 
                          ref={itemsPopoverRef}
                          className="absolute z-50 top-full left-0 mt-1 w-[500px] bg-white border rounded-md shadow-lg max-h-[350px] overflow-y-auto"
                        >
                          <div className="p-2 border-b">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Type an item name"
                                className="pl-8"
                                autoFocus
                              />
                            </div>
                          </div>
                          
                          <Command>
                            <CommandList>
                              <CommandGroup heading="Inventory Items">
                                {searchResults.length > 0 ? (
                                  searchResults.map((result) => (
                                    <CommandItem
                                      key={result.id}
                                      value={result.name}
                                      onSelect={() => handleSelectInventoryItem(result)}
                                      className="cursor-pointer flex justify-between items-center py-3 px-4 hover:bg-gray-50"
                                    >
                                      <div>
                                        <div className="font-medium">{result.name}</div>
                                        <div className="text-sm text-muted-foreground">{result.category}</div>
                                      </div>
                                      <div className="text-right">
                                        R{result.unit_cost.toFixed(2)}
                                      </div>
                                    </CommandItem>
                                  ))
                                ) : (
                                  <CommandEmpty>No items found.</CommandEmpty>
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                          
                          <div className="p-2 border-t flex justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddCustomItem}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Create a new item
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="w-1/2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>R {Number(newInvoice.subtotal).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary p-0 h-auto"
                        onClick={() => {
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add a discount
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Total</span>
                        <Select 
                          defaultValue="ZAR"
                          onValueChange={(value) => setNewInvoice({...newInvoice, currency: value})}
                        >
                          <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-accent px-2 w-auto">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="ZAR">ZAR (R)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <span className="font-medium">R {Number(newInvoice.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Label htmlFor="notes" className="text-sm mb-2 block">Notes / Terms</Label>
                  <Input
                    id="notes"
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                    placeholder="Add any notes or terms of service..."
                    className="h-16"
                  />
                </div>
              </div>
              
              <DialogFooter className="flex gap-2 pt-4">
                <Button variant="outline" onClick={handlePreviewInvoice}>
                  Preview
                </Button>
                <Button onClick={handleCreateInvoice} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Save and continue"}
                  <ChevronsDown className="h-4 w-4 ml-1" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <InvoicePreview 
            open={openPreviewDialog}
            onOpenChange={setOpenPreviewDialog}
            invoiceData={newInvoice}
            patient={selectedPatient}
          />
          
          <InvoicePreview 
            open={afterSavePreview}
            onOpenChange={setAfterSavePreview}
            invoiceData={newInvoice}
            patient={selectedPatient}
            onEdit={handleEditInvoice}
          />

          <Dialog open={openInvoicesDialog} onOpenChange={setOpenInvoicesDialog}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Invoices</DialogTitle>
                <DialogDescription>
                  View all created invoices
                </DialogDescription>
              </DialogHeader>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left font-medium">Invoice #</th>
                      <th className="px-4 py-2 text-left font-medium">Patient</th>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-right font-medium">Amount</th>
                      <th className="px-4 py-2 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {createdInvoices.length > 0 ? (
                      createdInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">{invoice.invoice_number}</td>
                          <td className="px-4 py-3">{invoice.patient_name}</td>
                          <td className="px-4 py-3">{invoice.created_at}</td>
                          <td className="px-4 py-3 text-right">R {invoice.total_amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                              ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-gray-500">
                          No invoices found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="secondary" 
                  onClick={() => setOpenInvoicesDialog(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Billing;
