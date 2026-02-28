"use client"
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast'
import { BUSINESS_TYPES } from '@/lib/constants'

export default function RegisterPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptCGU, setAcceptCGU] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptCGU) {
      toast({ title: 'CGU requises', description: 'Veuillez accepter les conditions générales', variant: 'destructive' })
      return
    }
    if (password.length < 8) {
      toast({ title: 'Mot de passe trop court', description: 'Minimum 8 caractères', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      
      // Créer le compte
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { business_name: businessName, business_type: businessType },
        },
      })

      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
        return
      }

      if (data.user) {
        // Créer le profil business
        await supabase.from('businesses').insert({
          user_id: data.user.id,
          name: businessName,
          email,
          business_type: businessType || 'autre',
        })

        toast({ title: 'Compte créé ! 🎉', description: 'Bienvenue sur ProReview !', variant: 'default' })
        router.push('/dashboard')
      }
    } catch {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-violet-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="gradient-text text-2xl">ProReview</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Créer mon compte gratuit</CardTitle>
            <CardDescription>14 jours d'essai · Aucune carte requise</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="businessName">Nom de votre commerce</Label>
                <Input
                  id="businessName"
                  placeholder="Ex : Restaurant Le Soleil"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="businessType">Type de commerce</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email">Email professionnel</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@commerce.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="cgu"
                  checked={acceptCGU}
                  onChange={(e) => setAcceptCGU(e.target.checked)}
                  className="mt-1 rounded"
                />
                <label htmlFor="cgu" className="text-sm text-gray-600">
                  J'accepte les{' '}
                  <a href="#" className="text-blue-600 hover:underline">conditions générales d'utilisation</a>
                  {' '}et la{' '}
                  <a href="#" className="text-blue-600 hover:underline">politique de confidentialité</a>
                </label>
              </div>

              <Button variant="gradient" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Créer mon compte gratuit 🚀
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              Déjà un compte ?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                Se connecter
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
