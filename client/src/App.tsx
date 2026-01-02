import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { StockDataProvider } from "./contexts/StockDataContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import Home from "./pages/Home";
import LimitUp from "./pages/LimitUp";
import WatchlistEnhanced from "./pages/WatchlistEnhanced";
import Analytics from "./pages/Analytics";


function Router() {
  return (
    <Switch>
      <Route path={"/ "} component={Home} />
      <Route path={"/limit-up"} component={LimitUp} />
      <Route path={"/watchlist"} component={WatchlistEnhanced} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <StockDataProvider>
          <WatchlistProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </WatchlistProvider>
        </StockDataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
