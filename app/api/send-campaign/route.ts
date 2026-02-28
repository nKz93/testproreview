import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/twilio'
import { sendEmail, buildReviewEmailHTML } from '@/lib/resend'
import { generateUniqueCode, interpolateTemplate, normalizePhone } from '@/lib/utils'
import { APP_URL } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json()
    if (!campaignId) return NextResponse.json({ error: 'campaignId manquant' }, { status: 400 })

    const supabase = createAdminClient()
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*, business:businesses(*)')
      .eq('id', campaignId)
      .single()

    if (!campaign) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 })

    const business = campaign.business as Record<string, string>
    const { data: customers } = await supabase.from('customers').select('*').eq('business_id', business.id)

    if (!customers || customers.length === 0) return NextResponse.json({ error: 'Aucun client' }, { status: 400 })

    await supabase.from('campaigns').update({ status: 'sending', total_recipients: customers.length }).eq('id', campaignId)

    let sentCount = 0
    for (const customer of customers) {
      const code = generateUniqueCode()
      const reviewUrl = `${APP_URL}/review/${code}`

      await supabase.from('review_requests').insert({
        business_id: business.id,
        customer_id: customer.id,
        unique_code: code,
        method: campaign.method === 'both' ? 'sms' : campaign.method,
        status: 'pending',
      })

      try {
        if ((campaign.method === 'sms' || campaign.method === 'both') && customer.phone) {
          const message = interpolateTemplate(business.sms_template || '', { name: customer.name, business: business.name, link: reviewUrl })
          await sendSMS(normalizePhone(customer.phone), message)
        }
        if ((campaign.method === 'email' || campaign.method === 'both') && customer.email) {
          const html = buildReviewEmailHTML({ businessName: business.name, customerName: customer.name, reviewUrl, logoUrl: business.logo_url })
          await sendEmail({ to: customer.email, subject: `Votre avis sur ${business.name}`, html })
        }
        await supabase.from('review_requests').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('unique_code', code)
        sentCount++
      } catch (err) {
        console.error(`Erreur client ${customer.id}:`, err)
        await supabase.from('review_requests').update({ status: 'failed' }).eq('unique_code', code)
      }
      await new Promise(r => setTimeout(r, 100))
    }

    await supabase.from('campaigns').update({ status: 'completed', sent_count: sentCount, completed_at: new Date().toISOString() }).eq('id', campaignId)
    return NextResponse.json({ success: true, sentCount })
  } catch (error) {
    console.error('Erreur campagne:', error)
    return NextResponse.json({ error: 'Erreur campagne' }, { status: 500 })
  }
}
