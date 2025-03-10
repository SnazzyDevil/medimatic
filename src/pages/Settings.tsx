
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const Settings = () => {
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
                <CardContent>
                  <p className="text-healthcare-gray">Notification settings will appear here.</p>
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
                <CardContent>
                  <p className="text-healthcare-gray">Security settings will appear here.</p>
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
