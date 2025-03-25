
import { 
  DollarSign, 
  PoundSterling, 
  Euro, 
  JapaneseYen, 
  IndianRupee, 
  SwissFranc, 
  RussianRuble
} from "lucide-react";

type CurrencyBadgeProps = {
  value: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
};

const CurrencyBadge = ({ value, label, isSelected, onClick }: CurrencyBadgeProps) => {
  const getBadgeIcon = () => {
    switch (value) {
      case "USD":
        return <DollarSign className="h-4 w-4 text-green-700" />;
      case "GBP":
        return <PoundSterling className="h-4 w-4 text-blue-700" />;
      case "EUR":
        return <Euro className="h-4 w-4 text-blue-600" />;
      case "JPY":
      case "CNY":
        return <JapaneseYen className="h-4 w-4 text-red-700" />;
      case "INR":
        return <IndianRupee className="h-4 w-4 text-orange-700" />;
      case "CHF":
        return <SwissFranc className="h-4 w-4 text-red-600" />;
      case "RUB":
        return <RussianRuble className="h-4 w-4 text-blue-800" />;
      case "ZAR":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div 
      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
        isSelected ? "bg-blue-100 border-blue-300 border" : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="rounded-full bg-white p-1.5 shadow-sm">
        {getBadgeIcon()}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default CurrencyBadge;
