'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth, useUser, initiateEmailSignIn } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import PublicHeader from "@/components/shared/public-header";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.651-3.657-11.303-8H6.306C9.656,35.663,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.508,44,30.016,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { user: currentUser, isUserLoading } = useUser();

  // Consolidate redirection to rely on the global useUser hook.
  // This prevents flickering caused by multiple router.push calls.
  useEffect(() => {
    if (!isUserLoading && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, isUserLoading, router]);
  
  const handleAuthError = (err: any) => {
    let errorMessage = 'An unknown error occurred. Please try again.';
    if (err.code) {
        switch (err.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
            case 'auth/user-not-found':
                errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                break;
            case 'auth/popup-closed-by-user':
                errorMessage = 'The sign-in process was cancelled.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Sign-in with this method is not enabled. Please contact support.';
                break;
            case 'auth/unauthorized-domain':
                errorMessage = "This domain isn't authorized for Google Sign-In. This is a Firebase console configuration, not a code bug. The domain must be added to the authorized domains list in Firebase Auth settings.";
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
                break;
            default:
                errorMessage = err.message;
        }
    }
    setError(errorMessage);
    setIsLoading(false);
    setIsGoogleLoading(false);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (!auth) return;
    try {
      await initiateEmailSignIn(auth, email, password);
    } catch (err) {
      handleAuthError(err);
    }
  };
  
  const handleGoogleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGoogleLoading(true);
    setError(null);
    if (!auth) {
      setIsGoogleLoading(false);
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <PublicHeader />
      <div className="w-full max-w-md">
        <Card className="transition-all duration-300 hover:shadow-primary/20 hover:scale-[1.02] hover:-translate-y-1">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">Welcome Back</CardTitle>
            <CardDescription>Sign in to continue your learning journey.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="focus:border-primary focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="focus:border-primary focus:ring-primary/20" />
                </div>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Login Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full font-bold transition-transform duration-200 hover:scale-[1.02] hover:-translate-y-1" type="submit" disabled={isLoading || isGoogleLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="relative w-full">
                    <Separator />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">OR</span>
                </div>
                 <Button variant="outline" className="w-full font-bold transition-transform duration-200 hover:scale-[1.02] hover:-translate-y-1" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
                    {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5"/>}
                    Sign in with Google
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                    Don't have an account? <Link href="/signup" className="font-semibold text-primary hover:underline transition-colors duration-300">Sign Up</Link>
                </p>
                <Button variant="link" className="text-muted-foreground" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Go Back
                </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
