import { Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Settings = () => {
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
                    <div className="space-y-2">
                      <Label htmlFor="practiceName">Practice Name</Label>
                      <Input id="practiceName" defaultValue="MediCare Clinic" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" defaultValue="info@medicare-clinic.com" />
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
                    <Button className="btn-hover">
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
              <Card className="border border-healthcare-gray-light">
                <CardHeader>
                  <CardTitle>API & Integrations</CardTitle>
                  <CardDescription>
                    Connect with third-party services and manage API access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-healthcare-gray">API and integration settings will appear here.</p>
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
