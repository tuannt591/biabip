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
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { setSession, updateUser } from '@/lib/auth';

export default function Page() {
  const { user, login } = useAuthStore();
  const [userName, setUserName] = useState('');
  const [tableName, setTableName] = useState('');
  const [tableId, setTableId] = useState('');
  const [isUpdating, startUpdateTransition] = useTransition();

  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    }
  }, [user]);

  const handleUpdateName = async () => {
    if (!user?.token) {
      toast.error('Authentication token not found.');
      return;
    }

    startUpdateTransition(async () => {
      try {
        await updateUser(userName, user.token);

        const updatedUser = { ...user, name: userName };
        login(updatedUser);
        setSession(updatedUser);
        toast.success('Name updated successfully!');
      } catch (error) {
        toast.error('Failed to update name. Please try again.');
      }
    });
  };

  const handleCreateTable = () => {
    // Logic to create table
    alert(`Creating table with name: ${tableName}`);
  };

  const handleJoinTable = () => {
    // Logic to join table
    alert(`Joining table with ID: ${tableId}`);
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6 p-4 md:mx-auto md:max-w-2xl'>
        <Heading
          title='Table Management'
          description='Manage your tables and profile'
        />
        <div className='flex flex-col gap-6'>
          {/* Update User Name Section */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Update Your Name</CardTitle>
              <CardDescription>
                Change your display name that will be shown to other players.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='userName'>Your Name</Label>
                <Input
                  id='userName'
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder='Enter your new name'
                />
              </div>
              <Button
                onClick={handleUpdateName}
                className='w-full'
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Name'}
              </Button>
            </CardContent>
          </Card>

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
                />
              </div>
              <Button onClick={handleCreateTable} className='w-full'>
                Create Table
              </Button>
            </CardContent>
          </Card>

          {/* Join Table Section */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle>Join an Existing Table</CardTitle>
              <CardDescription>
                Enter a table ID to join a game.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='tableId'>Table ID</Label>
                <Input
                  id='tableId'
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  placeholder='Enter the table ID'
                />
              </div>
              <Button onClick={handleJoinTable} className='w-full'>
                Join Table
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
