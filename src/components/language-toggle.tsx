'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconLanguage } from '@tabler/icons-react';

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <IconLanguage className='h-[1.2rem] w-[1.2rem]' />
          <span className='sr-only'>Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setLocale('vi')}>
          <span className={`mr-2 ${locale === 'vi' ? 'font-bold' : ''}`}>
            🇻🇳 Tiếng Việt
          </span>
          {locale === 'vi' && <span className='ml-auto'>✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('en')}>
          <span className={`mr-2 ${locale === 'en' ? 'font-bold' : ''}`}>
            🇺🇸 English
          </span>
          {locale === 'en' && <span className='ml-auto'>✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
