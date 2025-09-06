import type { Metadata } from 'next';

type Props = {
  params: Promise<{ tableId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tableId } = await params;

  return {
    title: `Tham gia bàn ${tableId}`,
    description: `Tham gia bàn chơi ${tableId}. Tự động xử lý và chuyển hướng đến bàn chơi sau khi tham gia thành công.`,
    openGraph: {
      title: `Tham gia bàn ${tableId} - BiaBip`,
      description: `Tham gia bàn chơi ${tableId} trên BiaBip.`
    },
    robots: {
      index: false,
      follow: false
    }
  };
}
export default function JoinTableLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
