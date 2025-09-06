'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconTrophy, IconCoins } from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'next/navigation';
import { getPlayerHistory, getBatchUsers } from '@/lib/auth';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
export const runtime = 'edge';

interface PlayerHistory {
  tableId: string;
  tableName: string;
  joinedAt: string;
  currentPoints: number;
  createdAt: string;
  creatorId: string;
  isCreator: boolean;
}

export default function HistoryPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { t } = useLanguage();
  const [history, setHistory] = useState<PlayerHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = user.id || user.user_id;
      const token = user.token;

      try {
        setLoading(true);

        const apiData = await getPlayerHistory(userId, token);
        setHistory(apiData || []);

        // Fetch user names for creators
        if (apiData && apiData.length > 0) {
          const creatorIds = Array.from(
            new Set(apiData.map((item: PlayerHistory) => item.creatorId))
          ) as string[];
          try {
            const usersData = await getBatchUsers(creatorIds, token);
            const namesMap: { [key: string]: string } = {};
            usersData.data.forEach((user: any) => {
              namesMap[user.id] = user.name || user.phone || 'Unknown';
            });
            setUserNames(namesMap);
          } catch (err) {}
        }
      } catch (err) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

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

          <Heading
            title={t('history.title')}
            description={t('history.description')}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className='space-y-4'>
            {[...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className='h-4 w-[250px]' />
                  <Skeleton className='h-4 w-[200px]' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-4 w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* History Data Display */}
        {!loading && (
          <div className='space-y-4'>
            {history.length === 0 ? (
              <Card>
                <CardContent className='flex items-center justify-center py-8'>
                  <p className='text-muted-foreground'>
                    {t('history.noHistory')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Stats */}
                <div className='mb-6 grid grid-cols-2 gap-2'>
                  <Card>
                    <CardContent className='flex h-full flex-col items-center justify-center gap-3 px-2'>
                      <div className='flex items-center gap-2'>
                        <IconTrophy className='h-4 w-4 text-yellow-500' />
                        <p className='text-muted-foreground text-sm'>
                          {t('history.totalTables')}
                        </p>
                      </div>
                      <p className='text-center text-xl font-bold'>
                        {history.length}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className='flex h-full flex-col items-center justify-center gap-3 px-2'>
                      <div className='flex items-center gap-2'>
                        <IconCoins className='h-4 w-4 text-green-500 md:h-5 md:w-5' />
                        <p className='text-muted-foreground text-sm'>
                          {t('history.totalPoints')}
                        </p>
                      </div>
                      <p className='text-center text-xl font-bold'>
                        {history
                          .reduce((sum, h) => sum + h.currentPoints, 0)
                          .toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* History List */}
                <div className='space-y-3'>
                  {history.map((item, index) => (
                    <Card
                      key={item.tableId}
                      className='group hover:border-primary/50 hover:bg-accent/20 cursor-pointer border-2 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg'
                      onClick={() =>
                        router.push(`/dashboard/table/${item.tableId}`)
                      }
                    >
                      <CardContent className='relative'>
                        {/* Header */}
                        <div className='mb-3 flex items-start justify-between'>
                          <div className='flex min-w-0 flex-1 items-center gap-2'>
                            <h4 className='group-hover:text-primary truncate text-lg font-semibold transition-colors'>
                              {item.tableName}
                            </h4>
                            {/* Click indicator */}
                            <div className='opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                              <IconArrowLeft className='text-primary h-4 w-4 rotate-180' />
                            </div>
                          </div>
                          <Badge
                            variant={
                              item.currentPoints > 0
                                ? 'default'
                                : item.currentPoints < 0
                                  ? 'destructive'
                                  : 'outline'
                            }
                            className='text-md font-mono transition-shadow group-hover:shadow-md'
                          >
                            {item.currentPoints > 0 ? '+' : ''}
                            {item.currentPoints.toLocaleString()}
                          </Badge>
                        </div>

                        {/* Details */}
                        <div className='space-y-2 text-sm'>
                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>
                              {t('history.creator')}:
                            </span>
                            <span className='font-medium'>
                              {item.isCreator
                                ? t('history.you')
                                : userNames[item.creatorId] || 'Loading...'}
                            </span>
                          </div>

                          <div className='flex items-center justify-between'>
                            <span className='text-muted-foreground'>
                              {t('history.tableCreatedDate')}:
                            </span>
                            <span className='font-medium'>
                              {new Date(item.createdAt).toLocaleTimeString(
                                'vi-VN'
                              )}
                              ,{' '}
                              {new Date(item.createdAt).toLocaleDateString(
                                'vi-VN'
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
