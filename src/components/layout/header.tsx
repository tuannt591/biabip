'use client';
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ModeToggle } from './ThemeToggle/theme-toggle';
import { LanguageToggle } from '../language-toggle';
import { useAuthStore } from '@/stores/auth';
import { IconLogout } from '@tabler/icons-react';
import Link from 'next/link';

export default function Header() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutDialog(false);
  };

  return (
    <>
      <header className='bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
        {/* Left side - Theme and Language toggles */}
        <div className='flex items-center gap-2 px-6'>
          <LanguageToggle />
          <ModeToggle />
        </div>

        {/* Right side - User info and logout */}
        <div className='flex items-center gap-4 px-6'>
          {isLoggedIn ? (
            <>
              {/* User Info */}
              <div className='bg-muted/50 hover:bg-muted/80 flex items-center gap-3 rounded-full px-3 py-1.5 transition-colors'>
                <Avatar className='ring-background h-7 w-7 ring-2'>
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className='text-xs font-semibold'>
                    {user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className='text-foreground/90 text-sm font-medium'>
                  {user?.name}
                </span>
              </div>

              {/* Logout Button */}
              <Button
                variant='outline'
                size='icon'
                onClick={() => setShowLogoutDialog(true)}
                className='border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground h-8 w-8 transition-all duration-200'
              >
                <IconLogout className='h-[1.1rem] w-[1.1rem]' />
                <span className='sr-only'>Logout</span>
              </Button>
            </>
          ) : (
            <Link href='/login'>
              <Button variant='outline' className='font-medium'>
                Log in
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader className='text-center'>
            <DialogTitle className='text-xl font-semibold'>
              Xác nhận đăng xuất
            </DialogTitle>
            <DialogDescription className='text-muted-foreground mt-2'>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='mt-6 flex flex-row justify-center gap-3'>
            <Button
              variant='outline'
              onClick={() => setShowLogoutDialog(false)}
              className='max-w-28 flex-1 font-medium'
            >
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={handleLogout}
              className='max-w-28 flex-1 font-medium shadow-md transition-shadow hover:shadow-lg'
            >
              Đăng xuất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
