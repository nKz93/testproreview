import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, buildReviewEmailHTML } from '@/lib/resend'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, businessName, customerName, reviewUrl, logoUrl, requestCode } = await request.json()
    if (!to || !businessName || !reviewUrl) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

    const html = buildReviewEmailHTML({ businessName, customerName, reviewUrl, logoUrl })
    const result = await sendEmail({ to, subject: subject || `Votre avis sur ${businessName} nous intéresse !`, html })

    if (requestCode) {
      const supabase = createAdminClient()
      await supabase.from('review_requests')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('unique_code', requestCode)
    }

    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 })
  }
}
