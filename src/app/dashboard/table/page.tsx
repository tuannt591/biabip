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
import QrCodeScanner from '@/components/qr-code-scanner';
import { useAuthStore } from '@/stores/auth';
import { IconQrcode } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createTable, joinTable } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [tableName, setTableName] = useState('');
  const [tableId, setTableId] = useState('');
  const [isCreating, startCreateTransition] = useTransition();
  const [isJoining, startJoinTransition] = useTransition();
  const [isScannerOpen, setScannerOpen] = useState(false);

  const handleCreateTable = async () => {
    if (!user?.token) {
      toast.error('Authentication token not found.');
      return;
    }
    if (!tableName) {
      toast.error('Table name cannot be empty.');
      return;
    }

    startCreateTransition(async () => {
      try {
        const newTable = await createTable(tableName, user.token);
        toast.success('Table created successfully!');
        router.push(`/dashboard/table/${newTable.id}`);
      } catch (error) {
        toast.error('Failed to create table. Please try again.');
      }
    });
  };

  const handleJoinTable = async () => {
    if (!user?.token || !user?.id) {
      toast.error('User information is missing.');
      return;
    }
    if (!tableId) {
      toast.error('Table ID cannot be empty.');
      return;
    }

    startJoinTransition(async () => {
      try {
        await joinTable(tableId, user.id, user.token);
        toast.success('Successfully joined table!');
        router.push(`/dashboard/table/${tableId}`);
      } catch (error) {
        toast.error('Failed to join table. Please check the ID and try again.');
      }
    });
  };

  const onScanSuccess = (decodedText: string) => {
    setTableId(decodedText);
    setScannerOpen(false);
    toast.success('QR code scanned successfully!');
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6 p-4 md:mx-auto md:max-w-2xl'>
        <Heading
          title='Table Management'
          description='Manage your tables and profile'
        />
        <div className='flex flex-col gap-6'>
          {/* Create Table Section */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Create a New Table</CardTitle>
              <CardDescription>
                Start a new table and invite your friends to join.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='tableName'>Table Name</Label>
                <Input
                  id='tableName'
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder='Enter a name for your table'
                  className='h-12'
                />
              </div>
              <Button
                onClick={handleCreateTable}
                className='h-12 w-full'
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Table'}
              </Button>
            </CardContent>
          </Card>

          {/* Join Table Section */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Join an Existing Table</CardTitle>
              <CardDescription>
                Enter a table ID or scan a QR code to join a game.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='tableId'>Table ID</Label>
                  <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
                    <DialogTrigger asChild>
                      <Button variant='outline' size='icon'>
                        <IconQrcode className='h-4 w-4' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Scan QR Code</DialogTitle>
                      </DialogHeader>
                      <QrCodeScanner onScanSuccess={onScanSuccess} />
                    </DialogContent>
                  </Dialog>
                </div>
                <Input
                  id='tableId'
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  placeholder='Enter the table ID'
                  className='h-12'
                />
              </div>
              <Button
                onClick={handleJoinTable}
                className='h-12 w-full'
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Table'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
