
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: 'success' | 'error' | 'pending' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge = ({ status, children, className }: StatusBadgeProps) => {
  const statusConfig = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: CheckCircle
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      icon: XCircle
    },
    pending: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: Clock
    },
    warning: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      icon: AlertCircle
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
      config.bg,
      config.text,
      config.border,
      className
    )}>
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
};
