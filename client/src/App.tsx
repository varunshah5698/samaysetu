import { Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OperationalSignals } from "./components/OperationalSignals";
import Home from "./pages/Home";
import Postman from "./pages/Postman";
import QuickBook from "./pages/QuickBook";
import Welcome from "./pages/Welcome";

export function Shell({ children }: { children: React.ReactNode }) { const [location, navigate] = useLocation(); const showOperations = location === "/details"; return <div className="app-shell"><header className="topbar"><button className="wordmark" onClick={() => navigate("/")} aria-label="Samaysetu home"><span className="wordmark-mark"><span /></span><span>SAMAYSETU</span></button><nav className="role-nav" aria-label="Primary navigation"><button className={location === "/" ? "active" : ""} onClick={() => navigate("/")}>Home</button><button className={location === "/quick-book" ? "active" : ""} onClick={() => navigate("/quick-book")}>Book delivery</button><button className={location === "/postman" ? "active" : ""} onClick={() => navigate("/postman")}>Route desk</button></nav><div className="topbar-note"><span className="status-dot" /> Live dispatch</div></header>{children}{showOperations && <OperationalSignals />}<footer className="footer"><span>SAMAYSETU / DELIVERY OPERATIONS</span><span>Service area · Delhi NCR</span></footer></div>; }
function Router() { return <Switch><Route path="/" component={Welcome} /><Route path="/details" component={Home} /><Route path="/quick-book" component={QuickBook} /><Route path="/postman" component={Postman} /><Route component={Welcome} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Shell><Router /></Shell></TooltipProvider></ThemeProvider></ErrorBoundary>; }
