import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSMS } from '@/lib/twilio'
import { sendEmail, buildReviewEmailHTML } from '@/lib/resend'
import { generateUniqueCode, interpolateTemplate, normalizePhone } from '@/lib/utils'
import { APP_URL } from '@/lib/constants'

// Route appelée par le cron Vercel pour les envois automatiques
export async function GET(request: NextRequest) {
  // Vérifier l'autorisation du cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Récupérer les businesses avec envoi automatique activé
    const { data: businesses } = await supabase
      .from('businesses')
      .select('*')
      .eq('auto_send_enabled', true)

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ message: 'Aucun business avec envoi auto' })
    }

    let totalSent = 0

    for (const business of businesses) {
      const delayMs = business.auto_send_delay_hours * 60 * 60 * 1000
      const cutoffTime = new Date(Date.now() - delayMs).toISOString()

      // Clients qui ont visité il y a X heures et n'ont pas encore reçu de demande
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', business.id)
        .lte('created_at', cutoffTime)
        .gte('created_at', new Date(Date.now() - delayMs - 3600000).toISOString()) // Fenêtre d'1h

      if (!customers) continue

      // Filtrer ceux qui n'ont pas déjà de demande
      for (const customer of customers) {
        const { data: existingRequest } = await supabase
          .from('review_requests')
          .select('id')
          .eq('customer_id', customer.id)
          .single()

        if (existingRequest) continue

        const code = generateUniqueCode()
        const reviewUrl = `${APP_URL}/review/${code}`

        await supabase.from('review_requests').insert({
          business_id: business.id,
          customer_id: customer.id,
          unique_code: code,
          method: business.send_method === 'both' ? 'sms' : business.send_method,
          status: 'pending',
        })

        try {
          if ((business.send_method === 'sms' || business.send_method === 'both') && customer.phone) {
            const message = interpolateTemplate(business.sms_template, { name: customer.name, business: business.name, link: reviewUrl })
            await sendSMS(normalizePhone(customer.phone), message)
          }

          if ((business.send_method === 'email' || business.send_method === 'both') && customer.email) {
            const html = buildReviewEmailHTML({ businessName: business.name, customerName: customer.name, reviewUrl })
            await sendEmail({ to: customer.email, subject: `Votre avis sur ${business.name}`, html })
          }

          await supabase.from('review_requests').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('unique_code', code)
          totalSent++
        } catch (err) {
          console.error(`Auto-send erreur client ${customer.id}:`, err)
        }
      }
    }

    return NextResponse.json({ success: true, totalSent })
  } catch (error) {
    console.error('Erreur cron auto-send:', error)
    return NextResponse.json({ error: 'Erreur cron' }, { status: 500 })
  }
}
