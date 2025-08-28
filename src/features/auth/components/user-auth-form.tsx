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
import { getOtp } from '@/lib/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import OtpForm from './otp-form';

const formSchema = z.object({
  phone: z.string().min(10, { message: 'Enter a valid phone number' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const [phone, setPhone] = useState('');
  const defaultValues = {
    phone: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    startTransition(async () => {
      try {
        await getOtp(data.phone);
        setPhone(data.phone);
        toast.success('OTP has been sent to your phone!');
      } catch (error) {
        toast.error('Failed to send OTP. Please try again.');
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
            className='w-full space-y-2'
          >
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type='tel'
                      placeholder='Enter your phone number...'
                      disabled={loading}
                      {...field}
                    />
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
              Continue With Phone
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
