import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
  subtitleColor?: string;
}

export default function StatCard({ title, value, icon, color = "", subtitle, subtitleColor = "text-muted-foreground" }: StatCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm border-border/50 bg-card hover:bg-muted/10 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
        {subtitle && (
          <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}