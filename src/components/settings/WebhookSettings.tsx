
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WebhookSettings() {
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedRequestMethod, setSelectedRequestMethod] = useState<string>("");
  const [selectedRequestFormat, setSelectedRequestFormat] = useState<string>("");
  const [selectedEventSeverity, setSelectedEventSeverity] = useState<string>("");

  const handleEventTypeChange = (value: string) => {
    setSelectedEventTypes(prevState => {
      // If this is a multi-select, you'd manage an array
      // For this example, we'll just use the single value
      return [value];
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="webhook_url">Webhook URL</Label>
        <Input id="webhook_url" placeholder="https://example.com/webhooks" />
      </div>
      
      <div className="grid gap-1.5">
        <Label>Events</Label>
        <Select 
          value={selectedEventTypes[0] || ""} 
          onValueChange={handleEventTypeChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select event types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="appointments">Appointments Only</SelectItem>
            <SelectItem value="patients">Patient Updates Only</SelectItem>
            <SelectItem value="billing">Billing Events Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-1.5">
        <Label>Request Method</Label>
        <Select
          value={selectedRequestMethod}
          onValueChange={setSelectedRequestMethod}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select request method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-1.5">
        <Label>Request Format</Label>
        <Select
          value={selectedRequestFormat}
          onValueChange={setSelectedRequestFormat}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select request format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="form">Form Data</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-1.5">
        <Label>Event Severity</Label>
        <Select
          value={selectedEventSeverity}
          onValueChange={setSelectedEventSeverity}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select event severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="info">Information</SelectItem>
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
  );
}
