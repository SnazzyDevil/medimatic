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
import { Textarea } from "@/components/ui/textarea";
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

const eventTypes = [
  "appointments",
  "patients",
  "billing",
];

const requestMethods = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
];

const requestFormats = [
  "JSON",
  "XML",
  "Form Data",
];

const eventSeverities = [
  "success",
  "warning",
  "error",
  "info",
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
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedRequestMethod, setSelectedRequestMethod] = useState<string>("");
  const [selectedRequestFormat, setSelectedRequestFormat] = useState<string>("");
  const [selectedEventSeverity, setSelectedEventSeverity] = useState<string>("");
  const { toast } = useToast()

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
  }, [apiKey])

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
              <h3 className="text-lg font-medium">Personal Information</h3>
              <p className="text-sm text-muted-foreground">
                Update your personal information
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="framework">Framework (cmd+k)</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {framework
                        ? frameworks.find((f) => f.value === framework)?.label
                        : "Select framework..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search framework..." />
                      <CommandList>
                        <CommandEmpty>No framework found.</CommandEmpty>
                        <CommandGroup>
                          {frameworks.map((framework) => (
                            <CommandItem
                              key={framework.value}
                              value={framework.value}
                              onSelect={(value) => {
                                setFramework(value === framework ? "" : framework.value)
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  framework === framework ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {framework.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
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
            <div className="space-y-2">
              <div className="grid gap-1.5">
                <Label htmlFor="webhook_url">Webhook URL</Label>
                <Input id="webhook_url" placeholder="https://example.com/webhooks" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="events">Events</Label>
                <Select
                  id="events"
                  multiple
                  value={selectedEventTypes}
                  onValueChange={(value) => setSelectedEventTypes(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select event types" />
                  </SelectTrigger>
                  
                        <SelectContent>
                          <SelectItem key="all" value="all">All Events</SelectItem>
                          <SelectItem key="appointments" value="appointments">Appointments Only</SelectItem>
                          <SelectItem key="patients" value="patients">Patient Updates Only</SelectItem>
                          <SelectItem key="billing" value="billing">Billing Events Only</SelectItem>
                        </SelectContent>
                      
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="request_method">Request Method</Label>
                <Select
                  id="request_method"
                  value={selectedRequestMethod}
                  onValueChange={(value) => setSelectedRequestMethod(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select request method" />
                  </SelectTrigger>
                  
                        <SelectContent>
                          <SelectItem key="get-method" value="GET">GET</SelectItem>
                          <SelectItem key="post-method" value="POST">POST</SelectItem>
                          <SelectItem key="put-method" value="PUT">PUT</SelectItem>
                          <SelectItem key="delete-method" value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="request_format">Request Format</Label>
                <Select
                  id="request_format"
                  value={selectedRequestFormat}
                  onValueChange={(value) => setSelectedRequestFormat(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select request format" />
                  </SelectTrigger>
                  
                        <SelectContent>
                          <SelectItem key="json-format" value="json">JSON</SelectItem>
                          <SelectItem key="xml-format" value="xml">XML</SelectItem>
                          <SelectItem key="form-format" value="form">Form Data</SelectItem>
                        </SelectContent>
                      
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="event_severity">Event Severity</Label>
                <Select
                  id="event_severity"
                  value={selectedEventSeverity}
                  onValueChange={(value) => setSelectedEventSeverity(value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select event severity" />
                  </SelectTrigger>
                  
                        <SelectContent>
                          <SelectItem key="success-event" value="success">Success</SelectItem>
                          <SelectItem key="warning-event" value="warning">Warning</SelectItem>
                          <SelectItem key="error-event" value="error">Error</SelectItem>
                          <SelectItem key="info-event" value="info">Information</SelectItem>
                        </SelectContent>
                      
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="delivery_attempts">Delivery Attempts</Label>
                <Input id="delivery_attempts" type="number" defaultValue={3} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="secret">Secret</Label>
                <Textarea id="secret" placeholder="A secret key to sign the webhook payload" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
