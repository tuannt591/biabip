'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import UserAuthForm from './user-auth-form';

export default function SignInViewPage() {
  const { t } = useLanguage();

  return (
    <div className='relative flex min-h-screen justify-center p-4 pt-16 sm:pt-24'>
      <Card className='h-fit w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl'>{t('auth.login')}</CardTitle>
          <CardDescription>{t('auth.loginDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm />
        </CardContent>
      </Card>
    </div>
  );
}
