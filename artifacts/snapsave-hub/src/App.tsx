import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { MainLayout } from "@/components/layout/main-layout";
import { Home } from "@/pages/home";
import { PlatformPage } from "@/pages/platform";
import { History } from "@/pages/history";
import { Favorites } from "@/pages/favorites";
import { Settings } from "@/pages/settings";
import { SourceCode } from "@/pages/source-code";
import { About } from "@/pages/about";
import { Support } from "@/pages/support";

const queryClient = new QueryClient();

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/platform/:platformId" component={PlatformPage} />
        <Route path="/history" component={History} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/settings" component={Settings} />
        <Route path="/source-code" component={SourceCode} />
        <Route path="/about" component={About} />
        <Route path="/support" component={Support} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
