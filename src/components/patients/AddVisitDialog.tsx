
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddVisitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVisit: (visit: {
    date: string;
    type: string;
    doctor: string;
    notes: string;
    vitals: {
      bp: string;
      hr: string;
      temp: string;
      weight: string;
    };
  }) => void;
  patientId?: string;
}

export function AddVisitDialog({
  isOpen,
  onClose,
  onAddVisit,
  patientId,
}: AddVisitDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitData, setVisitData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "",
    doctor: "",
    notes: "",
    vitals: {
      bp: "",
      hr: "",
      temp: "",
      weight: "",
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setVisitData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }));
    } else {
      setVisitData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!visitData.date || !visitData.type || !visitData.doctor) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!patientId) {
      toast({
        title: "Error",
        description: "Patient ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save visit to Supabase
      const { data: visitData_db, error: visitError } = await supabase
        .from('visits')
        .insert({
          patient_id: patientId,
          date: visitData.date,
          type: visitData.type,
          doctor: visitData.doctor,
          notes: visitData.notes || null,
        })
        .select();
      
      if (visitError) throw visitError;
      
      if (visitData_db && visitData_db.length > 0) {
        // Save vitals to Supabase
        const { error: vitalsError } = await supabase
          .from('visit_vitals')
          .insert({
            visit_id: visitData_db[0].id,
            bp: visitData.vitals.bp || null,
            hr: visitData.vitals.hr || null,
            temp: visitData.vitals.temp || null,
            weight: visitData.vitals.weight || null,
          });
        
        if (vitalsError) throw vitalsError;
      }
      
      // Call onAddVisit to update UI
      onAddVisit(visitData);
      
      // Reset form
      setVisitData({
        date: new Date().toISOString().split("T")[0],
        type: "",
        doctor: "",
        notes: "",
        vitals: {
          bp: "",
          hr: "",
          temp: "",
          weight: "",
        }
      });
      
      onClose();
      
      toast({
        title: "Visit added",
        description: `Visit on ${visitData.date} has been added successfully`,
      });
    } catch (error) {
      console.error("Error adding visit:", error);
      toast({
        title: "Error",
        description: "Failed to add visit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Visit</DialogTitle>
            <DialogDescription>
              Enter the details of the visit to add to the patient's record.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={visitData.date}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Visit Type
              </Label>
              <Input
                id="type"
                name="type"
                value={visitData.type}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Regular Check-up, Follow-up, etc."
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doctor" className="text-right">
                Doctor
              </Label>
              <Input
                id="doctor"
                name="doctor"
                value={visitData.doctor}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right col-span-4 font-semibold">
                Vitals
              </Label>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vitals.bp" className="text-right">
                Blood Pressure
              </Label>
              <Input
                id="vitals.bp"
                name="vitals.bp"
                value={visitData.vitals.bp}
                onChange={handleChange}
                className="col-span-3"
                placeholder="120/80"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vitals.hr" className="text-right">
                Heart Rate
              </Label>
              <Input
                id="vitals.hr"
                name="vitals.hr"
                value={visitData.vitals.hr}
                onChange={handleChange}
                className="col-span-3"
                placeholder="72 bpm"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vitals.temp" className="text-right">
                Temperature
              </Label>
              <Input
                id="vitals.temp"
                name="vitals.temp"
                value={visitData.vitals.temp}
                onChange={handleChange}
                className="col-span-3"
                placeholder="98.6°F"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vitals.weight" className="text-right">
                Weight
              </Label>
              <Input
                id="vitals.weight"
                name="vitals.weight"
                value={visitData.vitals.weight}
                onChange={handleChange}
                className="col-span-3"
                placeholder="165 lbs"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={visitData.notes}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Visit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
