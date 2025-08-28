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
import { getOtp, setSession, verifyOtp } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  otp: z.string().min(6, { message: 'Enter a valid OTP' })
});

type OtpFormValue = z.infer<typeof formSchema>;

export default function OtpForm({ phone }: { phone: string }) {
  const [loading, startTransition] = useTransition();
  const [isSendingAgain, startSendAgainTransition] = useTransition();
  const { login } = useAuthStore();
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);

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
        toast.success('A new OTP has been sent.');
        setCountdown(60);
        setIsCounting(true);
      } catch (error) {
        toast.error('Failed to send new OTP.');
      }
    });
  };

  const form = useForm<OtpFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: ''
    }
  });

  const onSubmit = async (data: OtpFormValue) => {
    startTransition(async () => {
      try {
        const user = await verifyOtp(phone, data.otp);
        login(user);
        setSession(user);
        toast.success('OTP Verified Successfully!');
        router.push('/dashboard');
      } catch (error) {
        toast.error('Failed to verify OTP. Please try again.');
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
            name='otp'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='block text-center leading-[1.5]'>
                  Your one-time verification code was sent to {phone}
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
            Verify OTP
          </Button>
        </form>
      </Form>
      <div className='mt-4 text-center'>
        {isCounting ? (
          <p className='text-muted-foreground'>Resend OTP in {countdown}s</p>
        ) : (
          <Button
            variant='link'
            onClick={handleSendAgain}
            disabled={isSendingAgain}
          >
            Send again
          </Button>
        )}
      </div>
    </div>
  );
}
