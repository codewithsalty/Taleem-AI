
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, WifiOff, User } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Settings</h1>
      <div className="grid gap-6 max-w-lg">
        <Card className="hover:border-primary/50 transition-colors">
          <Link href="#" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline">
                <User className="w-6 h-6" />
                Account
              </CardTitle>
              <CardDescription>
                Manage your profile, password, and account settings.
              </CardDescription>
            </CardHeader>
             <CardContent>
              <div className="flex justify-end">
                <Button variant="ghost">
                  Manage Account <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>
         <Card className="hover:border-primary/50 transition-colors">
          <Link href="/settings/offline" className="block">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline">
                <WifiOff className="w-6 h-6" />
                Offline Mode Manager
              </CardTitle>
              <CardDescription>
                Download course content to continue learning without an internet connection.
              </CardDescription>
            </CardHeader>
             <CardContent>
              <div className="flex justify-end">
                <Button variant="ghost">
                  Manage Offline Data <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
