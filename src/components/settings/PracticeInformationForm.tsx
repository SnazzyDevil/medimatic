import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/settings/CurrencySelect";
import { PracticeInformation } from "@/types/practice";
import { cn } from "@/lib/utils";

interface PracticeInformationFormProps {
  practiceInfo: PracticeInformation | null;
  loading: boolean;
  onSave: (data: Partial<PracticeInformation>) => void | Promise<void>;
  hideButton?: boolean;
}

export function PracticeInformationForm({
  practiceInfo,
  loading,
  onSave,
  hideButton = false,
}: PracticeInformationFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState<string>("ZAR");
  const [doctorName, setDoctorName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    if (practiceInfo) {
      setName(practiceInfo.name);
      setEmail(practiceInfo.email);
      setPhone(practiceInfo.phone);
      setCurrency(practiceInfo.currency);
      setDoctorName(practiceInfo.doctorName || "");
      setAddressLine1(practiceInfo.addressLine1 || "");
      setAddressLine2(practiceInfo.addressLine2 || "");
      setCity(practiceInfo.city || "");
      setPostalCode(practiceInfo.postalCode || "");
      setStateProvince(practiceInfo.stateProvince || "");
      setRegistrationNumber(practiceInfo.registrationNumber || "");
      setVatNumber(practiceInfo.vatNumber || "");
    }
  }, [practiceInfo]);

  useEffect(() => {
    if (practiceInfo) {
      const isDirty = 
        name !== practiceInfo.name ||
        email !== practiceInfo.email ||
        phone !== practiceInfo.phone ||
        currency !== practiceInfo.currency ||
        doctorName !== (practiceInfo.doctorName || "") ||
        addressLine1 !== practiceInfo.addressLine1 ||
        addressLine2 !== (practiceInfo.addressLine2 || "") ||
        city !== practiceInfo.city ||
        postalCode !== practiceInfo.postalCode ||
        stateProvince !== (practiceInfo.stateProvince || "") ||
        registrationNumber !== practiceInfo.registrationNumber ||
        vatNumber !== (practiceInfo.vatNumber || "");
        
      setIsFormDirty(isDirty);
    }
  }, [name, email, phone, currency, doctorName, addressLine1, addressLine2, city, postalCode, stateProvince, registrationNumber, vatNumber, practiceInfo]);

  const handleSavePracticeInfo = async () => {
    try {
      setSaving(true);
      
      const updatedData = {
        name,
        email,
        phone,
        currency,
        doctorName,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        stateProvince,
        registrationNumber,
        vatNumber
      };
      
      await onSave(updatedData);
      setIsFormDirty(false);
      
      if (!hideButton) {
        toast({
          title: "Success",
          description: "Practice information updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating practice information:", error);
      toast({
        title: "Error",
        description: "Failed to update practice information. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (hideButton && isFormDirty) {
      onSave({
        name,
        email,
        phone,
        currency,
        doctorName,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        stateProvince,
        registrationNumber,
        vatNumber
      });
    }
  }, [hideButton, isFormDirty, name, email, phone, currency, doctorName, addressLine1, addressLine2, city, postalCode, stateProvince, registrationNumber, vatNumber, onSave]);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Practice Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="doctorName">Doctor's Name</Label>
          <Input 
            id="doctorName" 
            value={doctorName} 
            onChange={(e) => setDoctorName(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <h4 className="text-md font-medium mb-2">Practice Address</h4>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input 
              id="addressLine1" 
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input 
              id="addressLine2" 
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateProvince">Province/State</Label>
              <Input 
                id="stateProvince" 
                value={stateProvince}
                onChange={(e) => setStateProvince(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input 
                id="postalCode" 
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Practice Registration Number</Label>
          <Input 
            id="registrationNumber" 
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vatNumber">VAT Registration Number</Label>
          <Input 
            id="vatNumber" 
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <CurrencySelect 
            value={currency} 
            onValueChange={(value) => setCurrency(value)} 
          />
        </div>
      </div>
      
      {!hideButton && (
        <div>
          <Button 
            onClick={handleSavePracticeInfo} 
            disabled={saving || !isFormDirty}
            className={cn(
              "bg-blue-500 hover:bg-blue-600",
              !isFormDirty && "opacity-50 cursor-not-allowed"
            )}
          >
            {saving ? "Saving..." : "Save Practice Information"}
          </Button>
        </div>
      )}
    </div>
  );
}
