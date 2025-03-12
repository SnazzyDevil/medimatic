
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
}

export function AddMedicationDialog({
  isOpen,
  onClose,
  onAddMedication,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMedicationData((prev) => ({ ...prev, [name]: value }));
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
              <Input
                id="name"
                name="name"
                value={medicationData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
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
