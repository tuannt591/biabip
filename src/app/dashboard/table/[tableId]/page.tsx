'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { getBatchUsers, getTableById } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const params = useParams();
  const { user } = useAuthStore();
  const [table, setTable] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTableAndPlayers = async () => {
      if (user?.token && params.tableId) {
        try {
          setLoading(true);
          const tableData = await getTableById(
            params.tableId as string,
            user.token
          );

          if (tableData?.players?.length > 0) {
            const playerIds = tableData.players.map((p: any) => p.id);
            const batchUsersResponse = await getBatchUsers(
              playerIds,
              user.token
            );
            const usersFromBatch = batchUsersResponse.data || [];

            const enrichedPlayers = tableData.players.map((player: any) => {
              const userInfo = usersFromBatch.find(
                (u: any) => u.id === player.id
              );
              return { ...player, username: userInfo?.name || player.id };
            });
            setTable({ ...tableData, players: enrichedPlayers });
          } else {
            setTable(tableData);
          }
        } catch (error) {
          console.error('Failed to fetch table or players', error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchTableAndPlayers();
    } else {
      setLoading(false);
    }
  }, [user, params.tableId]);

  if (loading) {
    return (
      <PageContainer>
        <div>Loading...</div>
      </PageContainer>
    );
  }

  if (!table) {
    return (
      <PageContainer>
        <div>Table not found or failed to load.</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-6'>
        <Heading title={table.name} description={`Table ID: ${table.id}`} />
        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-4'>
              {table.players.map((player: any) => (
                <li key={player.id} className='flex items-center'>
                  <span className='font-medium'>{player.username}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
