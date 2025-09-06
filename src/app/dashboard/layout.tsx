import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Dashboard - Quản lý bàn chơi',
  description:
    'Trang quản lý các bàn chơi game. Tạo bàn mới, tham gia bàn có sẵn, và quản lý điểm số của bạn.',
  openGraph: {
    title: 'Dashboard - BiaBip',
    description:
      'Trang quản lý các bàn chơi game. Tạo bàn mới, tham gia bàn có sẵn.'
  }
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* <AppSidebar /> */}
      <SidebarInset>
        <Header />
        {/* page main content */}
        {children}
        {/* page main content ends */}
      </SidebarInset>
    </SidebarProvider>
  );
}
