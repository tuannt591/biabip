'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  getBatchUsers,
  getTableById,
  transferPoints,
  updateUser,
  getTableHistory
} from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import {
  IconPencil,
  IconArrowRight,
  IconCopy,
  IconQrcode,
  IconUsers,
  IconArrowLeft,
  IconRefresh,
  IconHistory
} from '@tabler/icons-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { user, login } = useAuthStore();
  const { t } = useLanguage();
  const [table, setTable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');
  const [isUpdating, startUpdateTransition] = useTransition();
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, startTransferTransition] = useTransition();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [tableHistory, setTableHistory] = useState<any[]>([]);
  const [selectedPlayerForHistory, setSelectedPlayerForHistory] =
    useState<any>(null);
  const [allTableHistory, setAllTableHistory] = useState<any[]>([]);

  const fetchTableAndPlayers = async () => {
    if (user?.token && params.tableId) {
      try {
        setLoading(true);
        const [tableData, historyData] = await Promise.all([
          getTableById(params.tableId as string, user.token),
          getTableHistory(params.tableId as string, user.token)
        ]);

        if (tableData?.players?.length > 0) {
          const playerIds = tableData.players.map((p: any) => p.id);
          const batchUsersResponse = await getBatchUsers(playerIds, user.token);
          const usersFromBatch = batchUsersResponse.data || [];

          const enrichedPlayers = tableData.players.map((player: any) => {
            const userInfo = usersFromBatch.find(
              (u: any) => u.id === player.id
            );
            return { ...player, ...userInfo };
          });

          setTable({ ...tableData, players: enrichedPlayers });

          // Enrich history with player names
          const enrichedHistory = (historyData || []).map(
            (transaction: any) => {
              const fromPlayer = enrichedPlayers.find(
                (p: any) => p.id === transaction.fromPlayerId
              );
              const toPlayer = enrichedPlayers.find(
                (p: any) => p.id === transaction.toPlayerId
              );

              return {
                ...transaction,
                fromPlayerName:
                  fromPlayer?.name || transaction.fromPlayerName || 'Unknown',
                toPlayerName:
                  toPlayer?.name || transaction.toPlayerName || 'Unknown'
              };
            }
          );

          // Sort by newest first (descending order)
          const sortedHistory = enrichedHistory.sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || a.timestamp);
            const dateB = new Date(b.createdAt || b.timestamp);
            return dateB.getTime() - dateA.getTime();
          });

          setAllTableHistory(sortedHistory);
        } else {
          setTable(tableData);
          setAllTableHistory([]);
        }
      } catch (error) {
        console.error('Failed to fetch table or players', error);
        setAllTableHistory([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchTableAndPlayers();
    } else {
      setLoading(false);
    }
  }, [user, params.tableId]);

  const handleEditClick = (player: any) => {
    setEditingPlayer(player);
    setEditingPlayerName(player.name);
    setEditDialogOpen(true);
  };

  const handleUpdatePlayerName = async () => {
    if (!editingPlayer) return;

    startUpdateTransition(async () => {
      try {
        await updateUser(editingPlayerName, user?.token);
        toast.success(t('messages.nameUpdatedSuccessfully'));

        const updatedPlayers = table.players.map((p: any) =>
          p.id === editingPlayer.id ? { ...p, name: editingPlayerName } : p
        );
        setTable({ ...table, players: updatedPlayers });

        if (editingPlayer.id === user?.id) {
          login({ ...user, name: editingPlayerName });
        }

        setEditDialogOpen(false);
        setEditingPlayer(null);
      } catch (error) {
        toast.error(t('messages.failedToUpdateName'));
      }
    });
  };

  const handleTransfer = async () => {
    if (!selectedPlayer || !transferAmount) {
      toast.error(t('messages.pleaseSelectPlayerAndAmount'));
      return;
    }

    startTransferTransition(async () => {
      try {
        await transferPoints(
          params.tableId as string,
          user?.id,
          selectedPlayer.id,
          Number(transferAmount),
          user?.token
        );
        toast.success(t('messages.pointsTransferredSuccessfully'));
        setSelectedPlayer(null);
        setTransferAmount('');
        fetchTableAndPlayers(); // Refresh data
      } catch (error) {
        toast.error(t('messages.failedToTransferPoints'));
      }
    });
  };

  const handleCopyTableId = async () => {
    try {
      await navigator.clipboard.writeText(table.id);
      toast.success(t('messages.tableIdCopied'));
    } catch (error) {
      toast.error(t('messages.failedToCopyTableId'));
    }
  };

  const handleShowQrCode = async () => {
    try {
      const joinUrl = `${window.location.origin}/join/${table.id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
      setQrDialogOpen(true);
    } catch (error) {
      toast.error(t('messages.failedToGenerateQrCode'));
    }
  };

  const handleRefresh = () => {
    startRefreshTransition(() => {
      window.location.reload();
    });
  };

  const handleViewHistory = async (player: any) => {
    setSelectedPlayerForHistory(player);
    setHistoryDialogOpen(true);

    // Filter history from cached data to show only transactions related to selected player
    const filteredHistory = allTableHistory.filter(
      (transaction: any) =>
        transaction.fromPlayerId === player.id ||
        transaction.toPlayerId === player.id
    );

    setTableHistory(filteredHistory);
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString();
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div>{t('common.loading')}</div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div>{t('common.loading')}</div>
      </PageContainer>
    );
  }

  if (!table) {
    return (
      <PageContainer>
        <div>{t('table.tableNotFound')}</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-6'>
        <div className='flex items-center gap-3'>
          {/* Back Button */}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => router.push('/dashboard/table')}
          >
            <IconArrowLeft className='h-4 w-4' />
          </Button>

          <Heading title={table.name} description={''} />
        </div>

        {/* Invite Players Section */}
        <Card className='py-4'>
          <CardContent className='px-4'>
            <div className='mb-4 flex items-center gap-3'>
              <IconUsers className='h-5 w-5 text-blue-600' />
              <h3 className='text-lg font-semibold'>
                {t('table.invitePlayers')}
              </h3>
            </div>
            <p className='text-muted-foreground mb-4 text-sm'>
              {t('table.inviteDescription')}
            </p>
            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={handleCopyTableId}
                className='flex flex-1 items-center justify-center gap-2'
              >
                <IconCopy className='h-4 w-4' />
                <span className='hidden sm:inline'>
                  {t('table.copyTableId')}
                </span>
                <span className='sm:hidden'>Copy ID</span>
              </Button>
              <Button
                variant='outline'
                onClick={handleShowQrCode}
                className='flex flex-1 items-center justify-center gap-2'
              >
                <IconQrcode className='h-4 w-4' />
                <span className='hidden sm:inline'>
                  {t('table.showQrCode')}
                </span>
                <span className='sm:hidden'>QR Code</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className='py-2'>
          <CardContent className='px-2'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.player')}</TableHead>
                  <TableHead className='text-center'>
                    {t('table.point')}
                  </TableHead>
                  <TableHead className='text-center'>
                    {t('table.transfer')}
                  </TableHead>
                  <TableHead className='text-center'>
                    {t('table.history')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.players.map((player: any) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className='flex items-center gap-1'>
                        <span className='font-medium'>{player.name}</span>
                        {user?.id === player.id && (
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEditClick(player)}
                          >
                            <IconPencil className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className='text-center'>
                      <span
                        className={`font-medium ${
                          (player.points || 0) > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {player.points || 0}
                      </span>
                    </TableCell>
                    <TableCell className='text-center'>
                      {user && player.id !== user.id && (
                        <Dialog
                          onOpenChange={(isOpen) => {
                            if (!isOpen) setSelectedPlayer(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => setSelectedPlayer(player)}
                            >
                              <IconArrowRight className='h-4 w-4 text-blue-600' />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {t('table.transferPoints')}
                              </DialogTitle>
                              <DialogDescription>
                                {t('table.transferTo', {
                                  name: selectedPlayer?.name
                                })}
                              </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4 py-4'>
                              <div className='space-y-2'>
                                <Label htmlFor='amount'>
                                  {t('table.amount')}
                                </Label>
                                <Input
                                  id='amount'
                                  type='number'
                                  inputMode='numeric'
                                  pattern='[0-9]*'
                                  value={transferAmount}
                                  onChange={(e) =>
                                    setTransferAmount(e.target.value)
                                  }
                                  placeholder={t('table.enterAmount')}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleTransfer}
                                disabled={isTransferring}
                              >
                                {isTransferring
                                  ? t('table.transferring')
                                  : t('table.confirmTransfer')}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleViewHistory(player)}
                        title={t('table.pointHistory')}
                      >
                        <IconHistory className='h-4 w-4 text-gray-600' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Name Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('table.editName')}</DialogTitle>
              <DialogDescription>
                {t('table.updateDisplayName')}
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>{t('table.name')}</Label>
                <Input
                  id='name'
                  value={editingPlayerName}
                  onChange={(e) => setEditingPlayerName(e.target.value)}
                  placeholder={t('table.enterName')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setEditDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={handleUpdatePlayerName} disabled={isUpdating}>
                {isUpdating ? t('table.saving') : t('table.saveChanges')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <IconQrcode className='h-5 w-5' />
                {t('table.joinTableQrCode')}
              </DialogTitle>
              <DialogDescription>{t('table.scanQrCode')}</DialogDescription>
            </DialogHeader>
            <div className='flex justify-center py-6'>
              {qrCodeUrl && (
                <div className='rounded-lg border-2 border-gray-200 bg-white p-4'>
                  <Image
                    src={qrCodeUrl}
                    alt='Table QR Code'
                    width={256}
                    height={256}
                    className='h-64 w-64'
                  />
                </div>
              )}
            </div>
            <div className='space-y-2 text-center'>
              <p className='text-muted-foreground text-sm'>
                {t('table.title')}:{' '}
                <span className='font-medium'>{table.name}</span>
              </p>
              <p className='text-muted-foreground text-xs'>ID: {table.id}</p>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setQrDialogOpen(false)}
                className='w-full'
              >
                {t('common.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className='sm:max-w-4xl'>
            <DialogHeader>
              <DialogTitle className='flex flex-col items-start gap-1'>
                <div className='flex items-center gap-2'>
                  <IconHistory className='h-5 w-5' />
                  {t('table.pointHistory')}
                </div>
                <div className='text-muted-foreground text-base font-medium'>
                  {selectedPlayerForHistory?.name}
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className='max-h-96 overflow-y-auto'>
              {tableHistory.length > 0 ? (
                <div className='space-y-3'>
                  {tableHistory.map((transaction, index) => {
                    const isCurrentUserSender =
                      transaction.fromPlayerId === selectedPlayerForHistory?.id;
                    const isCurrentUserReceiver =
                      transaction.toPlayerId === selectedPlayerForHistory?.id;

                    return (
                      <div
                        key={index}
                        className='bg-card rounded-lg border p-3'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <div className='mb-1 flex items-center gap-2'>
                              <span className='text-sm font-medium'>
                                {transaction.fromPlayerName}
                              </span>
                              <span className='text-muted-foreground text-xs'>
                                →
                              </span>
                              <span className='text-sm font-medium'>
                                {transaction.toPlayerName}
                              </span>
                            </div>
                            <div className='text-muted-foreground text-xs'>
                              {formatDateTime(
                                transaction.createdAt || transaction.timestamp
                              )}
                            </div>
                          </div>
                          <div className='text-right'>
                            <div
                              className={`font-semibold ${
                                isCurrentUserSender
                                  ? 'text-red-600'
                                  : isCurrentUserReceiver
                                    ? 'text-green-600'
                                    : 'text-blue-600'
                              }`}
                            >
                              {isCurrentUserSender ? '-' : '+'}
                              {transaction.amount}
                            </div>
                            <div className='text-muted-foreground text-xs'>
                              {t('table.points')}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className='flex justify-center py-8'>
                  <div className='text-muted-foreground'>
                    {t('table.noHistory')}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Refresh Button - Bottom */}
        <div className='flex justify-center pt-4'>
          <Button
            variant='outline'
            onClick={handleRefresh}
            disabled={isRefreshing}
            className='flex items-center gap-2'
          >
            <IconRefresh
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? t('common.loading') : t('common.refresh')}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
