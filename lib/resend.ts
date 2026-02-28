import { Resend } from 'resend'

// Client Resend
const resend = new Resend(process.env.RESEND_API_KEY!)

// Envoyer un email via Resend
export async function sendEmail({
  to,
  subject,
  html,
  from = 'ProReview <noreply@proreview.fr>',
}: {
  to: string
  subject: string
  html: string
  from?: string
}): Promise<{ id: string }> {
  const result = await resend.emails.send({ from, to, subject, html })
  if (result.error) {
    throw new Error(result.error.message)
  }
  return { id: result.data!.id }
}

// Template HTML pour l'email de demande d'avis
export function buildReviewEmailHTML({
  businessName,
  customerName,
  reviewUrl,
  logoUrl,
}: {
  businessName: string
  customerName: string
  reviewUrl: string
  logoUrl?: string
}): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre avis compte !</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 40px 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 40px 32px; }
    .body p { color: #374151; font-size: 16px; line-height: 1.6; }
    .cta { display: block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 18px; font-weight: 600; text-align: center; margin: 32px 0; }
    .footer { padding: 24px 32px; border-top: 1px solid #F3F4F6; text-align: center; color: #9CA3AF; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${businessName}" style="height:48px;margin-bottom:16px;border-radius:8px;">` : ''}
      <h1>⭐ Votre avis nous tient à coeur</h1>
    </div>
    <div class="body">
      <p>Bonjour ${customerName},</p>
      <p>Merci pour votre récente visite chez <strong>${businessName}</strong>. Votre satisfaction est notre priorité et nous aimerions connaître votre expérience.</p>
      <p>Cela ne prend que 30 secondes !</p>
      <a href="${reviewUrl}" class="cta">✍️ Donner mon avis</a>
      <p style="font-size:14px;color:#9CA3AF;">Si vous avez des questions, n'hésitez pas à nous contacter directement.</p>
    </div>
    <div class="footer">
      <p>Propulsé par ProReview · Vous recevez cet email car vous êtes client de ${businessName}</p>
    </div>
  </div>
</body>
</html>
  `
}
