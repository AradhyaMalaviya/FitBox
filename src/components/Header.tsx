import { BottomTabBar } from '@/components/BottomTabBar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Dumbbell, Compass, Utensils, Users, LayoutDashboard, Menu, X } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'Come back soon!',
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: 'Sign out failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 max-w-md mx-auto">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <span className="text-2xl">💪</span>
            <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent font-bold text-xl">FitBox</span>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => navigate('/auth')}
            className="text-xs h-8 px-3"
          >
            Sign In
          </Button>
        </div>
      </header>
    );
  }

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Exercises', path: '/exercises', icon: Compass },
    { label: 'Workout', path: '/workout/active', icon: Dumbbell },
    { label: 'Nutrition', path: '/nutrition', icon: Utensils },
    { label: 'GymBuddy', path: '/gymbuddy/discover', icon: Users },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4 sm:px-6">
          {/* Brand & Desktop Navigation */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-foreground hover:opacity-90 transition-opacity">
              <span className="text-2xl">💪</span>
              <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">FitBox</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, path, icon: Icon }) => {
                const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
                return (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm font-medium text-foreground">
              Welcome, <span className="text-primary">{user.username}</span>
              {user.isGuest && <span className="text-muted-foreground text-xs ml-1.5">(Guest)</span>}
            </span>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="gap-2 hidden sm:flex text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
            <div className="pb-2 mb-2 border-b border-border/40 text-sm text-foreground">
              Signed in as <span className="font-semibold text-primary">{user.username}</span>
              {user.isGuest && <span className="text-muted-foreground text-xs ml-1">(Guest)</span>}
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map(({ label, path, icon: Icon }) => {
                const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-border/40">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>
      <BottomTabBar />
    </>
  );
};