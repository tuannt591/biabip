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
import { setSession, verifyOtp } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  otp: z.string().min(6, { message: 'Enter a valid OTP' })
});

type OtpFormValue = z.infer<typeof formSchema>;

export default function OtpForm({ phone }: { phone: string }) {
  const [loading, startTransition] = useTransition();
  const { login } = useAuthStore();
  const router = useRouter();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-2'>
        <FormField
          control={form.control}
          name='otp'
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={loading}
          className='mt-2 ml-auto w-full'
          type='submit'
        >
          Verify OTP
        </Button>
      </form>
    </Form>
  );
}
