import { ReactFlowProvider } from 'reactflow';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp, UserButton, useAuth, useUser } from '@clerk/clerk-react';
import OrgChart from './components/OrgChart';
import HowToUse from './components/HowToUse';

// Clerk components
const SignInPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  </div>
);

const SignUpPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  </div>
);

const UserMenu = () => {
  const { user } = useUser();
  
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-700">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</span>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

const LoginButton = () => (
  <Link
    to="/sign-in"
    className="ml-6 text-blue-600 hover:text-blue-800 text-sm font-medium"
  >
    Sign in
  </Link>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Layout component that includes the header
const Layout = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Organization Chart Tool
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500 hidden sm:block">
              Interactive Agent Mapping System
            </p>
            <Link
              to="/how-to-use"
              className="ml-6 text-blue-600 underline text-sm hover:text-blue-800"
            >
              How to Use
            </Link>
            {isSignedIn ? <UserMenu /> : <LoginButton />}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <Router>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ReactFlowProvider>
                    <OrgChart />
                  </ReactFlowProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/how-to-use"
              element={
                <ProtectedRoute>
                  <HowToUse />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </ClerkProvider>
  );
}

export default App;