import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckoutSession } from '@/lib/stripe'
import { APP_URL, PLAN_PRICES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: business } = await supabase
      .from('businesses')
      .select('id, stripe_customer_id')
      .eq('user_id', session.user.id)
      .single()

    if (!business) return NextResponse.json({ error: 'Business introuvable' }, { status: 404 })

    const planData = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
    if (!planData?.priceId) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

    const checkoutSession = await createCheckoutSession({
      customerId: business.stripe_customer_id || undefined,
      priceId: planData.priceId as string,
      businessId: business.id,
      successUrl: `${APP_URL}/dashboard/billing?success=true`,
      cancelUrl: `${APP_URL}/dashboard/billing`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Erreur checkout Stripe:', error)
    return NextResponse.json({ error: 'Erreur checkout' }, { status: 500 })
  }
}
