import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // السماح لجميع الصفحات بدون حماية مؤقتاً
  // لأن الحماية موجودة داخل الـ components
  return NextResponse.next();
}

export const config = {
  matcher: [],
};