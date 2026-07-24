import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { useEffect } from 'react';

import Layout from '@/components/layout';
import Home from '@/pages/home';
import Browse from '@/pages/browse';
import Platforms from '@/pages/platforms';
import Downloads from '@/pages/downloads';
import Library from '@/pages/library';
import News from '@/pages/news';
import RomDetails from '@/pages/rom-details';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/browse" component={Browse} />
        <Route path="/platforms" component={Platforms} />
        <Route path="/downloads" component={Downloads} />
        <Route path="/library" component={Library} />
        <Route path="/news" component={News} />
        <Route path="/rom/:id" component={RomDetails} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    // Force dark mode for NeonROM aesthetic
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
