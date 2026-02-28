import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateUniqueCode } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { businessId, name, color } = await request.json()

    if (!businessId) return NextResponse.json({ error: 'businessId manquant' }, { status: 400 })

    const supabase = createAdminClient()

    // Générer un code court unique
    let shortCode = generateUniqueCode(8)
    let isUnique = false

    while (!isUnique) {
      const { data } = await supabase.from('qr_codes').select('id').eq('short_code', shortCode).single()
      if (!data) isUnique = true
      else shortCode = generateUniqueCode(8)
    }

    const { data, error } = await supabase.from('qr_codes').insert({
      business_id: businessId,
      name: name || 'QR Code',
      short_code: shortCode,
      design_config: { color: color || '#3B82F6', style: 'rounded' },
    }).select().single()

    if (error) throw error

    return NextResponse.json({ success: true, qrCode: data, shortCode })
  } catch (error) {
    console.error('Erreur génération QR:', error)
    return NextResponse.json({ error: 'Erreur lors de la génération du QR code' }, { status: 500 })
  }
}
