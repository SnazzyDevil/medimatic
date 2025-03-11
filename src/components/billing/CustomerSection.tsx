
import { useState, useEffect } from "react";
import { User, X, ChevronsUpDown, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  practiceInfo = {
    name: "PharmaCare Clinic",
    address: "123 Healthcare Avenue, Medical District, 12345",
    phone: "+27 12 345 6789",
    email: "info@pharmacare.co.za",
    website: "www.pharmacare.co.za",
    regNumber: "REG-12345-ZA",
    vatNumber: "VAT4567890123"
  }
}: CustomerSectionProps) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPatients();
    }
  }, [open]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, contact_number, address, medical_aid_number, email, allergies, alternate_contact');
      
      if (error) throw error;
      
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
    onPatientSelect(patient);
    setOpen(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold mb-2">Bill from</h3>
          <div className="space-y-1 bg-slate-50 p-3 rounded-md border">
            <div className="font-medium text-lg">{practiceInfo.name}</div>
            <div className="text-sm">{practiceInfo.address}</div>
            <div className="text-sm">Phone: {practiceInfo.phone}</div>
            <div className="text-sm">Email: {practiceInfo.email}</div>
            {practiceInfo.website && (
              <div className="text-sm">Website: {practiceInfo.website}</div>
            )}
            <div className="text-sm">Reg #: {practiceInfo.regNumber}</div>
            <div className="text-sm">VAT #: {practiceInfo.vatNumber}</div>
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
                  onClick={() => setOpen(true)}
                >
                  Change patient
                </Button>
              </div>
            </div>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span>Add Patient</span>
                  <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]" align="start" side="bottom">
                <Command>
                  <CommandInput placeholder="Search patients..." />
                  <CommandList>
                    <CommandEmpty>
                      {isLoading ? "Loading..." : "No patients found."}
                    </CommandEmpty>
                    <CommandGroup>
                      {patients.map((patient) => (
                        <CommandItem
                          key={patient.id}
                          onSelect={() => handlePatientSelect(patient)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>{patient.first_name} {patient.last_name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};
