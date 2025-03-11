
import { useState, useEffect } from "react";
import { User, X, ChevronsUpDown } from "lucide-react";
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
    <div className="border rounded-md p-4 mb-4 space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Patient Information</h3>
      
      {selectedPatient ? (
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <User className="h-12 w-12 text-muted-foreground p-2 border rounded-full" />
              <div>
                <h3 className="font-medium">{selectedPatient.first_name} {selectedPatient.last_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedPatient.contact_number}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearPatient}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <p>{selectedPatient.address || "Not provided"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Medical Aid Number</Label>
              <p>{selectedPatient.medical_aid_number || "Not provided"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p>{selectedPatient.email || "Not provided"}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <User className="h-12 w-12 text-muted-foreground p-2 border rounded-full" />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary">
                Add Patient
                <ChevronsUpDown className="ml-1 h-4 w-4" />
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
                        <span>{patient.first_name} {patient.last_name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
};
