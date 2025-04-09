
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  {
    value: "Africa/Harare",
    label: "Harare/Johannesburg",
    offset: "+02:00",
  },
];

export function TimezoneSettings() {
  const [timezone, setTimezone] = useState<string>("America/Los_Angeles");
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Timezone</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred timezone
        </p>
      </div>
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
  );
}
