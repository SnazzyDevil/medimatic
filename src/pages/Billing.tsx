
import { useState } from "react";
import { FileText, Download, Calendar, User, DollarSign, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Billing = () => {
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [patientsData, setPatientsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [newInvoice, setNewInvoice] = useState({
    patientName: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    amount: "",
    service: "",
    status: "pending"
  });

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      
      if (error) throw error;
      
      setPatientsData(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatientsData([]);
    }
  };

  const handleCreateInvoice = async () => {
    if (!newInvoice.patientName || !newInvoice.amount || !newInvoice.service) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate an invoice ID
      const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // In a real app, you would save this to the database
      console.log("Creating invoice:", { ...newInvoice, id: invoiceId });
      
      // Here you would normally insert the invoice into the database
      // For demonstration, we'll just show a success toast
      
      toast({
        title: "Invoice created",
        description: `Invoice ${invoiceId} has been created successfully.`,
      });
      
      setOpenInvoiceDialog(false);
      setNewInvoice({
        patientName: "",
        invoiceDate: new Date().toISOString().split('T')[0],
        amount: "",
        service: "",
        status: "pending"
      });
      
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
                  fetchPatients();
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Enter the information to create a new invoice.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patientName" className="text-right">Patient Name</Label>
                  <Select
                    value={newInvoice.patientName}
                    onValueChange={(value) => setNewInvoice({...newInvoice, patientName: value})}
                  >
                    <SelectTrigger className="col-span-3" id="patientName">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsData.map(patient => (
                        <SelectItem key={patient.id} value={`${patient.first_name} ${patient.last_name}`}>
                          {patient.first_name} {patient.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="invoiceDate" className="text-right">Date</Label>
                  <div className="col-span-3 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={newInvoice.invoiceDate}
                      onChange={(e) => setNewInvoice({...newInvoice, invoiceDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="service" className="text-right">Service</Label>
                  <Input
                    id="service"
                    value={newInvoice.service}
                    onChange={(e) => setNewInvoice({...newInvoice, service: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., Consultation, Check-up, Lab Tests"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Amount</Label>
                  <div className="col-span-3 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenInvoiceDialog(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleCreateInvoice} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Invoice"}
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
