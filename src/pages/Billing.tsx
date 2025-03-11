import { useState } from "react";
import { FileText, Download, Calendar, DollarSign, Plus, X, Edit2, ChevronsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CustomerSection, type Patient, type PracticeInfo } from "@/components/billing/CustomerSection";

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

const Billing = () => {
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const currentDate = new Date().toISOString().split('T')[0];

  const practiceInfo: PracticeInfo = {
    name: "PharmaCare Clinic",
    address: "123 Healthcare Avenue, Medical District, 12345",
    phone: "+27 12 345 6789",
    email: "info@pharmacare.co.za",
    website: "www.pharmacare.co.za",
    regNumber: "REG-12345-ZA",
    vatNumber: "VAT4567890123"
  };
  
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
    currency: "USD",
    notes: "",
    practiceInfo: practiceInfo
  });
  
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [paymentDueDate, setPaymentDueDate] = useState<Date>(new Date());

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
    if (!newInvoice.patientName) {
      toast({
        title: "Missing information",
        description: "Please select a patient.",
        variant: "destructive"
      });
      return;
    }

    if (invoiceItems.some(item => !item.description || !item.price)) {
      toast({
        title: "Missing information",
        description: "Please fill in all item details.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating invoice:", newInvoice);
      
      toast({
        title: "Invoice created",
        description: `Invoice ${newInvoice.invoiceNumber} has been created successfully.`,
      });
      
      setOpenInvoiceDialog(false);
      resetInvoiceForm();
      
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
      currency: "USD",
      notes: "",
      practiceInfo: practiceInfo
    });
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
              <Button variant="outline" className="btn-hover">
                <Download className="h-4 w-4 mr-2" />
                Download Reports
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
                  practiceInfo={practiceInfo}
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
                            disabled={invoiceItems.length === 1}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-2 bg-background">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddItem}
                      className="text-primary"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add an item
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="w-1/2 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{Number(newInvoice.subtotal).toFixed(2)}</span>
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
                        <Select defaultValue="USD">
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
                      <span className="font-medium">{Number(newInvoice.total).toFixed(2)}</span>
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
                <Button variant="outline" onClick={() => setOpenInvoiceDialog(false)}>
                  Preview
                </Button>
                <Button onClick={handleCreateInvoice} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Save and continue"}
                  <ChevronsDown className="h-4 w-4 ml-1" />
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
