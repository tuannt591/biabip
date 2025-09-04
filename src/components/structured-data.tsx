'use client';

import { usePathname } from 'next/navigation';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteStructuredData() {
  const baseUrl = 'https://biabip.vercel.app';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'BiaBip',
    description: 'Ứng dụng quản lý điểm số game bàn hiện đại',
    url: baseUrl,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'VND'
    },
    featureList: [
      'Tạo bàn chơi mới',
      'Tham gia bàn qua QR code',
      'Chuyển điểm giữa người chơi',
      'Theo dõi lịch sử giao dịch',
      'Giao diện đa ngôn ngữ'
    ],
    screenshot: `${baseUrl}/screenshot.png`,
    author: {
      '@type': 'Organization',
      name: 'BiaBip Team'
    }
  };

  return <JsonLd data={structuredData} />;
}

export function BreadcrumbStructuredData() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter((segment) => segment);
  const baseUrl = 'https://biabip.vercel.app';

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: baseUrl
      },
      ...pathSegments.map((segment, index) => {
        const url = `${baseUrl}/${pathSegments.slice(0, index + 1).join('/')}`;
        const names: Record<string, string> = {
          dashboard: 'Dashboard',
          table: 'Quản lý bàn',
          login: 'Đăng nhập',
          join: 'Tham gia bàn'
        };

        return {
          '@type': 'ListItem',
          position: index + 2,
          name: names[segment] || segment,
          item: url
        };
      })
    ]
  };

  return <JsonLd data={breadcrumbList} />;
}
