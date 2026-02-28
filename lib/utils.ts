import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utilitaire pour fusionner les classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Générer un code unique pour les demandes d'avis
export function generateUniqueCode(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Formater un nombre avec des séparateurs de milliers
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(num)
}

// Formater une date en français
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

// Formater une date avec l'heure
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Formater un montant en euros
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

// Remplacer les variables dans un template
export function interpolateTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match)
}

// Calculer le taux de conversion
export function calculateRate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 100)
}

// Obtenir les données des 30 derniers jours pour le graphique
export function getLast30DaysLabels(): string[] {
  const labels = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }))
  }
  return labels
}

// Vérifier si un email est valide
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Vérifier si un numéro de téléphone est valide
export function isValidPhone(phone: string): boolean {
  return /^(\+33|0)[1-9](\d{8})$/.test(phone.replace(/\s/g, ''))
}

// Normaliser un numéro de téléphone au format international
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s|-|\./g, '')
  if (cleaned.startsWith('0')) {
    return '+33' + cleaned.slice(1)
  }
  return cleaned
}

// Formater une date de manière relative (il y a X jours)
export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return formatDate(date)
}
