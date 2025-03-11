import { Save, Lock, Key, Download, ImageIcon, Upload, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header, useDoctorSettings } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

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

const Settings = () => {
  const { doctorSettings, updateDoctorSettings } = useDoctorSettings();
  
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

  const [timeZone, setTimeZone] = useState("America/New_York");
  const [currency, setCurrency] = useState("USD");
  const [webhookUrl, setWebhookUrl] = useState('https://api.example.com/webhook');
  const [webhookEvents, setWebhookEvents] = useState('all');

  const [practiceImage, setPracticeImage] = useState<string | null>(null);
  const [practiceLogo, setPracticeLogo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [doctorName, setDoctorName] = useState(doctorSettings.name);
  const [practiceName, setPracticeName] = useState(doctorSettings.practiceName);
  const [email, setEmail] = useState(doctorSettings.email);

  const handleNotificationChange = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const saveNotificationSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated successfully.",
    });
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: typeof value === 'boolean' ? !prev[key as keyof typeof prev] : value
    }));
  };

  const saveSecuritySettings = () => {
    toast({
      title: "Security settings saved",
      description: "Your security preferences have been updated successfully.",
    });
  };

  const handleIntegrationChange = (key: string) => {
    setIntegrations(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const saveApiSettings = () => {
    toast({
      title: "API settings saved",
      description: "Your API and integration preferences have been updated successfully.",
    });
  };

  const saveGeneralSettings = () => {
    updateDoctorSettings({
      name: doctorName,
      practiceName: practiceName,
      email: email,
      image: practiceImage || doctorSettings.image,
    });

    toast({
      title: "Settings saved",
      description: "Your general settings have been updated successfully.",
    });
  };

  const regenerateApiKey = (keyType: string) => {
    const newKey = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    
    setApiKeys(prev => ({
      ...prev,
      [keyType]: newKey
    }));

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

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('practice-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('practice-assets')
        .getPublicUrl(filePath);

      if (type === 'logo') {
        setPracticeLogo(publicUrl);
      } else {
        setPracticeImage(publicUrl);
        updateDoctorSettings({
          image: publicUrl,
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
                        {practiceLogo ? (
                          <div className="relative w-48 h-24">
                            <img
                              src={practiceLogo}
                              alt="Practice Logo"
                              className="w-full h-full object-contain rounded-md"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setPracticeLogo(null)}
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
                        {practiceImage ? (
                          <div className="relative w-full h-48">
                            <img
                              src={practiceImage}
                              alt="Practice Image"
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => setPracticeImage(null)}
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

                    <div className="space-y-2">
                      <Label htmlFor="practiceName">Practice Name</Label>
                      <Input 
                        id="practiceName" 
                        value={practiceName} 
                        onChange={(e) => setPracticeName(e.target.value)} 
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
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue="(555) 123-4567" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" defaultValue="https://medicare-clinic.com" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" defaultValue="123 Medical Plaza, Suite 101" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="San Francisco" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" defaultValue="CA" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" defaultValue="94107" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" defaultValue="United States" />
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
                        <DollarSign className="h-4 w-4" />
                        <Label htmlFor="currency">Currency</Label>
                      </div>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((curr) => (
                            <SelectItem key={curr.value} value={curr.value}>
                              {curr.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="switch-1" className="font-medium">Enable Appointment Reminders</Label>
                          <p className="text-sm text-healthcare-gray">
                            Send automated reminders to patients before appointments
                          </p>
                        </div>
                        <Switch id="switch-1" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="switch-2" className="font-medium">Two-Factor Authentication</Label>
                          <p className="text-sm text-healthcare-gray">
                            Require additional verification for all staff logins
                          </p>
                        </div>
                        <Switch id="switch-2" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="switch-3" className="font-medium">AI Diagnostic Suggestions</Label>
                          <p className="text-sm text-healthcare-gray">
                            Enable AI to analyze patient data and suggest possible diagnoses
                          </p>
                        </div>
                        <Switch id="switch-3" defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="btn-hover" onClick={saveGeneralSettings}>
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
                            Receive promotional emails about new services and special offers
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
                            Receive notifications about system maintenance and new features
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
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={saveNotificationSettings} className="btn-hover">
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
                    Manage your security preferences and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium mb-2">Account Security</h3>
                    <div className="space-y-4 pl-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="two-factor-auth" className="font-medium">Two-Factor Authentication</Label>
                          <p className="text-sm text-healthcare-gray">
                            Add an extra layer of security to your account with two-factor authentication
                          </p>
                        </div>
                        <Switch 
                          id="two-factor-auth" 
                          checked={securitySettings.twoFactorAuth} 
                          onCheckedChange={() => handleSecurityChange('twoFactorAuth', true)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="password-change" className="font-medium">Require Password Change</Label>
                          <p className="text-sm text-healthcare-gray">
                            Require password change every 90 days for enhanced security
                          </p>
                        </div>
                        <Switch 
                          id="password-change" 
                          checked={securitySettings.requirePasswordChange} 
                          onCheckedChange={() => handleSecurityChange('requirePasswordChange', true)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="session-timeout" className="font-medium">Session Timeout (minutes)</Label>
                          <p className="text-sm text-healthcare-gray">
                            Automatically log out after period of inactivity
                          </p>
                        </div>
                        <div className="w-24">
                          <Input 
                            id="session-timeout"
                            type="number"
                            min="5"
                            max="120"
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                            className="text-right"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2 mt-6">Access Controls</h3>
                    <div className="space-y-4 pl-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="ip-restriction" className="font-medium">IP Address Restriction</Label>
                          <p className="text-sm text-healthcare-gray">
                            Limit access to specific IP addresses for increased security
                          </p>
                        </div>
                        <Switch 
                          id="ip-restriction" 
                          checked={securitySettings.ipRestriction} 
                          onCheckedChange={() => handleSecurityChange('ipRestriction', true)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="activity-logging" className="font-medium">Activity Logging</Label>
                          <p className="text-sm text-healthcare-gray">
                            Log all user activity for security monitoring
                          </p>
                        </div>
                        <Switch 
                          id="activity-logging" 
                          checked={securitySettings.activityLogging} 
                          onCheckedChange={() => handleSecurityChange('activityLogging', true)}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2 mt-6">Password Requirements</h3>
                    <div className="space-y-4 pl-2">
                      <div className="grid grid-cols-3 gap-4">
                        <Button
                          variant={securitySettings.passwordComplexity === "low" ? "default" : "outline"}
                          onClick={() => handleSecurityChange('passwordComplexity', 'low')}
                          className="w-full"
                        >
                          Basic
                        </Button>
                        <Button
                          variant={securitySettings.passwordComplexity === "medium" ? "default" : "outline"}
                          onClick={() => handleSecurityChange('passwordComplexity', 'medium')}
                          className="w-full"
                        >
                          Standard
                        </Button>
                        <Button
                          variant={securitySettings.passwordComplexity === "high" ? "default" : "outline"}
                          onClick={() => handleSecurityChange('passwordComplexity', 'high')}
                          className="w-full"
                        >
                          Strong
                        </Button>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-md text-sm">
                        {securitySettings.passwordComplexity === "low" && (
                          <p>Basic: At least 8 characters in length</p>
                        )}
                        {securitySettings.passwordComplexity === "medium" && (
                          <p>Standard: At least 10 characters, must include numbers and special characters</p>
                        )}
                        {securitySettings.passwordComplexity === "high" && (
                          <p>Strong: At least 12 characters, must include uppercase, lowercase, numbers and special characters</p>
                        )}
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="mt-4">
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Your Password</DialogTitle>
                          <DialogDescription>
                            Update your password to maintain account security.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={() => {
                            toast({
                              title: "Password changed",
                              description: "Your password has been updated successfully.",
                            });
                          }}>
                            Update Password
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={saveSecuritySettings} className="btn-hover">
                      <Save className="h-4 w-4 mr-2" />
                      Save Security Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="api">
              <div className="space-y-6">
                <Card className="border border-healthcare-gray-light">
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage your API keys for third-party integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">EHR System API Key</Label>
                          <p className="text-sm text-healthcare-gray">
                            Used for connecting to your electronic health record system
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={apiKeys.ehrApiKey} 
                            readOnly 
                            className="w-64 font-mono text-sm bg-slate-50"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => regenerateApiKey('ehrApiKey')}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Pharmacy Integration API Key</Label>
                          <p className="text-sm text-healthcare-gray">
                            Used for connecting to pharmacy systems
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={apiKeys.pharmacyApiKey} 
                            readOnly 
                            className="w-64 font-mono text-sm bg-slate-50"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => regenerateApiKey('pharmacyApiKey')}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Billing System API Key</Label>
                          <p className="text-sm text-healthcare-gray">
                            Used for connecting to your billing and insurance systems
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={apiKeys.billingApiKey} 
                            readOnly 
                            className="w-64 font-mono text-sm bg-slate-50"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => regenerateApiKey('billingApiKey')}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">Analytics API Key</Label>
                          <p className="text-sm text-healthcare-gray">
                            Used for connecting to analytics and reporting tools
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            value={apiKeys.analyticsApiKey} 
                            readOnly 
                            className="w-64 font-mono text-sm bg-slate-50"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => regenerateApiKey('analyticsApiKey')}
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-healthcare-gray-light">
                  <CardHeader>
                    <CardTitle>Third-Party Integrations</CardTitle>
                    <CardDescription>
                      Enable or disable connections with external healthcare systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="ehr-integration" className="font-medium">EHR System Integration</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect with your electronic health record system
                          </p>
                        </div>
                        <Switch 
                          id="ehr-integration" 
                          checked={integrations.ehr}
                          onCheckedChange={() => handleIntegrationChange('ehr')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="pharmacy-integration" className="font-medium">Pharmacy System Integration</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect with pharmacy systems for prescription management
                          </p>
                        </div>
                        <Switch 
                          id="pharmacy-integration" 
                          checked={integrations.pharmacy}
                          onCheckedChange={() => handleIntegrationChange('pharmacy')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="insurance-integration" className="font-medium">Insurance Provider Integration</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect with insurance providers for coverage verification
                          </p>
                        </div>
                        <Switch 
                          id="insurance-integration" 
                          checked={integrations.insurance}
                          onCheckedChange={() => handleIntegrationChange('insurance')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="lab-integration" className="font-medium">Laboratory System Integration</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect with laboratory systems for test ordering and results
                          </p>
                        </div>
                        <Switch 
                          id="lab-integration" 
                          checked={integrations.labSystem}
                          onCheckedChange={() => handleIntegrationChange('labSystem')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="telemedicine-integration" className="font-medium">Telemedicine Platform Integration</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect with telemedicine platforms for virtual appointments
                          </p>
                        </div>
                        <Switch 
                          id="telemedicine-integration" 
                          checked={integrations.telemedicine}
                          onCheckedChange={() => handleIntegrationChange('telemedicine')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="portal-integration" className="font-medium">Patient Portal Integration</Label>
                          <p className="text-sm text-healthcare-gray">
                            Connect with patient portal systems for seamless data sharing
                          </p>
                        </div>
                        <Switch 
                          id="portal-integration" 
                          checked={integrations.patientPortal}
                          onCheckedChange={() => handleIntegrationChange('patientPortal')}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-healthcare-gray-light">
                  <CardHeader>
                    <CardTitle>Webhook Configuration</CardTitle>
                    <CardDescription>
                      Set up webhooks to notify external systems of events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhook-url" className="font-medium">Webhook URL</Label>
                        <Input 
                          id="webhook-url"
                          placeholder="https://api.yoursystem.com/webhook"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="webhook-events" className="font-medium">Webhook Events</Label>
                        <Select 
                          value={webhookEvents} 
                          onValueChange={(value) => setWebhookEvents(value)}
                        >
                          <SelectTrigger id="webhook-events" className="w-full">
                            <SelectValue placeholder="Select events to trigger webhooks" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Events</SelectItem>
                            <SelectItem value="appointments">Appointments Only</SelectItem>
                            <SelectItem value="billing">Billing Only</SelectItem>
                            <SelectItem value="prescriptions">Prescriptions Only</SelectItem>
                            <SelectItem value="patients">Patient Records Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="pt-4">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Test Webhook
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={saveApiSettings} className="btn-hover">
                    <Save className="h-4 w-4 mr-2" />
                    Save API Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Settings;
