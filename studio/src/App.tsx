import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, Show, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Studio from '@/pages/studio';
import SharedScene from '@/pages/shared-scene';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: true } },
});
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

function AuthCacheLifecycle() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  useEffect(() => {
    let prior: string | null | undefined;
    return addListener(({ user }) => {
      const current = user?.id ?? null;
      if (prior !== undefined && prior !== current) client.clear();
      prior = current;
    });
  }, [addListener, client]);
  return null;
}

function Router() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(path) => setLocation(stripBase(path))}
      routerReplace={(path) => setLocation(stripBase(path), { replace: true })}
      appearance={{
        theme: shadcn,
        cssLayerName: 'clerk',
        variables: {
          colorPrimary: '#ee4d2e', colorForeground: '#202126', colorMutedForeground: '#777b84',
          colorDanger: '#cb3824', colorBackground: '#f5f2ea', colorInput: '#fffdf8',
          colorInputForeground: '#202126', colorNeutral: '#202126', fontFamily: 'Inter, sans-serif', borderRadius: '6px',
        },
        elements: {
          rootBox: 'w-full flex justify-center',
          cardBox: 'bg-[#f5f2ea] rounded-xl w-[420px] max-w-full overflow-hidden',
          card: '!shadow-none !border-0 !bg-transparent !rounded-none',
          footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
        },
        options: { logoPlacement: 'inside', logoLinkUrl: `${basePath}/`, logoImageUrl: `${window.location.origin}${basePath}/favicon.svg` },
      }}
      localization={{
        signIn: { start: { title: 'Return to your studio', subtitle: 'Your saved scenes are waiting.' } },
        signUp: { start: { title: 'Make something original', subtitle: 'Save and share your mathematical scenes.' } },
      }}
    >
      <AuthCacheLifecycle />
      <Switch>
        {/* Studio stays public; authentication is optional for local creation. */}
        <Route path="/" component={Studio} />
        <Route path="/sign-in/*?" component={() => <AuthPage mode="sign-in" />} />
        <Route path="/sign-up/*?" component={() => <AuthPage mode="sign-up" />} />
        <Route path="/shared/:id" component={() => <ErrorBoundary resetKey={location.pathname}><SharedScene /></ErrorBoundary>} />
        <Route path="/account" component={() => <AccountPage />} />
        <Route component={NotFound} />
      </Switch>
    </ClerkProvider>
  );
}

function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const [, setLocation] = useLocation();
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#f5f2ea] px-4 py-8">
      <div className="w-full max-w-[420px]">
        <button onClick={() => setLocation('/')} className="mb-6 font-mono text-xs uppercase tracking-[0.16em]">← Back to Style Scape</button>
        {mode === 'sign-in'
          ? <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
          : <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />}
      </div>
    </main>
  );
}

function AccountPage() {
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();
  return (
    <Show when="signed-in" fallback={<main className="p-8"><p>Sign in to view your account.</p><a href={`${basePath}/sign-in`}>Sign in</a></main>}>
      <main className="mx-auto max-w-xl space-y-5 p-8">
        <p className="font-mono text-xs uppercase tracking-widest">Style Scape · Cloud account</p>
        <h1 className="text-3xl font-bold">Your workspace</h1>
        <p className="text-sm text-muted-foreground">Your private projects are accessible only after signing in.</p>
        <button className="rounded border px-4 py-2" onClick={() => { void signOut({ redirectUrl: `${basePath}/` }); }}>Sign out</button>
        <button className="ml-2 rounded bg-primary px-4 py-2 text-primary-foreground" onClick={() => setLocation('/')}>Open studio</button>
      </main>
    </Show>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  if (!clerkPubKey) throw new Error('Style Scape authentication is not configured. Check the Clerk publishable key.');
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <RoutedErrorBoundary><Router /></RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
