import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useRequireLogin() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn !== 'true') {
        router.push('/login');
      }
    }
  }, [router]);
}
