
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
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const { toast } = useToast();
  const [practiceInfo, setPracticeInfo] = useState<PracticeInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedPracticeInfo, setUpdatedPracticeInfo] = useState<Partial<PracticeInformation>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [creatingDefault, setCreatingDefault] = useState(false);

  // Get current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    
    fetchUser();
  }, []);

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

    // Only fetch if we have a user ID
    if (userId) {
      fetchPracticeInfo();
    }
  }, [toast, userId]);
  
  const createDefaultPractice = async () => {
    try {
      setCreatingDefault(true);
      const defaultPractice = {
        name: "New Practice",
        practiceType: "medical" as const,
        registrationNumber: "REG-" + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
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
      
      console.log("Creating default practice with data:", defaultPractice);
      const createdPractice = await PracticeService.create(defaultPractice);
      console.log("Created default practice:", createdPractice);
      setPracticeInfo(createdPractice);
      
      toast({
        title: "New Practice Created",
        description: "A default practice has been created for you to customize.",
      });
    } catch (error: any) {
      console.error("Error creating default practice:", error);
      toast({
        title: "Error",
        description: `Failed to create default practice: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setCreatingDefault(false);
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
      
      // Refresh the practice information after update
      const updatedInfo = await PracticeService.getCurrentPractice();
      setPracticeInfo(updatedInfo);
      setUpdatedPracticeInfo({});
      
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message || 'Please make sure you\'re logged in.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Don't render until we have user ID
  if (!userId && !loading) {
    return (
      <SettingsLayout 
        title="Settings" 
        description="Manage your account settings and preferences"
      >
        <div className="text-center p-8">
          Please log in to access your settings.
        </div>
      </SettingsLayout>
    );
  }

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
        
        {creatingDefault ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="spinner mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p>Creating default practice...</p>
            </div>
          </div>
        ) : (
          <PracticeInformationForm 
            practiceInfo={practiceInfo}
            loading={loading}
            onSave={handleUpdatePracticeInfo}
            hideButton={true}
          />
        )}
        
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
            disabled={isSaving || Object.keys(updatedPracticeInfo).length === 0 || loading || creatingDefault}
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
