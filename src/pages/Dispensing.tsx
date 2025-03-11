import { useState } from "react";
import { 
  CheckCircle, 
  AlertCircle, 
  Search, 
  User, 
  Pill, 
  ClipboardCheck, 
  ShieldAlert,
  XCircle,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose 
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const patientSample = {
  id: 1,
  name: "Sarah Johnson",
  dob: "08/15/1981",
  allergies: ["Penicillin", "Peanuts"],
  medications: [
    {
      id: 101,
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      quantity: 30,
      refills: 2,
      prescriber: "Dr. Michael Chen",
      prescribedDate: "2023-05-10",
      status: "pending",
      warnings: [],
      interactions: []
    },
    {
      id: 102,
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      quantity: 60,
      refills: 3,
      prescriber: "Dr. Michael Chen",
      prescribedDate: "2023-05-10",
      status: "pending",
      warnings: ["Take with food to minimize GI side effects"],
      interactions: []
    },
    {
      id: 103,
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "Three times daily",
      quantity: 21,
      refills: 0,
      prescriber: "Dr. Emma Wilson",
      prescribedDate: "2023-06-02",
      status: "pending",
      warnings: [],
      interactions: [
        {
          medication: "Metformin",
          severity: "moderate",
          description: "May affect blood glucose levels"
        }
      ]
    }
  ]
};

const Dispensing = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationComplete, setVerificationComplete] = useState({});
  const [openPrescriptionDialog, setOpenPrescriptionDialog] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientName: "",
    medicationName: "",
    dosage: "",
    frequency: "",
    quantity: "",
    refills: "0",
    prescriber: "",
    instructions: ""
  });

  const handleSelectMedication = (medication) => {
    setSelectedMedication(medication);
    setCurrentStep(2);
  };

  const handleVerifyMedication = () => {
    setVerificationComplete({
      ...verificationComplete,
      [selectedMedication.id]: true
    });
    setCurrentStep(3);
  };

  const handleCompleteDispensing = () => {
    setCurrentStep(4);
  };

  const handleBackToList = () => {
    setSelectedMedication(null);
    setCurrentStep(1);
  };

  const hasInteractions = (medication) => {
    return medication.interactions && medication.interactions.length > 0;
  };

  const hasWarnings = (medication) => {
    return medication.warnings && medication.warnings.length > 0;
  };

  const filteredMedications = patientSample.medications.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPrescription = () => {
    if (!newPrescription.patientName || !newPrescription.medicationName || 
        !newPrescription.dosage || !newPrescription.frequency || 
        !newPrescription.quantity || !newPrescription.prescriber) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }

    const newMed = {
      id: Date.now(),
      name: newPrescription.medicationName,
      dosage: newPrescription.dosage,
      frequency: newPrescription.frequency,
      quantity: parseInt(newPrescription.quantity),
      refills: parseInt(newPrescription.refills),
      prescriber: newPrescription.prescriber,
      prescribedDate: new Date().toISOString().split('T')[0],
      status: "pending",
      warnings: newPrescription.instructions ? [newPrescription.instructions] : [],
      interactions: []
    };

    toast({
      title: "Prescription Added",
      description: `Successfully added ${newPrescription.medicationName} for ${newPrescription.patientName}`,
    });

    setNewPrescription({
      patientName: "",
      medicationName: "",
      dosage: "",
      frequency: "",
      quantity: "",
      refills: "0",
      prescriber: "",
      instructions: ""
    });

    setOpenPrescriptionDialog(false);
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Medication Dispensing</h1>
            <Button 
              className="btn-hover"
              onClick={() => setOpenPrescriptionDialog(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </div>

          <Card className="mb-6 border-healthcare-primary/30">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-healthcare-primary text-white flex items-center justify-center mr-4">
                    {patientSample.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="font-medium">{patientSample.name}</h2>
                    <p className="text-sm text-healthcare-gray">DOB: {patientSample.dob}</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <h3 className="text-sm font-medium mb-1">Allergies:</h3>
                  <div className="flex flex-wrap gap-1">
                    {patientSample.allergies.map((allergy, index) => (
                      <Badge key={index} variant="outline" className="bg-red-50 border-red-200 text-red-700">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mb-6">
            <div className="flex items-center">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm ${
                currentStep >= 1 ? 'bg-healthcare-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className={`h-1 flex-1 ${
                currentStep >= 2 ? 'bg-healthcare-primary' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm ${
                currentStep >= 2 ? 'bg-healthcare-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className={`h-1 flex-1 ${
                currentStep >= 3 ? 'bg-healthcare-primary' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm ${
                currentStep >= 3 ? 'bg-healthcare-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <div className={`h-1 flex-1 ${
                currentStep >= 4 ? 'bg-healthcare-primary' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm ${
                currentStep >= 4 ? 'bg-healthcare-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                4
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>Select</span>
              <span>Verify</span>
              <span>Prepare</span>
              <span>Complete</span>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-medium">Select Medication to Dispense</h2>
              </div>
              
              <div className="relative w-full mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search medications..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="space-y-4">
                {filteredMedications.map((medication) => (
                  <Card 
                    key={medication.id} 
                    className={`border cursor-pointer hover:border-healthcare-primary transition-colors ${
                      verificationComplete[medication.id] ? 'bg-green-50 border-green-200' : ''
                    }`}
                    onClick={() => handleSelectMedication(medication)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium flex items-center">
                            <Pill className="h-4 w-4 mr-2 text-healthcare-primary" />
                            {medication.name} {medication.dosage}
                          </div>
                          <div className="mt-1 text-sm">
                            <span className="text-healthcare-gray">Qty: {medication.quantity} | </span>
                            <span className="text-healthcare-gray">Frequency: {medication.frequency} | </span>
                            <span className="text-healthcare-gray">Refills: {medication.refills}</span>
                          </div>
                          <div className="mt-1 text-sm text-healthcare-gray">
                            Prescribed by {medication.prescriber} on {medication.prescribedDate}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {verificationComplete[medication.id] ? (
                            <Badge className="bg-green-500">Verified</Badge>
                          ) : (
                            <Badge>Pending</Badge>
                          )}
                          {hasInteractions(medication) && (
                            <div className="flex items-center mt-2 text-amber-600 text-sm">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Interactions
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && selectedMedication && (
            <div className="animate-fade-in">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-medium">Verify Medication</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3 flex items-center">
                      <Pill className="h-4 w-4 mr-2 text-healthcare-primary" />
                      Medication Details
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-healthcare-gray">Name & Dosage</p>
                        <p className="font-medium">{selectedMedication.name} {selectedMedication.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm text-healthcare-gray">Frequency</p>
                        <p className="font-medium">{selectedMedication.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-healthcare-gray">Quantity</p>
                        <p className="font-medium">{selectedMedication.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-healthcare-gray">Refills</p>
                        <p className="font-medium">{selectedMedication.refills}</p>
                      </div>
                      <div>
                        <p className="text-sm text-healthcare-gray">Prescriber</p>
                        <p className="font-medium">{selectedMedication.prescriber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-healthcare-gray">Prescribed Date</p>
                        <p className="font-medium">{selectedMedication.prescribedDate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3 flex items-center">
                      <ShieldAlert className="h-4 w-4 mr-2 text-healthcare-primary" />
                      Safety Verification
                    </h3>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Drug Interactions:</h4>
                      {hasInteractions(selectedMedication) ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                          {selectedMedication.interactions.map((interaction, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              <div className="flex items-start">
                                <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Interacts with {interaction.medication}
                                  </p>
                                  <p className="text-sm">
                                    {interaction.description}
                                  </p>
                                  <p className="text-xs text-amber-700">
                                    Severity: {interaction.severity}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">No known interactions</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Warnings & Instructions:</h4>
                      {hasWarnings(selectedMedication) ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          {selectedMedication.warnings.map((warning, index) => (
                            <div key={index} className="flex items-start mb-2 last:mb-0">
                              <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                              <p className="text-sm">{warning}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">No special instructions</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 flex items-center space-x-4">
                <Button variant="outline" onClick={handleBackToList}>Back to List</Button>
                <Button onClick={handleVerifyMedication} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify and Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && selectedMedication && (
            <div className="animate-fade-in">
              <div className="flex items-center mb-4">
                <h2 className="text-lg font-medium">Prepare Medication</h2>
              </div>
              
              <Card className="border mb-6">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Preparation Checklist</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="correct-med" 
                        className="h-4 w-4 rounded border-gray-300 text-healthcare-primary focus:ring-healthcare-primary"
                      />
                      <Label htmlFor="correct-med" className="ml-2">
                        Confirmed correct medication: {selectedMedication.name}
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="correct-dose" 
                        className="h-4 w-4 rounded border-gray-300 text-healthcare-primary focus:ring-healthcare-primary"
                      />
                      <Label htmlFor="correct-dose" className="ml-2">
                        Confirmed correct dosage: {selectedMedication.dosage}
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="correct-quantity" 
                        className="h-4 w-4 rounded border-gray-300 text-healthcare-primary focus:ring-healthcare-primary"
                      />
                      <Label htmlFor="correct-quantity" className="ml-2">
                        Confirmed correct quantity: {selectedMedication.quantity}
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="exp-date" 
                        className="h-4 w-4 rounded border-gray-300 text-healthcare-primary focus:ring-healthcare-primary"
                      />
                      <Label htmlFor="exp-date" className="ml-2">
                        Checked expiration date
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="patient-info" 
                        className="h-4 w-4 rounded border-gray-300 text-healthcare-primary focus:ring-healthcare-primary"
                      />
                      <Label htmlFor="patient-info" className="ml-2">
                        Added patient information to label
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="instructions" 
                        className="h-4 w-4 rounded border-gray-300 text-healthcare-primary focus:ring-healthcare-primary"
                      />
                      <Label htmlFor="instructions" className="ml-2">
                        Added usage instructions
                      </Label>
                    </div>
                    {hasWarnings(selectedMedication) && (
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="warnings" 
                          className="h-4 w-4 rounded border-gray-300 text-healthcare-primary focus:ring-healthcare-primary"
                        />
                        <Label htmlFor="warnings" className="ml-2">
                          Added warning labels
                        </Label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
                <Button onClick={handleCompleteDispensing} className="flex-1">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Complete Preparation
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && selectedMedication && (
            <div className="animate-fade-in">
              <div className="text-center py-8">
                <div className="mb-4 inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-xl font-medium mb-2">Dispensing Complete</h2>
                <p className="text-healthcare-gray mb-4">
                  {selectedMedication.name} has been successfully dispensed to {patientSample.name}.
                </p>
                
                <div className="max-w-md mx-auto border border-healthcare-gray-light rounded-md p-4 mb-6 text-left">
                  <h3 className="font-medium mb-2">Dispensing Summary</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-healthcare-gray">Medication:</div>
                    <div>{selectedMedication.name} {selectedMedication.dosage}</div>
                    <div className="text-healthcare-gray">Quantity:</div>
                    <div>{selectedMedication.quantity}</div>
                    <div className="text-healthcare-gray">Dispensed to:</div>
                    <div>{patientSample.name}</div>
                    <div className="text-healthcare-gray">Date:</div>
                    <div>{new Date().toLocaleDateString()}</div>
                    <div className="text-healthcare-gray">Dispensed by:</div>
                    <div>Current User</div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={handleBackToList}>
                    Dispense Another Medication
                  </Button>
                  <Button>
                    <User className="h-4 w-4 mr-2" />
                    View Patient Profile
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Dialog open={openPrescriptionDialog} onOpenChange={setOpenPrescriptionDialog}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Prescription</DialogTitle>
                <DialogDescription>
                  Enter the prescription details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="patientName" className="text-right">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={newPrescription.patientName}
                    onChange={(e) => setNewPrescription({...newPrescription, patientName: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="medicationName" className="text-right">Medication</Label>
                  <Input
                    id="medicationName"
                    value={newPrescription.medicationName}
                    onChange={(e) => setNewPrescription({...newPrescription, medicationName: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dosage" className="text-right">Dosage</Label>
                  <Input
                    id="dosage"
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                    className="col-span-3"
                    placeholder="e.g., 500mg"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="frequency" className="text-right">Frequency</Label>
                  <Select
                    value={newPrescription.frequency}
                    onValueChange={(value) => setNewPrescription({...newPrescription, frequency: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="Four times daily">Four times daily</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newPrescription.quantity}
                    onChange={(e) => setNewPrescription({...newPrescription, quantity: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="refills" className="text-right">Refills</Label>
                  <Input
                    id="refills"
                    type="number"
                    value={newPrescription.refills}
                    onChange={(e) => setNewPrescription({...newPrescription, refills: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prescriber" className="text-right">Prescriber</Label>
                  <Input
                    id="prescriber"
                    value={newPrescription.prescriber}
                    onChange={(e) => setNewPrescription({...newPrescription, prescriber: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="instructions" className="text-right">Special Instructions</Label>
                  <Input
                    id="instructions"
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                    className="col-span-3"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={handleAddPrescription}>Add Prescription</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Dispensing;
