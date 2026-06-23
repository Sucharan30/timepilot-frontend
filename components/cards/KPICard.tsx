"use client";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export function KPICard({ title, value, icon: Icon, description, trend, className }: KPICardProps) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className || ""}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium tracking-tight text-muted-foreground">{title}</p>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold">{value}</div>
          {trend ? (
            <p className="text-xs text-muted-foreground">
              <span className={trend.value > 0 ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>{" "}
              {trend.label}
            </p>
          ) : description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
