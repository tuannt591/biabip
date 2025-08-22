import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Danh sách các route cần bảo vệ
  const protectedRoutes = ['/', '/profile', '/dashboard']; // Thêm các route cần bảo vệ
  const { pathname } = request.nextUrl;

  // Nếu đang ở trang login thì cho phép truy cập
  if (pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Kiểm tra trạng thái đăng nhập từ cookie
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';

  // Nếu truy cập route cần bảo vệ mà chưa đăng nhập thì chuyển hướng về /login
  if (
    protectedRoutes.some((route) => pathname === route || pathname.startsWith(route + '/')) &&
    !isLoggedIn
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Cho phép truy cập các route khác
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/profile', '/dashboard/:path*'], // Thêm các route cần bảo vệ
};
