'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    // Return only the skeleton for the content area.
    // The DashboardLayout already provides the sidebar and header shells.
    return <Skeleton className="h-96 w-full" />;
  }

  if (user) {
    return <>{children}</>;
  }

  return null; // Render nothing while redirecting
}
