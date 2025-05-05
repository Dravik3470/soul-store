import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Feed from "@/pages/feed";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import { useState, useEffect, createContext } from "react";
import { apiRequest } from "./lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  nearWallet: string | null;
  login: (nearWallet: string, nearAddress: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

// Create a React context for auth state
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  nearWallet: null,
  login: async () => {},
  logout: async () => {},
  isAdmin: false,
});

function Router() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-dark-300 text-light-100">
      <Sidebar />
      <div className="flex-1 relative">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/feed" component={Feed} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
        <MobileNav />
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [nearWallet, setNearWallet] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check auth status when app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
        setNearWallet(data.nearWallet || null);
        
        if (data.authenticated) {
          // Fetch user details to check if admin
          const userRes = await fetch('/api/users/me');
          if (userRes.ok) {
            const userData = await userRes.json();
            setIsAdmin(userData.isAdmin);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (nearWallet: string, nearAddress: string) => {
    try {
      console.log("Sending login request to API...");
      const res = await apiRequest('POST', '/api/auth/login', { nearWallet, nearAddress });
      const data = await res.json();
      console.log("Login API response:", data);
      
      if (data.success) {
        setIsAuthenticated(true);
        setNearWallet(data.user.nearWallet);
        setIsAdmin(data.user.isAdmin);
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${data.user.username}!`,
        });
        
        // Redirect to dashboard after successful login
        console.log("Redirecting to dashboard...");
        window.location.href = '/dashboard';
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Unable to login with NEAR wallet",
        variant: "destructive"
      });
    }
  };
  
  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
      setIsAuthenticated(false);
      setNearWallet(null);
      setIsAdmin(false);
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthContext.Provider value={{ isAuthenticated, nearWallet, login, logout, isAdmin }}>
          <Toaster />
          <Router />
        </AuthContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
