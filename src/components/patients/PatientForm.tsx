import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PatientFormProps {
  onSubmit?: (data: PatientFormData) => void;
  isLoading?: boolean;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  medicalAidNumber: string;
  address: string;
  email: string;
  allergies: string;
  alternateContact: string;
}

export function PatientForm({ onSubmit, isLoading = false }: PatientFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = React.useState<PatientFormData>({
    firstName: "",
    lastName: "",
    contactNumber: "",
    medicalAidNumber: "",
    address: "",
    email: "",
    allergies: "",
    alternateContact: "",
  });
  const [submitting, setSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Allow empty email
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateContactNumber = (number: string): boolean => {
    if (!number) return false; // Contact number is required
    const regex = /^[0-9+\-\s()]{7,15}$/;
    return regex.test(number);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Missing required fields",
        description: "First name and last name are required.",
        variant: "destructive",
      });
      return;
    }

    if (!validateContactNumber(formData.contactNumber)) {
      toast({
        title: "Invalid contact number",
        description: "Please enter a valid contact number.",
        variant: "destructive",
      });
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Check if the user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a patient.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      console.log("Current user ID:", user.id);
      
      // Insert data to Supabase with explicit user_id
      const { data, error } = await supabase
        .from('patients')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          contact_number: formData.contactNumber,
          medical_aid_number: formData.medicalAidNumber || null,
          address: formData.address || null,
          email: formData.email || null,
          allergies: formData.allergies || null,
          alternate_contact: formData.alternateContact || null,
          user_id: user.id // Explicitly add the user_id field
        })
        .select();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (onSubmit) {
        onSubmit(formData);
      }

      toast({
        title: "Success",
        description: "Patient added successfully.",
      });

      navigate("/patients");
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/patients");
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Patient</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName" 
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Enter last name" 
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medicalAidNumber">Medical Aid Number</Label>
              <Input
                id="medicalAidNumber"
                name="medicalAidNumber"
                placeholder="Enter medical aid number"
                value={formData.medicalAidNumber}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alternateContact">Alternate Contact</Label>
              <Input
                id="alternateContact"
                name="alternateContact"
                placeholder="Enter alternate contact"
                value={formData.alternateContact}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Home Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="Enter home address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              name="allergies"
              placeholder="Enter any allergies"
              value={formData.allergies}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || submitting}
          >
            {isLoading || submitting ? "Saving..." : "Save Patient"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
