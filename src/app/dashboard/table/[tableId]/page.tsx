'use client';
export const runtime = 'edge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useEffect, useState, useTransition, useCallback } from 'react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { useLanguage } from '@/contexts/LanguageContext';

// Loading component for table info
function TableInfoSkeleton() {
  return <Skeleton className='h-8 w-48' />;
}

// Loading component for players table
function PlayersTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className='h-4 w-16' />
          </TableHead>
          <TableHead className='text-center'>
            <Skeleton className='mx-auto h-4 w-12' />
          </TableHead>
          <TableHead className='text-center'>
            <Skeleton className='mx-auto h-4 w-16' />
          </TableHead>
          <TableHead className='text-center'>
            <Skeleton className='mx-auto h-4 w-14' />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(3)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className='flex items-center gap-1'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-8 w-8 rounded' />
              </div>
            </TableCell>
            <TableCell className='text-center'>
              <Skeleton className='mx-auto h-4 w-8' />
            </TableCell>
            <TableCell className='text-center'>
              <Skeleton className='mx-auto h-8 w-8 rounded' />
            </TableCell>
            <TableCell className='text-center'>
              <Skeleton className='mx-auto h-8 w-8 rounded' />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { user, updateUser: updateUserInStore } = useAuthStore();
  const { t } = useLanguage();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editingPlayerName, setEditingPlayerName] = useState('');
  const [isUpdating, startUpdateTransition] = useTransition();
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, startTransferTransition] = useTransition();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [tableHistory, setTableHistory] = useState<any[]>([]);
  const [selectedPlayerForHistory, setSelectedPlayerForHistory] =
    useState<any>(null);
  const [allTableHistory, setAllTableHistory] = useState<any[]>([]);
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [playersInfo, setPlayersInfo] = useState<any[]>([]);
  const [loadingTableInfo, setLoadingTableInfo] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const fetchTableDataById = useCallback(async () => {
    if (user?.token && params.tableId) {
      try {
        setLoadingTableInfo(true);
        setLoadingPlayers(true);
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

          setPlayersInfo(enrichedPlayers);
          setTableInfo({ name: tableData.name, id: tableData.id });

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
          setTableInfo({ name: tableData.name, id: tableData.id });
          setPlayersInfo([]);
          setAllTableHistory([]);
        }
      } catch (error) {
        setAllTableHistory([]);
      } finally {
        setLoadingPlayers(false);
        setLoadingTableInfo(false);
      }
    }
  }, [user?.token, params.tableId]);

  const fetchPlayers = useCallback(async () => {
    if (user?.token && params.tableId) {
      try {
        setLoadingPlayers(true);
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

          setPlayersInfo(enrichedPlayers);

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
          setPlayersInfo([]);
          setAllTableHistory([]);
        }
      } catch (error) {
        setAllTableHistory([]);
      } finally {
        setLoadingPlayers(false);
      }
    }
  }, [user?.token, params.tableId]);

  useEffect(() => {
    fetchTableDataById();
  }, [fetchTableDataById]);

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
        if (editingPlayer.id === user?.id) {
          updateUserInStore({ name: editingPlayerName });
        }

        fetchPlayers(); // Refresh players
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
        fetchPlayers(); // Refresh players
      } catch (error) {
        toast.error(t('messages.failedToTransferPoints'));
      }
    });
  };

  const handleCopyTableId = async () => {
    try {
      await navigator.clipboard.writeText(tableInfo?.id);
      toast.success(t('messages.tableIdCopied'));
    } catch (error) {
      toast.error(t('messages.failedToCopyTableId'));
    }
  };

  const handleShowQrCode = async () => {
    try {
      const joinUrl = `${window.location.origin}/join/${tableInfo?.id}`;
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
    fetchPlayers();
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

  if (!tableInfo && !loadingTableInfo) {
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
          {loadingTableInfo ? (
            <TableInfoSkeleton />
          ) : (
            <Heading title={tableInfo.name} description={''} />
          )}
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
            {loadingPlayers ? (
              <PlayersTableSkeleton />
            ) : (
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
                  {playersInfo.map((player: any) => (
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
                                <DialogTitle className='text-left'>
                                  {t('table.transferTo', {
                                    name: selectedPlayer?.name
                                  })}
                                </DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div className='space-y-2'>
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
            )}
          </CardContent>
        </Card>

        {/* Edit Name Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='text-left'>
                {t('table.editName')}
              </DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Input
                  id='name'
                  value={editingPlayerName}
                  onChange={(e) => setEditingPlayerName(e.target.value)}
                  placeholder={t('table.enterName')}
                />
              </div>
            </div>
            <DialogFooter className='flex-row gap-2'>
              <Button
                onClick={handleUpdatePlayerName}
                disabled={isUpdating}
                className='flex-1'
              >
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
                <span className='font-medium'>{tableInfo?.name}</span>
              </p>
              <p className='text-muted-foreground text-xs'>
                ID: {tableInfo?.id}
              </p>
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
            disabled={loadingPlayers}
            className='flex items-center gap-2'
          >
            <IconRefresh
              className={`h-4 w-4 ${loadingPlayers ? 'animate-spin' : ''}`}
            />
            {loadingPlayers ? t('common.loading') : t('common.refresh')}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
