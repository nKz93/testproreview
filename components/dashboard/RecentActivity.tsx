"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Star, Send, AlertCircle } from 'lucide-react';

const mockActivity = [
  { type: 'review_received', message: 'Avis 5 etoiles de Marie D.', time: 'Il y a 5 min', icon: Star, color: 'text-yellow-500 bg-yellow-50' },
  { type: 'sms_sent', message: 'SMS envoye a 3 clients', time: 'Il y a 15 min', icon: Send, color: 'text-blue-500 bg-blue-50' },
  { type: 'feedback_received', message: 'Nouveau feedback prive', time: 'Il y a 1h', icon: AlertCircle, color: 'text-red-500 bg-red-50' },
  { type: 'review_received', message: 'Avis 5 etoiles de Pierre M.', time: 'Il y a 2h', icon: Star, color: 'text-yellow-500 bg-yellow-50' },
  { type: 'sms_sent', message: 'Campagne envoyee a 12 clients', time: 'Il y a 3h', icon: Send, color: 'text-blue-500 bg-blue-50' },
];

export function RecentActivity() {
  return (
    <Card className="shadow-md border-0 h-full">
      <CardHeader>
        <CardTitle className="text-lg">Activite recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivity.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.message}</p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
