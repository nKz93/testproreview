"use client"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartDataPoint } from '@/types';

interface ReviewChartProps {
  data: ChartDataPoint[];
}

export function ReviewChart({ data }: ReviewChartProps) {
  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="text-lg">Evolution des avis — 30 derniers jours</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAvis" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEnvois" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="envois" stroke="#8B5CF6" strokeWidth={2} fill="url(#colorEnvois)" name="Envois" />
            <Area type="monotone" dataKey="avis" stroke="#3B82F6" strokeWidth={2} fill="url(#colorAvis)" name="Avis Google" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
