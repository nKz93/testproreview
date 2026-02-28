"use client"
import { useState, useEffect } from 'react'
import { MessageSquare, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import type { PrivateFeedback } from '@/types'

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<PrivateFeedback[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'unresolved'>('unread')
  const [loading, setLoading] = useState(true)

  const fetchFeedbacks = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: business } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
    if (!business) return

    let query = supabase
      .from('private_feedbacks')
      .select('*, customer:customers(name)')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

    if (filter === 'unread') query = query.eq('is_read', false)
    if (filter === 'unresolved') query = query.eq('is_resolved', false)

    const { data } = await query
    setFeedbacks((data || []) as PrivateFeedback[])
    setLoading(false)
  }

  useEffect(() => { fetchFeedbacks() }, [filter])

  const markAsRead = async (id: string) => {
    const supabase = createClient()
    await supabase.from('private_feedbacks').update({ is_read: true }).eq('id', id)
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, is_read: true } : f))
  }

  const markAsResolved = async (id: string) => {
    const supabase = createClient()
    await supabase.from('private_feedbacks').update({ is_resolved: true, resolved_at: new Date().toISOString() }).eq('id', id)
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, is_resolved: true } : f))
    toast({ title: 'Feedback résolu ✅' })
  }

  const scoreEmoji = (score: number) => ['', '😡', '😕', '😐', '😊', '🤩'][score] || '😐'

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedbacks privés</h1>
        <p className="text-gray-500 text-sm">Avis négatifs interceptés — visibles uniquement par vous</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {(['all', 'unread', 'unresolved'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'gradient' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tous' : f === 'unread' ? 'Non lus' : 'Non résolus'}
          </Button>
        ))}
      </div>

      {/* Liste feedbacks */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-400 text-center py-8">Chargement...</p>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Aucun feedback dans cette catégorie</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <Card key={feedback.id} className={`${!feedback.is_read ? 'border-blue-200 bg-blue-50/30' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{scoreEmoji(feedback.score)}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {(feedback.customer as { name: string } | null)?.name || 'Client inconnu'}
                        </span>
                        <Badge variant="outline" className="text-xs">{feedback.category}</Badge>
                        {!feedback.is_read && (
                          <Badge className="text-xs gradient-primary text-white">Nouveau</Badge>
                        )}
                        {feedback.is_resolved && (
                          <Badge variant="success" className="text-xs">Résolu</Badge>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{feedback.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDateTime(feedback.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!feedback.is_read && (
                      <Button size="sm" variant="outline" onClick={() => markAsRead(feedback.id)}>
                        <Check className="w-3 h-3 mr-1" />
                        Lu
                      </Button>
                    )}
                    {!feedback.is_resolved && (
                      <Button size="sm" variant="gradient" onClick={() => markAsResolved(feedback.id)}>
                        <CheckCheck className="w-3 h-3 mr-1" />
                        Résolu
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
