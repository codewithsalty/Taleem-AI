
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/shared/logo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ParentLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Link href="/" className="inline-block">
                <Logo />
            </Link>
            <h1 className="text-2xl font-bold font-headline mt-4">Parent Portal</h1>
            <p className="text-muted-foreground">Sign in to view your child's progress.</p>
        </div>
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone Number</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold">
                <Link href="/parent/dashboard" className="flex items-center justify-center w-full h-full">
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
            <p className="text-xs text-center text-muted-foreground">
                Don't have an account? <Link href="#" className="font-semibold text-teal-600 hover:underline">Sign Up</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
