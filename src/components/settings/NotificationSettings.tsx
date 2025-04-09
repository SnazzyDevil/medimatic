
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
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

export function NotificationSettings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="space-y-6">
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
    </div>
  );
}
