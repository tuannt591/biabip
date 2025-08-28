'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SimpleCamera from '@/components/simple-camera';
import { useAuthStore } from '@/stores/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconQrcode } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createTable, joinTable } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { user } = useAuthStore();
  const { t } = useLanguage();
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const [tableId, setTableId] = useState('');
  const [isCreating, startCreateTransition] = useTransition();
  const [isJoining, startJoinTransition] = useTransition();
  const [isScannerOpen, setScannerOpen] = useState(false);

  const handleCreateTable = async () => {
    if (!user?.token) {
      toast.error(t('messages.authTokenNotFound'));
      return;
    }
    if (!tableName) {
      toast.error(t('messages.tableNameCannotBeEmpty'));
      return;
    }

    startCreateTransition(async () => {
      try {
        const newTable = await createTable(tableName, user.token);
        toast.success(t('messages.tableCreatedSuccessfully'));
        router.push(`/dashboard/table/${newTable.id}`);
      } catch (error) {
        toast.error(t('messages.failedToCreateTable'));
      }
    });
  };

  const handleJoinTable = async () => {
    if (!user?.token || !user?.id) {
      toast.error(t('messages.userInfoMissing'));
      return;
    }
    if (!tableId) {
      toast.error(t('messages.tableIdCannotBeEmpty'));
      return;
    }

    startJoinTransition(async () => {
      try {
        await joinTable(tableId, user.id, user.token);
        toast.success(t('messages.successfullyJoinedTable'));
        router.push(`/dashboard/table/${tableId}`);
      } catch (error) {
        toast.error(t('messages.failedToJoinTable'));
      }
    });
  };

  const onCameraError = (error: string) => {
    toast.error(error);
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6 p-4 md:mx-auto md:max-w-2xl'>
        <Heading
          title={t('tableManagement.title')}
          description={t('tableManagement.description')}
        />
        <div className='flex flex-col gap-6'>
          {/* Create Table Section */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>{t('tableManagement.createNewTable')}</CardTitle>
              <CardDescription>
                {t('tableManagement.createDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='tableName'>
                  {t('tableManagement.tableName')}
                </Label>
                <Input
                  id='tableName'
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder={t('tableManagement.enterTableName')}
                  className='h-12'
                />
              </div>
              <Button
                onClick={handleCreateTable}
                className='h-12 w-full'
                disabled={isCreating}
              >
                {isCreating
                  ? t('tableManagement.creating')
                  : t('tableManagement.createTable')}
              </Button>
            </CardContent>
          </Card>

          {/* Join Table Section */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>{t('tableManagement.joinExistingTable')}</CardTitle>
              <CardDescription>
                {t('tableManagement.joinDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='tableId'>
                    {t('tableManagement.tableId')}
                  </Label>
                  <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='icon'
                        className='shrink-0'
                      >
                        <IconQrcode className='h-4 w-4' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-lg'>
                      <DialogHeader>
                        <DialogTitle className='flex items-center gap-2'>
                          <IconQrcode className='h-5 w-5 text-blue-600' />
                          {t('tableManagement.scanQrCode')}
                        </DialogTitle>
                      </DialogHeader>

                      {/* Hướng dẫn cho mobile */}
                      <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3'>
                        <p className='text-sm text-blue-800'>
                          📱 <strong>Lưu ý trên điện thoại:</strong>
                          <br />• Đảm bảo đã cấp quyền camera trong cài đặt
                          trình duyệt
                          <br />• Nếu không quét được, vui lòng nhập ID bàn thủ
                          công bên dưới
                        </p>
                      </div>

                      <div className='py-2'>
                        {isScannerOpen && (
                          <SimpleCamera onError={onCameraError} />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  id='tableId'
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  placeholder={t('tableManagement.enterTableId')}
                  className='h-12'
                />
              </div>
              <Button
                onClick={handleJoinTable}
                className='h-12 w-full'
                disabled={isJoining}
              >
                {isJoining
                  ? t('tableManagement.joining')
                  : t('tableManagement.joinTable')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
