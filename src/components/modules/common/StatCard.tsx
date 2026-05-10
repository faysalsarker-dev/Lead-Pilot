"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
  accentClassName?: string;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
  accentClassName,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium leading-none text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-muted/80",
              accentClassName
            )}
          >
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </div>
          {description && (
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {trend.value}% from last month
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoCardProps {
  title: string;
  items: { label: string; value: string | React.ReactNode }[];
  className?: string;
}

export function InfoCard({ title, items, className }: InfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface GridProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  gap?: "sm" | "md" | "lg";
}

export function StatsGrid({
  title,
  description,
  children,
  columns = 4,
  gap = "md",
}: GridProps) {
  const gridClass = {
    1: "grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "sm:grid-cols-2 lg:grid-cols-5",
  }[columns];

  const gapClass = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  }[gap];

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div>
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className={`grid grid-cols-1 ${gridClass} ${gapClass}`}>{children}</div>
    </div>
  );
}
