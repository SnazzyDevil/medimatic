
import { useState, useEffect } from "react";
import { User, X, Edit, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { PracticeService } from "@/services/practiceService";

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  address: string | null;
  medical_aid_number: string | null;
  email: string | null;
  allergies: string | null;
  alternate_contact: string | null;
}

export interface PracticeInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  regNumber: string;
  vatNumber: string;
}

interface CustomerSectionProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
  practiceInfo?: PracticeInfo;
}

export const CustomerSection = ({ 
  selectedPatient, 
  onPatientSelect,
  practiceInfo
}: CustomerSectionProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Fetch practice information
  const { data: practice, isLoading: isPracticeLoading, error: practiceError } = useQuery({
    queryKey: ['practiceInfo'],
    queryFn: () => PracticeService.getCurrentPractice(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Show error toast if practice info fetch fails
  useEffect(() => {
    if (practiceError) {
      toast({
        title: "Error fetching practice information",
        description: "Could not load practice details. Please try again.",
        variant: "destructive"
      });
    }
  }, [practiceError, toast]);

  // Derived practice info - use fetched data or fallback
  const formattedPracticeInfo: PracticeInfo = practice ? {
    name: practice.name,
    address: `${practice.addressLine1}${practice.addressLine2 ? `, ${practice.addressLine2}` : ''}, ${practice.city}, ${practice.postalCode}`,
    phone: practice.phone,
    email: practice.email,
    website: practice.website,
    regNumber: practice.registrationNumber,
    vatNumber: practice.vatNumber || '',
  } : practiceInfo || {
    name: "Loading...",
    address: "",
    phone: "",
    email: "",
    regNumber: "",
    vatNumber: ""
  };

  useEffect(() => {
    if (dialogOpen) {
      fetchPatients();
    }
  }, [dialogOpen]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, contact_number, address, medical_aid_number, email, allergies, alternate_contact');
      
      if (error) throw error;
      
      console.log("Fetched patients:", data);
      setPatients(data || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error fetching patients",
        description: "Could not load patient data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPatient = () => {
    onPatientSelect(null);
  };

  const handlePatientSelect = (patient: Patient) => {
    console.log("Selected patient in CustomerSection:", patient);
    onPatientSelect(patient);
    setDialogOpen(false);
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           (patient.contact_number && patient.contact_number.includes(searchTerm)) ||
           (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold mb-2">Bill from</h3>
          <div className="space-y-1 bg-slate-50 p-3 rounded-md border">
            {isPracticeLoading ? (
              <div className="text-sm text-gray-500">Loading practice information...</div>
            ) : practiceError ? (
              <div className="text-sm text-red-500">Could not load practice information</div>
            ) : (
              <>
                <div className="font-medium text-lg">{formattedPracticeInfo.name}</div>
                <div className="text-sm">{formattedPracticeInfo.address}</div>
                <div className="text-sm">Phone: {formattedPracticeInfo.phone}</div>
                <div className="text-sm">Email: {formattedPracticeInfo.email}</div>
                {formattedPracticeInfo.website && (
                  <div className="text-sm">Website: {formattedPracticeInfo.website}</div>
                )}
                <div className="text-sm">Reg #: {formattedPracticeInfo.regNumber}</div>
                <div className="text-sm">VAT #: {formattedPracticeInfo.vatNumber}</div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold mb-2">Bill to</h3>
          
          {selectedPatient ? (
            <div className="space-y-1 bg-slate-50 p-3 rounded-md border">
              <div className="font-medium text-lg">{selectedPatient.first_name} {selectedPatient.last_name}</div>
              {selectedPatient.address && <div className="text-sm">{selectedPatient.address}</div>}
              {selectedPatient.contact_number && <div className="text-sm">Phone: {selectedPatient.contact_number}</div>}
              {selectedPatient.email && <div className="text-sm">Email: {selectedPatient.email}</div>}
              {selectedPatient.medical_aid_number && <div className="text-sm">Medical Aid #: {selectedPatient.medical_aid_number}</div>}
              {selectedPatient.allergies && <div className="text-sm">Allergies: {selectedPatient.allergies}</div>}
              {selectedPatient.alternate_contact && <div className="text-sm">Alt. Contact: {selectedPatient.alternate_contact}</div>}
              <div className="flex items-center space-x-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                  onClick={handleClearPatient}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Clear patient
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8"
                  onClick={() => setDialogOpen(true)}
                >
                  Change patient
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-dashed rounded-md flex flex-col items-center justify-center">
              <p className="text-muted-foreground mb-3">No patient selected</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDialogOpen(true)}
                className="flex items-center"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Patient Details
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Patient</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input 
              placeholder="Search patients by name, phone, or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            
            <div className="max-h-[400px] overflow-y-auto border rounded-md">
              {isLoading ? (
                <div className="p-4 text-center">Loading patients...</div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-4 text-center">
                  {searchTerm ? "No patients match your search" : "No patients found"}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredPatients.map((patient) => (
                    <div 
                      key={patient.id} 
                      className="p-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <User className="h-5 w-5 text-slate-400" />
                      <div>
                        <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                        <div className="text-sm text-slate-500">
                          {patient.contact_number}
                          {patient.email && ` • ${patient.email}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
