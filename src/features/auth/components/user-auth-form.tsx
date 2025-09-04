'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOtp } from '@/lib/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import OtpForm from './otp-form';

const phoneRegex = new RegExp(
  /^(\+?84|0)?(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5,9]|89|9[0-9])[0-9]{7}$/
);

const formatPhoneNumber = (phone: string): string => {
  if (phone.startsWith('+84')) {
    return phone.substring(1);
  }
  if (phone.startsWith('84')) {
    return phone;
  }
  if (phone.startsWith('0')) {
    return `84${phone.substring(1)}`;
  }
  return `84${phone}`;
};

export default function UserAuthForm() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const [phone, setPhone] = useState('');

  const formSchema = z.object({
    phone: z.string().regex(phoneRegex, t('auth.invalidPhoneNumber'))
  });

  type UserFormValue = z.infer<typeof formSchema>;

  const defaultValues = {
    phone: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onChange'
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        const formattedPhone = formatPhoneNumber(data.phone);
        await getOtp(formattedPhone);
        setPhone(formattedPhone);
        toast.success(t('auth.otpSent'));
      } catch (error) {
        toast.error(t('auth.failedToSendOtp'));
      }
    });
  };

  return (
    <>
      {phone ? (
        <OtpForm phone={phone} />
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='w-full space-y-4'
          >
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.phoneNumber')}</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                        <span className='text-muted-foreground text-lg'>
                          +84
                        </span>
                      </div>
                      <Input
                        type='tel'
                        placeholder={t('auth.phonePlaceholder')}
                        disabled={loading}
                        className='h-12 pl-14 text-lg'
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              disabled={loading || !form.formState.isValid}
              className='mt-4 ml-auto h-12 w-full text-lg'
              type='submit'
            >
              {t('auth.continueWithPhone')}
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
