import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { PracticeInformationForm } from "@/components/settings/PracticeInformationForm";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { TimezoneSettings } from "@/components/settings/TimezoneSettings";
import { ApiKeysManager } from "@/components/settings/ApiKeysManager";
import { WebhookSettings } from "@/components/settings/WebhookSettings";
import { PracticeService } from "@/services/practiceService";
import { PracticeInformation } from "@/types/practice";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [practiceInfo, setPracticeInfo] = useState<PracticeInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedPracticeInfo, setUpdatedPracticeInfo] = useState<Partial<PracticeInformation>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPracticeInfo = async () => {
      try {
        setLoading(true);
        const info = await PracticeService.getCurrentPractice();
        console.log("Fetched practice info:", info);
        setPracticeInfo(info);
        
        if (!info) {
          console.log("No practice info found, creating default");
          createDefaultPractice();
        }
      } catch (error) {
        console.error("Error fetching practice information:", error);
        toast({
          title: "Error",
          description: "Failed to load practice information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPracticeInfo();
  }, [toast]);
  
  const createDefaultPractice = async () => {
    try {
      const defaultPractice = {
        name: "New Practice",
        practiceType: "medical" as const,
        registrationNumber: "",
        email: "",
        phone: "",
        doctorName: "",
        addressLine1: "",
        city: "",
        postalCode: "",
        country: "South Africa",
        currency: "ZAR",
        taxPercentage: 15,
        appointmentReminderEnabled: true,
        smsNotificationsEnabled: true,
        emailNotificationsEnabled: true,
        twoFactorAuthRequired: false,
        isActive: true
      };
      
      const createdPractice = await PracticeService.create(defaultPractice);
      console.log("Created default practice:", createdPractice);
      setPracticeInfo(createdPractice);
      
      toast({
        title: "New Practice Created",
        description: "A default practice has been created for you to customize.",
      });
    } catch (error) {
      console.error("Error creating default practice:", error);
      toast({
        title: "Error",
        description: "Failed to create default practice",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePracticeInfo = (updatedData: Partial<PracticeInformation>) => {
    setUpdatedPracticeInfo((prev) => ({
      ...prev,
      ...updatedData
    }));
  };

  const handleSaveAllSettings = async () => {
    if (!practiceInfo) {
      toast({
        title: "Error",
        description: "No practice information found to update",
        variant: "destructive",
      });
      return;
    }
    
    if (Object.keys(updatedPracticeInfo).length === 0) {
      toast({
        title: "No changes",
        description: "No changes to save",
      });
      return;
    }
    
    try {
      setIsSaving(true);
      console.log("Saving all settings with data:", updatedPracticeInfo);
      
      await PracticeService.update(practiceInfo.id, updatedPracticeInfo);
      
      const updatedInfo = await PracticeService.getById(practiceInfo.id);
      setPracticeInfo(updatedInfo);
      setUpdatedPracticeInfo({});
      
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsLayout 
      title="Settings" 
      description="Manage your account settings and preferences"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Practice Information</h3>
          <p className="text-sm text-muted-foreground">
            Update your practice information
          </p>
        </div>
        
        <PracticeInformationForm 
          practiceInfo={practiceInfo}
          loading={loading}
          onSave={handleUpdatePracticeInfo}
          hideButton={true}
        />
        
        <NotificationSettings />
        
        <TimezoneSettings />
        
        <ApiKeysManager />
        
        <div>
          <h3 className="text-lg font-medium">Webhooks</h3>
          <p className="text-sm text-muted-foreground">
            Configure webhooks to listen to events on your account.
          </p>
        </div>
        
        <WebhookSettings />
        
        <div className="pt-6 border-t">
          <Button 
            onClick={handleSaveAllSettings} 
            disabled={isSaving || Object.keys(updatedPracticeInfo).length === 0}
            className="bg-blue-500 hover:bg-blue-600"
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
}
