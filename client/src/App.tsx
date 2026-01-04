import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { StockDataProvider } from "./contexts/StockDataContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WatchlistProvider } from "./contexts/WatchlistContext";
import { AuthProvider } from "./contexts/AuthContext";
import { StrategyProvider } from "./contexts/StrategyContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Home from "./pages/Home";
import LimitUp from "./pages/LimitUp";
import WatchlistEnhanced from "./pages/WatchlistEnhanced";
import Analytics from "./pages/Analytics";
import Community from "./pages/Community";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import Search from "./pages/Search";
import StrategyManagement from "./pages/StrategyManagement";
import StrategyRanking from "./pages/StrategyRanking";
import AutomatedTrading from "./pages/AutomatedTrading";
import NotificationSettings from "./pages/NotificationSettings";
import Settings from "./pages/Settings";
import ResearchReports from "./pages/ResearchReports";
import StockDetail from "./pages/StockDetail";
import StockSearch from "./pages/StockSearch";
import AskStock from "./pages/AskStock";
import DailyLimitUp from "./pages/DailyLimitUp";
import NextDayLimitUp from "./pages/NextDayLimitUp";
import SectorDetail from "./pages/SectorDetail";
import StrategyDetail from "./pages/StrategyDetail";
import DiscussionDetail from "./pages/DiscussionDetail";
import NewsDetail from "./pages/NewsDetail";
import { Invitations } from "./pages/Invitations";
import { Subscription } from "./pages/Subscription";
import { PushManagement } from "./pages/PushManagement";
import WelcomeGuide from "./pages/WelcomeGuide";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>      <Route path={"/"} component={Home} />
      <Route path={"/welcome-guide"} component={WelcomeGuide} />
      <Route path={"/limit-up"} component={LimitUp} />
      <Route path={"/watchlist"} component={WatchlistEnhanced} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/community"} component={Community} />
      <Route path={"/login"} component={Login} />
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/search"} component={Search} />
      <Route path={"/strategy"} component={StrategyManagement} />
      <Route path={"/strategy-ranking"} component={StrategyRanking} />
      <Route path={"/strategy-detail/:id"} component={StrategyDetail} />
      <Route path={"/automated-trading"} component={AutomatedTrading} />
      <Route path={"/notification-settings"} component={NotificationSettings} />
      <Route path={"/stock-detail"} component={StockDetail} />
      <Route path={"/stock/:code"} component={StockDetail} />
      <Route path={"/stock-search"} component={StockSearch} />
      <Route path={"/ask-stock"} component={AskStock} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/research-reports"} component={ResearchReports} />
      <Route path={"/daily-limit-up"} component={DailyLimitUp} />
      <Route path={"/next-day-limit-up"} component={NextDayLimitUp} />
      <Route path={"/sector/:sector"} component={SectorDetail} />
      <Route path={"/discussion/:id"} component={DiscussionDetail} />
      <Route path={"/news/:id"} component={NewsDetail} />
      <Route path={"/invitations"} component={Invitations} />
      <Route path={"/subscription"} component={Subscription} />
      <Route path={"/push-management"} component={PushManagement} />
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
        switchable
      >
        <AuthProvider>
          <NotificationProvider>
            <StrategyProvider>
              <StockDataProvider>
                <WatchlistProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Router />
                  </TooltipProvider>
                </WatchlistProvider>
              </StockDataProvider>
            </StrategyProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
