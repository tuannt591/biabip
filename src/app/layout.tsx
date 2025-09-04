import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/lib/font';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import {
  WebsiteStructuredData,
  BreadcrumbStructuredData
} from '@/components/structured-data';
import './globals.css';
import './theme.css';

export const metadata: Metadata = {
  title: {
    default: 'BiaBip - Quản lý điểm game bàn',
    template: '%s | BiaBip'
  },
  description:
    'Ứng dụng quản lý điểm số game bàn hiện đại. Tạo bàn chơi, mời bạn bè qua QR code, chuyển điểm dễ dàng và theo dõi lịch sử chi tiết.',
  keywords: [
    'game bàn',
    'quản lý điểm',
    'QR code',
    'chuyển điểm',
    'lịch sử game',
    'tiến lên',
    'phỏm',
    'tứ sắc'
  ],
  authors: [{ name: 'BiaBip Team' }],
  creator: 'BiaBip',
  publisher: 'BiaBip',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  metadataBase: new URL('https://biabip.vercel.app'),
  openGraph: {
    title: 'BiaBip - Quản lý điểm game bàn',
    description:
      'Ứng dụng quản lý điểm số game bàn hiện đại. Tạo bàn chơi, mời bạn bè qua QR code, chuyển điểm dễ dàng.',
    type: 'website',
    locale: 'vi_VN',
    alternateLocale: ['en_US'],
    siteName: 'BiaBip'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BiaBip - Quản lý điểm game bàn',
    description:
      'Ứng dụng quản lý điểm số game bàn hiện đại. Tạo bàn chơi, mời bạn bè qua QR code.',
    creator: '@biabip'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ]
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isScaled = activeThemeValue?.endsWith('-scaled');

  return (
    <html suppressHydrationWarning>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <link rel='manifest' href='/manifest.json' />
        <meta name='application-name' content='BiaBip' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='BiaBip' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='theme-color' content='#ffffff' />
      </head>
      <body
        className={cn(
          'bg-background overflow-hidden overscroll-none font-sans antialiased',
          activeThemeValue ? `theme-${activeThemeValue}` : '',
          isScaled ? 'theme-scaled' : '',
          fontVariables
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={activeThemeValue as string}>
              <WebsiteStructuredData />
              <BreadcrumbStructuredData />
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
