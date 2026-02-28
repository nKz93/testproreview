import { createAdminClient } from '@/lib/supabase/server'
import ReviewFlow from './ReviewFlow'

interface ReviewPageProps {
  params: { code: string }
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { code } = params
  const supabase = createAdminClient()

  const { data: request } = await supabase
    .from('review_requests')
    .select('*, customer:customers(name), business:businesses(name, google_review_url, logo_url)')
    .eq('unique_code', code)
    .single()

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
          <p className="text-gray-500">Ce lien de demande d'avis n'existe pas ou a expiré.</p>
        </div>
      </div>
    )
  }

  if (!request.opened_at) {
    await supabase
      .from('review_requests')
      .update({ opened_at: new Date().toISOString(), status: 'opened' })
      .eq('unique_code', code)
  }

  const businessData = request.business as { name: string; google_review_url: string | null; logo_url: string | null } | null
  const customerData = request.customer as { name: string } | null

  return (
    <ReviewFlow
      requestId={request.id}
      businessId={request.business_id}
      customerId={request.customer_id}
      businessName={businessData?.name || 'ce commerce'}
      googleReviewUrl={businessData?.google_review_url || null}
      logoUrl={businessData?.logo_url || null}
      customerName={customerData?.name || 'vous'}
      uniqueCode={code}
    />
  )
}
