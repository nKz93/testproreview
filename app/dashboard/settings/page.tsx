"use client"
import { useState, useEffect } from 'react'
import { Save, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { BUSINESS_TYPES, DEFAULT_SMS_TEMPLATE, DEFAULT_EMAIL_TEMPLATE } from '@/lib/constants'
import type { Business } from '@/types'

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchBusiness = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(data)
      setLoading(false)
    }
    fetchBusiness()
  }, [])

  const handleSave = async () => {
    if (!business) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('businesses')
        .update({
          name: business.name,
          email: business.email,
          phone: business.phone,
          business_type: business.business_type,
          google_review_url: business.google_review_url,
          sms_template: business.sms_template,
          email_template: business.email_template,
          auto_send_enabled: business.auto_send_enabled,
          auto_send_delay_hours: business.auto_send_delay_hours,
          send_method: business.send_method,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business.id)

      if (error) throw error
      toast({ title: 'Paramètres sauvegardés ✅' })
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !business) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 text-sm">Configurez votre compte ProReview</p>
        </div>
        <Button variant="gradient" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Sauvegarder
        </Button>
      </div>

      {/* Informations commerce */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du commerce</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nom du commerce</Label>
              <Input
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type de commerce</Label>
              <Select value={business.business_type} onValueChange={(v) => setBusiness({ ...business, business_type: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={business.phone || ''} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Reviews URL */}
      <Card>
        <CardHeader>
          <CardTitle>URL Google Reviews</CardTitle>
          <CardDescription>
            L'URL vers laquelle vos clients satisfaits seront redirigés.{' '}
            <a href="https://support.google.com/business/answer/7035772" target="_blank" className="text-blue-600 inline-flex items-center gap-1 hover:underline">
              Comment la trouver ? <ExternalLink className="w-3 h-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={business.google_review_url || ''}
            onChange={(e) => setBusiness({ ...business, google_review_url: e.target.value })}
            placeholder="https://g.page/votre-commerce/review"
          />
        </CardContent>
      </Card>

      {/* Templates de messages */}
      <Card>
        <CardHeader>
          <CardTitle>Templates de messages</CardTitle>
          <CardDescription>
            Variables disponibles : {'{name}'} (client), {'{business}'} (votre commerce), {'{link}'} (lien de l'avis)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Template SMS</Label>
            <Textarea
              value={business.sms_template || DEFAULT_SMS_TEMPLATE}
              onChange={(e) => setBusiness({ ...business, sms_template: e.target.value })}
              className="mt-1 resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(business.sms_template || '').length}/160 caractères
            </p>
          </div>
          <div>
            <Label>Template Email (objet)</Label>
            <Textarea
              value={business.email_template || DEFAULT_EMAIL_TEMPLATE}
              onChange={(e) => setBusiness({ ...business, email_template: e.target.value })}
              className="mt-1 resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Envoi automatique */}
      <Card>
        <CardHeader>
          <CardTitle>Envoi automatique</CardTitle>
          <CardDescription>Configurez l'envoi automatique après chaque visite client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Activer l'envoi automatique</p>
              <p className="text-xs text-gray-500">Les demandes seront envoyées automatiquement après X heures</p>
            </div>
            <Switch
              checked={business.auto_send_enabled}
              onCheckedChange={(checked) => setBusiness({ ...business, auto_send_enabled: checked })}
            />
          </div>

          {business.auto_send_enabled && (
            <>
              <Separator />
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Délai avant envoi (heures)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={72}
                    value={business.auto_send_delay_hours}
                    onChange={(e) => setBusiness({ ...business, auto_send_delay_hours: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Méthode préférée</Label>
                  <Select value={business.send_method} onValueChange={(v) => setBusiness({ ...business, send_method: v as Business['send_method'] })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">📱 SMS uniquement</SelectItem>
                      <SelectItem value="email">✉️ Email uniquement</SelectItem>
                      <SelectItem value="both">📱✉️ SMS + Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
