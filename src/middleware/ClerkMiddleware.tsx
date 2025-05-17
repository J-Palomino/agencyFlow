import { ClerkLoaded, ClerkLoading, RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

interface ClerkMiddlewareProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ClerkMiddleware({ children, requireAuth = true }: ClerkMiddlewareProps) {
  if (!requireAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="flex h-screen w-full items-center justify-center">
          <RedirectToSignIn />
        </div>
      </SignedOut>
      <ClerkLoading>
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ClerkLoading>
    </>
  );
}
