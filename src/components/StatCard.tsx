import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, className = "" }: StatCardProps) => (
  <div className={`bg-card rounded-lg p-5 shadow-card border border-border ${className}`}>
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <p className={`text-xs font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last month
          </p>
        )}
      </div>
      <div className="p-2.5 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </div>
  </div>
);

export default StatCard;
