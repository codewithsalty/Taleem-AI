'use client';

import DashboardHeader from '@/components/shared/dashboard-header';
import DashboardSidebar from '@/components/shared/dashboard-sidebar';
import OfflineIndicator from '@/components/shared/offline-indicator';
import BottomNav from '@/components/shared/bottom-nav';
import GamificationListener from '@/components/features/gamification/gamification-listener';
import AuthWrapper from '@/components/shared/auth-wrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Sidebar is now fixed and z-indexed to stay on top */}
      <DashboardSidebar />
      
      {/* The content area is offset by the sidebar width (16 units/4rem) on desktop */}
      <div className="flex flex-col md:pl-16 min-h-screen w-full">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </main>
      </div>

      <OfflineIndicator />
      <BottomNav />
      <GamificationListener />
    </div>
  );
}
