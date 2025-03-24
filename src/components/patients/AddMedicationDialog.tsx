
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AddMedicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMedication: (medication: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    status: "active" | "discontinued";
    prescribedBy: string;
  }) => void;
  patientId?: string; // Added patientId as an optional prop
}

export function AddMedicationDialog({
  isOpen,
  onClose,
  onAddMedication,
  patientId, // Added patientId to the component props
}: AddMedicationDialogProps) {
  const { toast } = useToast();
  const [medicationData, setMedicationData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: new Date().toISOString().split("T")[0],
    status: "active" as "active" | "discontinued",
    prescribedBy: "",
  });
  const [medications, setMedications] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      
      setMedications(data || []);
    } catch (error) {
      console.error("Error fetching medications:", error);
      toast({
        title: "Error",
        description: "Failed to load medications from inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMedicationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMedicationSelect = (value: string) => {
    setMedicationData((prev) => ({ ...prev, name: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!medicationData.name || !medicationData.dosage || !medicationData.frequency || !medicationData.prescribedBy) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    onAddMedication(medicationData);
    
    // Reset form
    setMedicationData({
      name: "",
      dosage: "",
      frequency: "",
      startDate: new Date().toISOString().split("T")[0],
      status: "active",
      prescribedBy: "",
    });
    
    onClose();
    
    toast({
      title: "Medication added",
      description: `${medicationData.name} has been added successfully`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>
              Enter the details of the medication to add to the patient's record.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Medication
              </Label>
              <div className="col-span-3">
                <Select 
                  value={medicationData.name} 
                  onValueChange={handleMedicationSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <div className="px-2 py-1 text-sm">Loading medications...</div>
                    ) : medications.length > 0 ? (
                      medications.map((med) => (
                        <SelectItem key={med.id} value={med.name}>
                          {med.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-sm">No medications found</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosage" className="text-right">
                Dosage
              </Label>
              <Input
                id="dosage"
                name="dosage"
                value={medicationData.dosage}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">
                Frequency
              </Label>
              <Input
                id="frequency"
                name="frequency"
                value={medicationData.frequency}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={medicationData.startDate}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prescribedBy" className="text-right">
                Prescribed By
              </Label>
              <Input
                id="prescribedBy"
                name="prescribedBy"
                value={medicationData.prescribedBy}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Medication</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
