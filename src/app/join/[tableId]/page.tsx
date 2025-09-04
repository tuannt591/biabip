'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { joinTable } from '@/lib/auth';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconLoader2 } from '@tabler/icons-react';

export default function JoinTablePage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const { t } = useLanguage();
  const tableId = params.tableId as string;

  useEffect(() => {
    if (!tableId) {
      toast.error(t('messages.tableIdCannotBeEmpty'));
      router.push('/dashboard');
      return;
    }

    if (!isLoggedIn) {
      // Redirect to login with callback URL to return to join page after login
      const callbackUrl = encodeURIComponent(`/join/${tableId}`);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      return;
    }

    // User is logged in, try to join the table
    const handleJoinTable = async () => {
      if (!user?.token || !user?.id) {
        toast.error(t('messages.userInfoMissing'));
        router.push('/dashboard');
        return;
      }

      try {
        await joinTable(tableId, user.id, user.token);
        toast.success(t('messages.successfullyJoinedTable'));
        router.push(`/dashboard/table/${tableId}`);
      } catch (error) {
        toast.error(t('messages.failedToJoinTable'));
        router.push('/dashboard');
      }
    };

    handleJoinTable();
  }, [tableId, isLoggedIn, user, router, t]);

  // Show loading while processing
  return (
    <div className='relative flex h-screen items-center justify-center p-4'>
      <Card className='mx-auto w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='flex items-center justify-center gap-2 text-xl'>
            <IconLoader2 className='h-5 w-5 animate-spin' />
            {t('common.loading') || 'Đang tải...'}
          </CardTitle>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-muted-foreground'>
            {isLoggedIn
              ? t('messages.joiningTable') || 'Đang tham gia bàn...'
              : t('messages.redirectingToLogin') ||
                'Đang chuyển hướng đến trang đăng nhập...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
