import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

export function ClerkProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <ClerkProviderBase
      publishableKey={clerkPubKey}
      navigate={(to) => navigate(to)}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}
