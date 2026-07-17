import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const PROTECTED  = ['/dashboard', '/admin']
const ADMIN_ONLY = ['/admin']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const needsAuth  = PROTECTED.some(p => pathname.startsWith(p))
  const needsAdmin = ADMIN_ONLY.some(p => pathname.startsWith(p))

  if (!needsAuth) return NextResponse.next()

  // ── MOCK MODE: check cookie set at mock login ──────────────────
  const mockRole = request.cookies.get('insee_mock_role')?.value
  if (mockRole) {
    if (needsAdmin && mockRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // ── REAL MODE: use @supabase/ssr to read session from cookies ──
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Must create a mutable response so SSR client can refresh cookies
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        // Refresh cookie on both request and response
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        request.cookies.set({ name, value: '', ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      const url = new URL('/login', request.url)
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }

    if (needsAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return response

  } catch {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
