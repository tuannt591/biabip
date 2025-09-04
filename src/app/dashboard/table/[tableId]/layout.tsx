import type { Metadata } from 'next';

type Props = {
  params: Promise<{ tableId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tableId } = await params;

  return {
    title: `Bàn chơi ${tableId}`,
    description: `Chi tiết bàn chơi ${tableId}. Xem danh sách người chơi, chuyển điểm, và theo dõi lịch sử giao dịch.`,
    openGraph: {
      title: `Bàn chơi ${tableId} - BiaBip`,
      description: `Chi tiết bàn chơi ${tableId}. Xem danh sách người chơi và chuyển điểm.`
    },
    robots: {
      index: false,
      follow: true
    }
  };
}
export default function TableDetailLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
