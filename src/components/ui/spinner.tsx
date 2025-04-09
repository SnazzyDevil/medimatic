
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={cn("animate-spin", sizeClasses[size], className)}>
      <div className="h-full w-full rounded-full border-4 border-t-blue-600 border-r-transparent border-b-blue-600 border-l-transparent"></div>
    </div>
  );
}
