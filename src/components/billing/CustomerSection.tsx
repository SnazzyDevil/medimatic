
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
}

interface CustomerSectionProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
}

export const CustomerSection = ({ selectedPatient, onPatientSelect }: CustomerSectionProps) => {
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
        .select('id, first_name, last_name, contact_number, address, medical_aid_number, email');
      
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

  return (
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
                        onSelect={() => {
                          onPatientSelect(patient);
                          setOpen(false);
                        }}
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
  );
};
