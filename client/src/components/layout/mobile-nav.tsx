import React, { useContext, useState } from "react";
import { Link, useLocation } from "wouter";
import { AuthContext } from "@/App";
import { Menu, X, Home, ClipboardList, FileText, User, BarChart2, ShieldCheck, Pen } from "lucide-react";

const MobileNav = () => {
  const [location] = useLocation();
  const { isAuthenticated, isAdmin } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigationItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-6 w-6" />,
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <ClipboardList className="h-6 w-6" />,
      requiresAuth: true,
    },
    {
      name: "Content Feed",
      path: "/feed",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      name: "Leaderboard",
      path: "/leaderboard",
      icon: <BarChart2 className="h-6 w-6" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="h-6 w-6" />,
      requiresAuth: true,
    },
  ];

  // Filter items based on authentication status
  const visibleItems = navigationItems.filter(
    item => !item.requiresAuth || isAuthenticated
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-dark-200 border-b border-dark-100 p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
              <Pen className="h-4 w-4 text-light-100" />
            </div>
            <h1 className="text-lg font-bold text-light-100">SoulScribe</h1>
          </div>
          
          <button 
            className="text-light-100 p-1" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Full-screen menu when open */}
      {menuOpen && (
        <div className="fixed inset-0 bg-dark-300 z-40 pt-16 md:hidden">
          <div className="p-4">
            <nav className="space-y-4">
              {navigationItems.map((item) => {
                // Skip if item requires auth and user is not authenticated
                if (item.requiresAuth && !isAuthenticated) return null;
                // Skip if item requires admin and user is not admin
                if (item.requiresAdmin && !isAdmin) return null;
                
                return (
                  <Link 
                    key={item.path}
                    href={item.path}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center p-4 text-xl text-light-100"
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
              
              {isAdmin && (
                <Link 
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center p-4 text-xl text-light-100"
                >
                  <ShieldCheck className="h-6 w-6" />
                  <span className="ml-3">Admin Panel</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-dark-200 border-t border-dark-100 fixed bottom-0 left-0 right-0 z-20">
        <div className="flex justify-around">
          {visibleItems.slice(0, 5).map((item) => {
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center py-2 px-3 ${
                  isActive ? "text-primary-400" : "text-light-300"
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
