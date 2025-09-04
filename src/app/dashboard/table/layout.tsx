import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quản lý bàn chơi',
  description:
    'Tạo bàn chơi mới hoặc tham gia bàn có sẵn. Quét QR code hoặc nhập ID bàn để tham gia nhanh chóng.',
  openGraph: {
    title: 'Quản lý bàn chơi - BiaBip',
    description:
      'Tạo bàn chơi mới hoặc tham gia bàn có sẵn. Quét QR code để tham gia nhanh chóng.'
  }
};

export default function TableLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
