import { Save, Lock, Key, Download, ImageIcon, Upload, Clock, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header, useDoctorSettings } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PracticeService } from "@/services/practiceService";
import { PracticeInformation, PracticeType } from "@/types/practice";
import CurrencyBadge from "@/components/settings/CurrencyBadges";

const timeZones = [
  { value: "Africa/Johannesburg", label: "South Africa (SAST)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "America/Phoenix", label: "Arizona (MST)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
];

const currencies = [
  { value: "ZAR", label: "South African Rand (R)", symbol: "R" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
  { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
  { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { value: "CHF", label: "Swiss Franc (Fr)", symbol: "Fr" },
  { value: "CNY", label: "Chinese Yuan (¥)", symbol: "¥" },
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "MXN", label: "Mexican Peso (Mex$)", symbol: "Mex$" },
  { value: "BRL", label: "Brazilian Real (R$)", symbol: "R$" },
];

const practiceTypes: { value: PracticeType; label: string }[] = [
  { value: "medical", label: "Medical Practice" },
  { value: "dental", label: "Dental Practice" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "clinic", label: "Clinic" },
  { value: "hospital", label: "Hospital" },
  { value: "other", label: "Other" },
];

const Settings = () => {
  const { doctorSettings, updateDoctorSettings } = useDoctorSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [practiceInfo, setPracticeInfo] = useState<Partial<PracticeInformation>>({
    name: "",
    practiceType: "medical",
    registrationNumber: "",
    vatNumber: "",
    email: "",
    phone: "",
    website: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "South Africa",
    currency: "ZAR",
    taxPercentage: 15,
    appointmentReminderEnabled: true,
    smsNotificationsEnabled: true,
    emailNotificationsEnabled: true,
    twoFactorAuthRequired: false,
  });
  
  const { data: practice, isLoading } = useQuery({
    queryKey: ['practiceInfo'],
    queryFn: async () => {
      try {
        const data = await PracticeService.getCurrentPractice();
        return data;
      } catch (error) {
        console.error("Error fetching practice info:", error);
        return null;
      }
    }
  });
  
  const createPracticeMutation = useMutation({
    mutationFn: (data: any) => PracticeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practiceInfo'] });
      toast({
        title: "Practice information created",
        description: "Your practice information has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating practice info:", error);
      toast({
        title: "Error creating practice information",
        description: "There was an error creating your practice information. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const updatePracticeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => PracticeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practiceInfo'] });
      toast({
        title: "Settings saved",
        description: "Your practice information has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating practice info:", error);
      toast({
        title: "Error saving settings",
        description: "There was an error updating your practice information. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  useEffect(() => {
    if (practice) {
      setPracticeInfo(practice);
    }
  }, [practice]);
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailAppointments: true,
    smsAppointments: false,
    emailPrescriptions: true,
    smsPrescriptions: false,
    emailBilling: true,
    smsBilling: false,
    marketingEmails: false,
    systemUpdates: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    requirePasswordChange: false,
    sessionTimeout: 30,
    ipRestriction: false,
    activityLogging: true,
    passwordComplexity: "medium"
  });

  const [apiKeys, setApiKeys] = useState({
    ehrApiKey: "••••••••••••••••",
    pharmacyApiKey: "••••••••••••••••",
    billingApiKey: "••••••••••••••••",
    analyticsApiKey: "••••••••••••••••"
  });

  const [integrations, setIntegrations] = useState({
    ehr: true,
    pharmacy: true,
    insurance: false,
    labSystem: false,
    telemedicine: true,
    patientPortal: true
  });

  const [timeZone, setTimeZone] = useState("Africa/Johannesburg");
  const [currency, setCurrency] = useState("USD");
  const [webhookUrl, setWebhookUrl] = useState('https://api.example.com/webhook');
  const [webhookEvents, setWebhookEvents] = useState('all');

  const [isUploading, setIsUploading] = useState(false);

  const updatePracticeField = (field: string, value: any) => {
    setPracticeInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (key: string) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key as keyof typeof notificationSettings]
    };
    
    setNotificationSettings(newSettings);
    
    if (practice?.id) {
      const practiceUpdates = {
        settings: {
          ...practice.settings,
          notificationSettings: newSettings
        }
      };
      
      updatePracticeMutation.mutate({ 
        id: practice.id, 
        data: practiceUpdates 
      });
    }
  };

  const saveNotificationSettings = () => {
    if (practice?.id) {
      const updates = {
        settings: {
          ...practice.settings,
          notificationSettings
        }
      };
      
      updatePracticeMutation.mutate({ 
        id: practice.id, 
        data: updates 
      });
    } else {
      setPracticeInfo(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          notificationSettings
        }
      }));
      
      toast({
        title: "Settings saved locally",
        description: "Your notification preferences have been updated locally. Save practice information to persist.",
      });
    }
  };

  const handleSecurityChange = (key: string, value: any) => {
    const newValue = typeof value === 'boolean' ? !securitySettings[key as keyof typeof securitySettings] : value;
    
    const newSettings = {
      ...securitySettings,
      [key]: newValue
    };
    
    setSecuritySettings(newSettings);
    
    if (practice?.id) {
      const practiceUpdates = {
        settings: {
          ...practice.settings,
          securitySettings: newSettings
        },
        twoFactorAuthRequired: key === 'twoFactorAuth' ? newValue : practiceInfo.twoFactorAuthRequired
      };
      
      updatePracticeMutation.mutate({ 
        id: practice.id, 
        data: practiceUpdates 
      });
    }
  };

  const saveSecuritySettings = () => {
    if (practice?.id) {
      const updates = {
        settings: {
          ...practice.settings,
          securitySettings
        },
        twoFactorAuthRequired: securitySettings.twoFactorAuth
      };
      
      updatePracticeMutation.mutate({ 
        id: practice.id, 
        data: updates 
      });
    } else {
      setPracticeInfo(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          securitySettings
        },
        twoFactorAuthRequired: securitySettings.twoFactorAuth
      }));
      
      toast({
        title: "Settings saved locally",
        description: "Your security preferences have been updated locally. Save practice information to persist.",
      });
    }
  };

  const handleIntegrationChange = (key: string) => {
    const newSettings = {
      ...integrations,
      [key]: !integrations[key as keyof typeof integrations]
    };
    
    setIntegrations(newSettings);
    
    if (practice?.id) {
      const practiceUpdates = {
        settings: {
          ...practice.settings,
          integrations: newSettings
        }
      };
      
      updatePracticeMutation.mutate({ 
        id: practice.id, 
        data: practiceUpdates 
      });
    }
  };

  const saveApiSettings = () => {
    if (practice?.id) {
      const updates = {
        settings: {
          ...practice.settings,
          apiKeys,
          integrations,
          webhookUrl,
          webhookEvents
        }
      };
      
      updatePracticeMutation.mutate({ 
        id: practice.id, 
        data: updates 
      });
    } else {
      setPracticeInfo(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          apiKeys,
          integrations,
          webhookUrl,
          webhookEvents
        }
      }));
      
      toast({
        title: "Settings saved locally",
        description: "Your API and integration preferences have been updated locally. Save practice information to persist.",
      });
    }
  };

  const saveGeneralSettings = () => {
    if (practice?.id) {
      updatePracticeMutation.mutate({ 
        id: practice.id, 
        data: practiceInfo 
      });
    } else {
      createPracticeMutation.mutate(practiceInfo);
    }
    
    updateDoctorSettings({
      name: practiceInfo.name || "Doctor",
      practiceName: practiceInfo.name || "Practice",
      email: practiceInfo.email || "",
      practiceImage: practiceInfo.practiceImageUrl || doctorSettings.practiceImage,
    });
  };

  const regenerateApiKey = (keyType: string) => {
    const newKey = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    
    const newApiKeys = {
      ...apiKeys,
      [keyType]: newKey
    };
    
    setApiKeys(newApiKeys);
    
    if (practice?.id) {
      const updates = {
        settings: {
          ...practice.settings,
          apiKeys: newApiKeys
        }
      };
      
      updatePracticeMutation.mutate({ 
        id: practice.id, 
        data: updates 
      });
    }

    toast({
      title: "API key regenerated",
      description: `Your ${keyType.replace('ApiKey', '')} API key has been successfully regenerated.`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'image') => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      const checkImageDimensions = new Promise<boolean>((resolve) => {
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          URL.revokeObjectURL(objectUrl);
          
          if (width > 250 || height > 250) {
            toast({
              title: "Image too large",
              description: "Please upload an image that is 250x250 pixels or smaller.",
              variant: "destructive"
            });
            resolve(false);
          } else {
            resolve(true);
          }
        };
        
        img.src = objectUrl;
      });
      
      const validSize = await checkImageDimensions;
      if (!validSize) {
        setIsUploading(false);
        return;
      }

      if (!practice?.id) {
        toast({
          title: "Please save practice information first",
          description: "You need to save your practice information before uploading images.",
          variant: "destructive"
        });
        setIsUploading(false);
        return;
      }

      if (type === 'logo') {
        const logoUrl = await PracticeService.updateLogo(practice.id, file);
        updatePracticeField('logoUrl', logoUrl);
      } else {
        const imageUrl = await PracticeService.updatePracticeImage(practice.id, file);
        updatePracticeField('practiceImageUrl', imageUrl);
        updateDoctorSettings({
          ...doctorSettings,
          practiceImage: imageUrl
        });
      }

      toast({
        title: "Upload successful",
        description: `Practice ${type} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (practice?.settings) {
      if (practice.settings.notificationSettings) {
        setNotificationSettings(practice.settings.notificationSettings);
      }
      
      if (practice.settings.securitySettings) {
        setSecuritySettings(practice.settings.securitySettings);
      } else {
        setSecuritySettings(prev => ({
          ...prev,
          twoFactorAuth: practice.twoFactorAuthRequired
        }));
      }
      
      if (practice.settings.apiKeys) {
        setApiKeys(practice.settings.apiKeys);
      }
      
      if (practice.settings.integrations) {
        setIntegrations(practice.settings.integrations);
      }
      
      if (practice.settings.webhookUrl) {
        setWebhookUrl(practice.settings.webhookUrl);
      }
      
      if (practice.settings.webhookEvents) {
        setWebhookEvents(practice.settings.webhookEvents);
      }
    }
  }, [practice]);

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-semibold text-2xl">Settings</h1>
          </div>
          
          <Tabs defaultValue="general" className="animate-slide-up">
            <TabsList className="mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="api">API & Integrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card className="border border-healthcare-gray-light">
                <CardHeader>
                  <CardTitle>Practice Information</CardTitle>
                  <CardDescription>
                    Update your practice details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Practice Logo</Label>
                        {practiceInfo.logoUrl ? (
                          <div className="relative w-48 h-24">
                            <img
                              src={practiceInfo.logoUrl}
                              alt="Practice Logo"
                              className="w-full h-full object-contain rounded-md"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => updatePracticeField('logoUrl', '')}
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <label className="cursor-pointer">
                              <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-slate-50">
                                <Upload className="h-4 w-4" />
                                <span>Upload Logo</span>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'logo')}
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Practice Image (Doctor Profile)</Label>
                        {practiceInfo.practiceImageUrl ? (
                          <div className="relative w-full h-48">
                            <img
                              src={practiceInfo.practiceImageUrl}
                              alt="Practice Image"
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => updatePracticeField('practiceImageUrl', '')}
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <label className="cursor-pointer">
                              <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-slate-50">
                                <ImageIcon className="h-4 w-4" />
                                <span>Upload Image</span>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'image')}
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="practiceType">Practice Type</Label>
                        <Select 
                          value={practiceInfo.practiceType} 
                          onValueChange={(value) => updatePracticeField('practiceType', value)}
                        >
                          <SelectTrigger id="practiceType">
                            <SelectValue placeholder="Select practice type" />
                          </SelectTrigger>
                          <SelectContent>
                            {practiceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="practiceName">Practice Name</Label>
                        <Input 
                          id="practiceName" 
                          value={practiceInfo.name || ''} 
                          onChange={(e) => updatePracticeField('name', e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">Registration Number</Label>
                        <Input 
                          id="registrationNumber" 
                          value={practiceInfo.registrationNumber || ''} 
                          onChange={(e) => updatePracticeField('registrationNumber', e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vatNumber">VAT Number</Label>
                        <Input 
                          id="vatNumber" 
                          value={practiceInfo.vatNumber || ''} 
                          onChange={(e) => updatePracticeField('vatNumber', e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={practiceInfo.email || ''} 
                        onChange={(e) => updatePracticeField('email', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={practiceInfo.phone || ''} 
                        onChange={(e) => updatePracticeField('phone', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        value={practiceInfo.website || ''} 
                        onChange={(e) => updatePracticeField('website', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address Line 1</Label>
                      <Input 
                        id="address" 
                        value={practiceInfo.addressLine1 || ''} 
                        onChange={(e) => updatePracticeField('addressLine1', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Input 
                        id="addressLine2" 
                        value={practiceInfo.addressLine2 || ''} 
                        onChange={(e) => updatePracticeField('addressLine2', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        value={practiceInfo.city || ''} 
                        onChange={(e) => updatePracticeField('city', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input 
                        id="state" 
                        value={practiceInfo.stateProvince || ''} 
                        onChange={(e) => updatePracticeField('stateProvince', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zip">Postal Code</Label>
                      <Input 
                        id="zip" 
                        value={practiceInfo.postalCode || ''} 
                        onChange={(e) => updatePracticeField('postalCode', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        value={practiceInfo.country || 'South Africa'} 
                        onChange={(e) => updatePracticeField('country', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <Label htmlFor="timezone">Time Zone</Label>
                      </div>
                      <Select value={timeZone} onValueChange={setTimeZone}>
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Select time zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeZones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        <Label>Currency</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {currencies.slice(0, 6).map((curr) => (
                          <CurrencyBadge
                            key={curr.value}
                            value={curr.value}
                            label={curr.label}
                            isSelected={practiceInfo.currency === curr.value}
                            onClick={() => updatePracticeField('currency', curr.value)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="appointmentReminders" className="font-medium">Enable Appointment Reminders</Label>
                          <p className="text-sm text-healthcare-gray">
                            Send automated reminders to patients before appointments
                          </p>
                        </div>
                        <Switch 
                          id="appointmentReminders" 
                          checked={practiceInfo.appointmentReminderEnabled} 
                          onCheckedChange={(checked) => updatePracticeField('appointmentReminderEnabled', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="twoFactorAuth" className="font-medium">Two-Factor Authentication</Label>
                          <p className="text-sm text-healthcare-gray">
                            Require additional verification for all staff logins
                          </p>
                        </div>
                        <Switch 
                          id="twoFactorAuth" 
                          checked={practiceInfo.twoFactorAuthRequired} 
                          onCheckedChange={(checked) => updatePracticeField('twoFactorAuthRequired', checked)} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="taxPercentage" className="font-medium">Tax Percentage</Label>
                          <p className="text-sm text-healthcare-gray">
                            Default tax percentage for invoices
                          </p>
                        </div>
                        <Input 
                          id="taxPercentage" 
                          type="number" 
                          className="w-24 text-right" 
                          value={practiceInfo.taxPercentage || 15} 
                          onChange={(e) => updatePracticeField('taxPercentage', parseFloat(e.target.value))} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      className="btn-hover" 
                      onClick={saveGeneralSettings}
                      disabled={isLoading || createPracticeMutation.isPending || updatePracticeMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notifications">
              <Card className="border border-healthcare-gray-light">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-2">Appointment Notifications</h3>
                    <div className="space-y-4 pl-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-appointments" className="font-medium">Email Notifications</Label>
                          <p className="text-sm text-healthcare-gray">
                            Receive email notifications for appointment bookings, cancellations, and reminders
                          </p>
                        </div>
                        <Switch 
                          id="email-appointments" 
                          checked={notificationSettings.emailAppointments} 
                          onCheckedChange={() => handleNotificationChange('emailAppointments')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-appointments" className="font-medium">SMS Notifications</Label>
                          <p className="text-sm text-healthcare-gray">
                            Receive SMS notifications for appointment bookings, cancellations, and reminders
                          </p>
                        </div>
                        <Switch 
                          id="sms-appointments" 
                          checked={notificationSettings.smsAppointments} 
                          onCheckedChange={() => handleNotificationChange('smsAppointments')}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2 mt-6">Prescription Notifications</h3>
                    <div className="space-y-4 pl-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-prescriptions" className="font-medium">Email Notifications</Label>
                          <p className="text-sm text-healthcare-gray">
                            Receive email notifications for new prescriptions and refill reminders
                          </p>
                        </div>
                        <Switch 
                          id="email-prescriptions" 
                          checked={notificationSettings.emailPrescriptions} 
                          onCheckedChange={() => handleNotificationChange('emailPrescriptions')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-prescriptions" className="font-medium">SMS Notifications</Label>
                          <p className="text-sm text-healthcare-gray">
                            Receive SMS notifications for new prescriptions and refill reminders
                          </p>
                        </div>
                        <Switch 
                          id="sms-prescriptions" 
                          checked={notificationSettings.smsPrescriptions} 
                          onCheckedChange={() => handleNotificationChange('smsPrescriptions')}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2 mt-6">Billing Notifications</h3>
                    <div className="space-y-4 pl-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-billing" className="font-medium">Email Notifications</Label>
                          <p className="text-sm text-healthcare-gray">
                            Receive email notifications for invoices, payments, and billing inquiries
                          </p>
                        </div>
                        <Switch 
                          id="email-billing" 
                          checked={notificationSettings.emailBilling} 
                          onCheckedChange={() => handleNotificationChange('emailBilling')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-billing" className="font-medium">SMS Notifications</Label>
                          <p className="text-sm text-healthcare-gray">
                            Receive SMS notifications for invoices, payments, and billing inquiries
                          </p>
                        </div>
                        <Switch 
                          id="sms-billing" 
                          checked={notificationSettings.smsBilling} 
                          onCheckedChange={() => handleNotificationChange('smsBilling')}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2 mt-6">Other Notifications</h3>
                    <div className="space-y-4 pl-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketing-emails" className="font-medium">Marketing Emails</Label>
                          <p className="text-sm text-healthcare-gray">
                            Receive occasional emails about new features and special offers
                          </p>
                        </div>
                        <Switch 
                          id="marketing-emails" 
                          checked={notificationSettings.marketingEmails} 
                          onCheckedChange={() => handleNotificationChange('marketingEmails')}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="system-updates" className="font-medium">System Updates</Label>
                          <p className="text-sm text-healthcare-gray">
                            Receive notifications about system updates and maintenance
                          </p>
                        </div>
                        <Switch 
                          id="system-updates" 
                          checked={notificationSettings.systemUpdates} 
                          onCheckedChange={() => handleNotificationChange('systemUpdates')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={saveNotificationSettings}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="security">
              <Card className="border border-healthcare-gray-light">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure your security preferences and login requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="two-factor-auth" className="font-medium">Two-Factor Authentication</Label>
                        <p className="text-sm text-healthcare-gray">
                          Require additional verification when logging in
                        </p>
                      </div>
                      <Switch 
                        id="two-factor-auth" 
                        checked={securitySettings.twoFactorAuth} 
                        onCheckedChange={() => handleSecurityChange('twoFactorAuth')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="password-change" className="font-medium">Require Password Change</Label>
                        <p className="text-sm text-healthcare-gray">
                          Require all users to change passwords every 90 days
                        </p>
                      </div>
                      <Switch 
                        id="password-change" 
                        checked={securitySettings.requirePasswordChange} 
                        onCheckedChange={() => handleSecurityChange('requirePasswordChange')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="ip-restriction" className="font-medium">IP Restriction</Label>
                        <p className="text-sm text-healthcare-gray">
                          Limit access to specific IP addresses
                        </p>
                      </div>
                      <Switch 
                        id="ip-restriction" 
                        checked={securitySettings.ipRestriction} 
                        onCheckedChange={() => handleSecurityChange('ipRestriction')}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="activity-logging" className="font-medium">Activity Logging</Label>
                        <p className="text-sm text-healthcare-gray">
                          Keep detailed logs of all user activities
                        </p>
                      </div>
                      <Switch 
                        id="activity-logging" 
                        checked={securitySettings.activityLogging} 
                        onCheckedChange={() => handleSecurityChange('activityLogging')}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Label htmlFor="session-timeout" className="font-medium">Session Timeout (minutes)</Label>
                      <p className="text-sm text-healthcare-gray mb-2">
                        Automatically log out users after period of inactivity
                      </p>
                      <Input 
                        id="session-timeout" 
                        type="number" 
                        className="w-24" 
                        value={securitySettings.sessionTimeout} 
                        onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                        min={5}
                        max={120}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Label htmlFor="password-complexity" className="font-medium">Password Complexity</Label>
                      <p className="text-sm text-healthcare-gray mb-2">
                        Set minimum password requirements
                      </p>
                      <Select 
                        value={securitySettings.passwordComplexity} 
                        onValueChange={(value) => handleSecurityChange('passwordComplexity', value)}
                      >
                        <SelectTrigger id="password-complexity">
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (minimum 6 characters)</SelectItem>
                          <SelectItem value="medium">Medium (8+ chars, letters & numbers)</SelectItem>
                          <SelectItem value="high">High (10+ chars, letters, numbers, symbols)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={saveSecuritySettings}>
                      <Lock className="h-4 w-4 mr-2" />
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="api">
              <Card className="border border-healthcare-gray-light">
                <CardHeader>
                  <CardTitle>API Keys & Integrations</CardTitle>
                  <CardDescription>
                    Manage your API keys and third-party integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-2">API Keys</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">EHR API Key</Label>
                          <p className="text-sm text-healthcare-gray">
                            Used for Electronic Health Record integration
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={apiKeys.ehrApiKey} 
                            className="w-64 text-sm font-mono bg-gray-50" 
                            readOnly 
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => regenerateApiKey('ehrApiKey')}
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Pharmacy API Key</Label>
                          <p className="text-sm text-healthcare-gray">
                            Used for pharmacy system integration
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={apiKeys.pharmacyApiKey} 
                            className="w-64 text-sm font-mono bg-gray-50" 
                            readOnly 
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => regenerateApiKey('pharmacyApiKey')}
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Billing API Key</Label>
                          <p className="text-sm text-healthcare-gray">
                            Used for billing system integration
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={apiKeys.billingApiKey} 
                            className="w-64 text-sm font-mono bg-gray-50" 
                            readOnly 
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => regenerateApiKey('billingApiKey')}
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Analytics API Key</Label>
                          <p className="text-sm text-healthcare-gray">
                            Used for analytics and reporting
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={apiKeys.analyticsApiKey} 
                            className="w-64 text-sm font-mono bg-gray-50" 
                            readOnly 
                          />
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => regenerateApiKey('analyticsApiKey')}
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2 mt-6">Integrations</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">EHR System</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect to Electronic Health Record system
                          </p>
                        </div>
                        <Switch 
                          checked={integrations.ehr} 
                          onCheckedChange={() => handleIntegrationChange('ehr')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Pharmacy System</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect to pharmacy management system
                          </p>
                        </div>
                        <Switch 
                          checked={integrations.pharmacy} 
                          onCheckedChange={() => handleIntegrationChange('pharmacy')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Insurance Verification</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect to insurance verification service
                          </p>
                        </div>
                        <Switch 
                          checked={integrations.insurance} 
                          onCheckedChange={() => handleIntegrationChange('insurance')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Lab System</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect to laboratory information system
                          </p>
                        </div>
                        <Switch 
                          checked={integrations.labSystem} 
                          onCheckedChange={() => handleIntegrationChange('labSystem')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Telemedicine</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect to telemedicine platform
                          </p>
                        </div>
                        <Switch 
                          checked={integrations.telemedicine} 
                          onCheckedChange={() => handleIntegrationChange('telemedicine')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Patient Portal</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect to patient portal
                          </p>
                        </div>
                        <Switch 
                          checked={integrations.patientPortal} 
                          onCheckedChange={() => handleIntegrationChange('patientPortal')}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2 mt-6">Webhook Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="webhook-url" className="font-medium">Webhook URL</Label>
                        <p className="text-sm text-healthcare-gray mb-2">
                          URL to receive webhook notifications
                        </p>
                        <Input 
                          id="webhook-url"
                          value={webhookUrl} 
                          onChange={(e) => setWebhookUrl(e.target.value)} 
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="webhook-events" className="font-medium">Webhook Events</Label>
                        <p className="text-sm text-healthcare-gray mb-2">
                          Select which events trigger webhooks
                        </p>
                        <Select value={webhookEvents} onValueChange={setWebhookEvents}>
                          <SelectTrigger id="webhook-events">
                            <SelectValue placeholder="Select events" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="appointments">Appointments Only</SelectItem>
                            <SelectItem value="patients">Patient Updates Only</SelectItem>
                            <SelectItem value="billing">Billing Events Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={saveApiSettings}>
                      <Key className="h-4 w-4 mr-2" />
                      Save API Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Settings;

