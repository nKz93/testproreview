import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { requestId, businessId, customerId, score, action, feedback, category } = await request.json()

    if (!requestId || !score || !action) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Enregistrer le clic
    await supabase.from('review_clicks').insert({
      request_id: requestId,
      satisfaction_score: score,
      action,
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    })

    // Mettre à jour le statut de la demande
    const newStatus = action === 'redirect_google' ? 'reviewed' : 'feedback'
    await supabase.from('review_requests').update({
      status: newStatus,
      clicked_at: new Date().toISOString(),
      reviewed_at: action === 'redirect_google' ? new Date().toISOString() : null,
    }).eq('id', requestId)

    // Si feedback privé, enregistrer le message
    if (action === 'private_feedback' && feedback && businessId && customerId) {
      await supabase.from('private_feedbacks').insert({
        business_id: businessId,
        request_id: requestId,
        customer_id: customerId,
        score,
        message: feedback,
        category: category || 'general',
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur soumission avis:', error)
    return NextResponse.json({ error: 'Erreur lors de la soumission' }, { status: 500 })
  }
}
