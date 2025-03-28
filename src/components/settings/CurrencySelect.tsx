
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CurrencyBadge from "./CurrencyBadges";

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "CNY", label: "Chinese Yuan (CNY)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "ZAR", label: "South African Rand (ZAR)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
  { value: "RUB", label: "Russian Ruble (RUB)" },
];

type CurrencySelectProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function CurrencySelect({ value, onValueChange }: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.value} value={currency.value}>
              <div className="flex items-center gap-2">
                <CurrencyBadge
                  value={currency.value}
                  label={currency.label}
                  isSelected={value === currency.value}
                  onClick={() => {}}
                />
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="grid grid-cols-3 gap-2 mt-2">
        {currencies.slice(0, 6).map((currency) => (
          <CurrencyBadge
            key={currency.value}
            value={currency.value}
            label={currency.value}
            isSelected={value === currency.value}
            onClick={() => onValueChange(currency.value)}
          />
        ))}
      </div>
    </div>
  );
}
