import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // Récupérer la session de l'utilisateur
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Protéger les routes du dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Rediriger les utilisateurs connectés depuis les pages auth
  if (pathname.startsWith('/auth') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
