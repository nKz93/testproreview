import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/dashboard/StatsCards'
import ReviewChart from '@/components/dashboard/ReviewChart'
import RecentActivity from '@/components/dashboard/RecentActivity'
import { getLast30DaysLabels, calculateRate } from '@/lib/utils'
import type { DashboardStats } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  if (!business) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Chargement...</p>
      </div>
    )
  }

  // Statistiques du mois en cours
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: requestsSentCount } = await supabase
    .from('review_requests')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .gte('created_at', startOfMonth.toISOString())
    .not('status', 'eq', 'pending')

  const { count: clickedCount } = await supabase
    .from('review_requests')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .gte('created_at', startOfMonth.toISOString())
    .in('status', ['clicked', 'reviewed', 'feedback'])

  const { count: reviewsObtained } = await supabase
    .from('review_requests')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)
    .eq('status', 'reviewed')
    .gte('created_at', startOfMonth.toISOString())

  // Score moyen
  const { data: clicks } = await supabase
    .from('review_clicks')
    .select('satisfaction_score')
    .eq('action', 'redirect_google')
    .order('clicked_at', { ascending: false })
    .limit(100)

  const avgScore = clicks && clicks.length > 0
    ? Math.round((clicks.reduce((acc, c) => acc + c.satisfaction_score, 0) / clicks.length) * 10) / 10
    : 0

  // Données graphique 30 jours
  const last30Days = getLast30DaysLabels()
  const chartData = last30Days.map(date => ({
    date,
    avis: Math.floor(Math.random() * 8), // En production, requête réelle
    feedbacks: Math.floor(Math.random() * 2),
  }))

  // Activité récente
  const { data: recentRequests } = await supabase
    .from('review_requests')
    .select('*, customer:customers(name)')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const recentActivity = (recentRequests || []).map(req => ({
    id: req.id,
    type: req.status === 'reviewed' ? 'review_received' as const
      : req.status === 'feedback' ? 'feedback_received' as const
      : req.method === 'sms' ? 'sms_sent' as const
      : 'email_sent' as const,
    customerName: (req.customer as { name: string } | null)?.name || 'Client inconnu',
    date: req.created_at,
  }))

  const stats: DashboardStats = {
    totalRequestsSent: requestsSentCount || 0,
    clickRate: calculateRate(clickedCount || 0, requestsSentCount || 0),
    googleReviewsObtained: reviewsObtained || 0,
    averageScore: avgScore,
    smsUsed: business.monthly_sms_used || 0,
    smsLimit: business.monthly_sms_limit || 50,
    recentActivity,
    chartData,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de vos performances ce mois</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReviewChart data={stats.chartData} />
        </div>
        <div>
          <RecentActivity activities={stats.recentActivity} />
        </div>
      </div>
    </div>
  )
}
