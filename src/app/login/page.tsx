import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';
export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Đăng nhập - BiaBip',
  description:
    'Đăng nhập vào BiaBip để bắt đầu chơi game và quản lý điểm số. Sử dụng số điện thoại để đăng nhập nhanh chóng và an toàn.',
  openGraph: {
    title: 'Đăng nhập - BiaBip',
    description: 'Đăng nhập vào BiaBip để bắt đầu chơi game và quản lý điểm số.'
  },
  robots: {
    index: false,
    follow: true
  }
};

export default async function Page() {
  return <SignInViewPage />;
}
