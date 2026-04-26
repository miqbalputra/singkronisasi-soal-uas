import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore admin and auth routes from PIN protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // If trying to access protected public routes without PIN
  const authPin = request.cookies.get('auth_pin')?.value

  if (pathname !== '/login-pin' && authPin !== 'verified') {
    return NextResponse.redirect(new URL('/login-pin', request.url))
  }

  // If already verified and trying to access login page
  if (pathname === '/login-pin' && authPin === 'verified') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
