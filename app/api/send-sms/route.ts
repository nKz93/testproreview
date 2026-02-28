import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/twilio'
import { createAdminClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { to, message, requestCode } = await request.json()
    if (!to || !message) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

    const normalizedPhone = normalizePhone(to)
    const result = await sendSMS(normalizedPhone, message)

    if (requestCode) {
      const supabase = createAdminClient()
      await supabase.from('review_requests')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('unique_code', requestCode)
    }

    return NextResponse.json({ success: true, sid: result.sid })
  } catch (error) {
    console.error('Erreur envoi SMS:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du SMS' }, { status: 500 })
  }
}
