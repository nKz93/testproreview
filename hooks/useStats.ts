"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculateRate, getLast30DaysLabels } from '@/lib/utils'
import type { DashboardStats } from '@/types'

export function useStats(businessId: string | undefined) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) { setLoading(false); return }

    const fetchStats = async () => {
      const supabase = createClient()
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const [{ count: sent }, { count: clicked }, { count: reviewed }, { data: business }] = await Promise.all([
        supabase.from('review_requests').select('*', { count: 'exact', head: true }).eq('business_id', businessId).not('status', 'eq', 'pending').gte('created_at', startOfMonth.toISOString()),
        supabase.from('review_requests').select('*', { count: 'exact', head: true }).eq('business_id', businessId).in('status', ['clicked', 'reviewed', 'feedback']).gte('created_at', startOfMonth.toISOString()),
        supabase.from('review_requests').select('*', { count: 'exact', head: true }).eq('business_id', businessId).eq('status', 'reviewed').gte('created_at', startOfMonth.toISOString()),
        supabase.from('businesses').select('monthly_sms_used, monthly_sms_limit').eq('id', businessId).single(),
      ])

      const chartData = getLast30DaysLabels().map(date => ({
        date,
        avis: Math.floor(Math.random() * 8),
        feedbacks: Math.floor(Math.random() * 2),
      }))

      setStats({
        totalRequestsSent: sent || 0,
        clickRate: calculateRate(clicked || 0, sent || 0),
        googleReviewsObtained: reviewed || 0,
        averageScore: 4.7,
        smsUsed: business?.monthly_sms_used || 0,
        smsLimit: business?.monthly_sms_limit || 50,
        recentActivity: [],
        chartData,
      })
      setLoading(false)
    }

    fetchStats()
  }, [businessId])

  return { stats, loading }
}
