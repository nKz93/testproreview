"use client"
import { useState, useEffect, useCallback } from 'react'
import { Search, Send, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import AddCustomerModal from '@/components/dashboard/AddCustomerModal'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import type { Customer, Business } from '@/types'

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  clicked: 'bg-violet-100 text-violet-700',
  reviewed: 'bg-green-100 text-green-700',
  feedback: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  sent: 'Envoyé',
  clicked: 'Cliqué',
  reviewed: 'Avis Google ⭐',
  feedback: 'Feedback privé',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
    setBusiness(biz)

    if (biz) {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false })
      setCustomers(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSendRequest = async (customerId: string) => {
    if (!business) return
    setSending(customerId)
    try {
      const customer = customers.find(c => c.id === customerId)
      if (!customer) return

      // Créer une demande d'avis
      const supabase = createClient()
      const code = Math.random().toString(36).substring(2, 14).toUpperCase()
      
      await supabase.from('review_requests').insert({
        business_id: business.id,
        customer_id: customerId,
        unique_code: code,
        method: business.send_method === 'both' ? 'sms' : business.send_method,
        status: 'pending',
      })

      // Envoyer via API
      const method = customer.phone ? 'sms' : 'email'
      const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/review/${code}`
      
      if (method === 'sms' && customer.phone) {
        const message = business.sms_template
          .replace('{name}', customer.name)
          .replace('{business}', business.name)
          .replace('{link}', reviewUrl)
        
        await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: customer.phone, message, requestCode: code }),
        })
      }

      toast({ title: 'Demande envoyée ✅', description: `SMS envoyé à ${customer.name}` })
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'envoyer la demande', variant: 'destructive' })
    } finally {
      setSending(null)
    }
  }

  const handleDelete = async (customerId: string) => {
    const supabase = createClient()
    await supabase.from('customers').delete().eq('id', customerId)
    setCustomers(prev => prev.filter(c => c.id !== customerId))
    toast({ title: 'Client supprimé' })
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm">{customers.length} clients au total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Importer CSV
          </Button>
          {business && (
            <AddCustomerModal businessId={business.id} onSuccess={fetchData} />
          )}
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-medium">Aucun client trouvé</p>
              <p className="text-sm mt-1">Ajoutez votre premier client pour commencer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Nom</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Téléphone</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Email</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Date visite</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                        {customer.phone || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                        {customer.email || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                        {formatDate(customer.visit_date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => handleSendRequest(customer.id)}
                            disabled={sending === customer.id}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            {sending === customer.id ? 'Envoi...' : 'Envoyer'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(customer.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
