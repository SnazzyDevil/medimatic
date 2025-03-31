import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Copy, PlusCircle, Settings as SettingsIcon, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { WebhookSettings } from "@/components/settings/WebhookSettings";
import { CurrencySelect } from "@/components/settings/CurrencySelect";
import { PracticeService } from "@/services/practiceService";
import { PracticeInformation } from "@/types/practice";
import { Textarea } from "@/components/ui/textarea";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

const notifications = [
  {
    id: "email",
    title: "Email",
    description: "Send daily digest emails",
  },
  {
    id: "push",
    title: "Push notifications",
    description: "Send push notifications to your device",
  },
  {
    id: "sms",
    title: "SMS",
    description: "Send SMS notifications to your phone",
  },
];

const timezones = [
  {
    value: "America/Los_Angeles",
    label: "America/Los_Angeles",
    offset: "-07:00",
  },
  {
    value: "America/New_York",
    label: "America/New_York",
    offset: "-04:00",
  },
  {
    value: "Europe/London",
    label: "Europe/London",
    offset: "+01:00",
  },
  {
    value: "Asia/Tokyo",
    label: "Asia/Tokyo",
    offset: "+09:00",
  },
  {
    value: "Australia/Sydney",
    label: "Australia/Sydney",
    offset: "+10:00",
  },
];

type ApiKey = {
  id: string
  prefix: string
  key: string
  createdAt: Date
  scopes: string[]
}

function generateApiKey() {
  const prefix = Math.random().toString(36).substring(2, 7)
  const key = Math.random().toString(36).substring(2)

  return {
    id: Math.random().toString(36).substring(2),
    prefix,
    key,
    createdAt: new Date(),
    scopes: ["store:read", "store:write"],
  }
}

export default function Settings() {
  const [open, setOpen] = useState(false)
  const [framework, setFramework] = useState<string>("")
  const [timezone, setTimezone] = useState<string>("America/Los_Angeles")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [apiKey, setApiKey] = useState<ApiKey | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [currency, setCurrency] = useState<string>("ZAR")
  const [doctorName, setDoctorName] = useState("")
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [stateProvince, setStateProvince] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const { toast } = useToast();

  const [practiceInfo, setPracticeInfo] = useState<PracticeInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPracticeInfo = async () => {
      try {
        setLoading(true);
        const info = await PracticeService.getCurrentPractice();
        setPracticeInfo(info);
        
        if (info) {
          setName(info.name);
          setEmail(info.email);
          setPhone(info.phone);
          setCurrency(info.currency);
          
          setDoctorName(info.practiceType === "medical" ? info.name : "");
          setAddressLine1(info.addressLine1 || "");
          setAddressLine2(info.addressLine2 || "");
          setCity(info.city || "");
          setPostalCode(info.postalCode || "");
          setStateProvince(info.stateProvince || "");
          setRegistrationNumber(info.registrationNumber || "");
          setVatNumber(info.vatNumber || "");
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

  useEffect(() => {
    if (!apiKey) {
      return
    }
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [apiKey]);

  const handleSavePracticeInfo = async () => {
    if (!practiceInfo) return;
    
    try {
      setSaving(true);
      
      await PracticeService.update(practiceInfo.id, {
        name,
        email,
        phone,
        currency,
        addressLine1,
        addressLine2,
        city,
        postalCode,
        stateProvince,
        registrationNumber,
        vatNumber
      });
      
      toast({
        title: "Success",
        description: "Practice information updated successfully",
      });
    } catch (error) {
      console.error("Error updating practice information:", error);
      toast({
        title: "Error",
        description: "Failed to update practice information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl p-6 mb-8 shadow-md">
            <h1 className="font-bold text-3xl mb-2">Settings</h1>
            <p className="text-violet-100">Manage your account settings and preferences</p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Practice Information</h3>
              <p className="text-sm text-muted-foreground">
                Update your practice information
              </p>
            </div>
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
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
                      onValueChange={(value) => {
                        setCurrency(value);
                        if (practiceInfo) {
                          PracticeService.update(practiceInfo.id, { currency: value })
                            .then(() => {
                              toast({
                                title: "Currency updated",
                                description: `Currency has been set to ${value}`,
                              });
                            })
                            .catch((error) => {
                              console.error("Error updating currency:", error);
                              toast({
                                title: "Error",
                                description: "Failed to update currency",
                                variant: "destructive",
                              });
                            });
                        }
                      }} 
                    />
                  </div>
                </div>
                
                <div>
                  <Button 
                    onClick={handleSavePracticeInfo} 
                    disabled={saving || !practiceInfo}
                  >
                    {saving ? "Saving..." : "Save Practice Information"}
                  </Button>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Configure push notifications for your account.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Enable Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to your device
                  </p>
                </div>
                <Switch
                  id="notifications"
                  defaultChecked
                  onCheckedChange={(checked) => setNotificationsEnabled(checked)}
                />
              </div>
              <fieldset className="grid gap-6">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">{notification.title}</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Edit notification</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem>
                          Email
                          <DropdownMenuShortcut>⌘⇧E</DropdownMenuShortcut>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>
                          Push
                          <DropdownMenuShortcut>⌘⇧P</DropdownMenuShortcut>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>
                          SMS
                          <DropdownMenuShortcut>⌘⇧S</DropdownMenuShortcut>
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                          <DropdownMenuShortcut>⌘⇧D</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="grid gap-1.5">
                      <Label htmlFor={notification.id}>{notification.title}</Label>
                      <Input id={notification.id} placeholder={notification.title} />
                    </div>
                  </div>
                ))}
              </fieldset>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Timezone</h3>
              <p className="text-sm text-muted-foreground">
                Choose your preferred timezone
              </p>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label} ({timezone.offset})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">API Keys</h3>
              <p className="text-sm text-muted-foreground">
                Manage your API keys
              </p>
            </div>
            
            <Table>
              <TableCaption>A list of your API keys.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Prefix</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.prefix}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={key.key}
                          readOnly
                          className="w-[300px] font-mono text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(key.key)
                            toast({
                              title: "Copied to clipboard.",
                            })
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{key.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost">
                            <SettingsIcon className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            View scopes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit scopes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500 focus:text-red-500">
                            Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <Button
                      onClick={() => {
                        const newKey = generateApiKey()
                        setApiKey(newKey)
                        setApiKeys((prev) => [...prev, newKey])
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Generate Key
                    </Button>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            
            <div>
              <h3 className="text-lg font-medium">Webhooks</h3>
              <p className="text-sm text-muted-foreground">
                Configure webhooks to listen to events on your account.
              </p>
            </div>
            
            <WebhookSettings />
          </div>
        </main>
      </div>
    </div>
  )
}
