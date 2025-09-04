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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOtp, setSession, verifyOtp } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

export default function OtpForm({ phone }: { phone: string }) {
  const { t } = useLanguage();
  const [loading, startTransition] = useTransition();
  const [isSendingAgain, startSendAgainTransition] = useTransition();
  const { login } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);

  const formSchema = z.object({
    otpCode: z.string().min(6, { message: t('auth.enterValidOtp') })
  });

  type OtpFormValue = z.infer<typeof formSchema>;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCounting) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            setIsCounting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isCounting]);

  const handleSendAgain = async () => {
    startSendAgainTransition(async () => {
      try {
        await getOtp(phone);
        toast.success(t('auth.newOtpSent'));
        setCountdown(60);
        setIsCounting(true);
      } catch (error) {
        toast.error(t('auth.failedToSendNewOtp'));
      }
    });
  };

  const form = useForm<OtpFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otpCode: ''
    }
  });

  const onSubmit = async (data: OtpFormValue) => {
    startTransition(async () => {
      try {
        const user = await verifyOtp(phone, data.otpCode);
        login(user);
        setSession(user);
        toast.success(t('auth.otpVerifiedSuccessfully'));

        // Check if there's a callback URL to redirect to
        const callbackUrl = searchParams.get('callbackUrl');
        if (callbackUrl) {
          router.push(decodeURIComponent(callbackUrl));
        } else {
          router.push('/dashboard');
        }
      } catch (error) {
        toast.error(t('auth.failedToVerifyOtp'));
      }
    });
  };

  return (
    <div className='w-full'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-6'
        >
          <FormField
            control={form.control}
            name='otpCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='block text-center leading-[1.5]'>
                  {t('auth.otpDescription', { phone: `+${phone}` })}
                </FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    containerClassName='justify-center'
                  >
                    <InputOTPGroup className='gap-1'>
                      <InputOTPSlot className='h-12 w-12 text-2xl' index={0} />
                      <InputOTPSlot className='h-12 w-12 text-2xl' index={1} />
                      <InputOTPSlot className='h-12 w-12 text-2xl' index={2} />
                      <InputOTPSlot className='h-12 w-12 text-2xl' index={3} />
                      <InputOTPSlot className='h-12 w-12 text-2xl' index={4} />
                      <InputOTPSlot className='h-12 w-12 text-2xl' index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={loading}
            className='mt-4 h-12 w-full text-lg'
            type='submit'
          >
            {t('auth.verifyOtp')}
          </Button>
        </form>
      </Form>
      <div className='mt-4 text-center'>
        {isCounting ? (
          <p className='text-muted-foreground'>
            {t('auth.resendOtpIn', { countdown: countdown.toString() })}
          </p>
        ) : (
          <Button
            variant='link'
            onClick={handleSendAgain}
            disabled={isSendingAgain}
          >
            {t('auth.sendAgain')}
          </Button>
        )}
      </div>
    </div>
  );
}
