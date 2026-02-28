"use client"
import { motion } from 'framer-motion';
import { Send, MousePointer, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Avis envoyes ce mois',
      value: stats.sentThisMonth.toString(),
      icon: Send,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Taux de clic',
      value: `${stats.clickRate}%`,
      icon: MousePointer,
      color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-500',
    },
    {
      label: 'Avis Google obtenus',
      value: stats.googleReviews.toString(),
      icon: Star,
      color: 'from-orange-500 to-yellow-500',
      bg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      label: 'Note moyenne',
      value: stats.averageScore.toFixed(1),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      iconColor: 'text-green-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className="shadow-md hover:shadow-lg transition-shadow border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
