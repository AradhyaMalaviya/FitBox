import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Eye, EyeOff, Loader2 } from 'lucide-react';

type AuthMode = 'welcome' | 'signup' | 'signin' | 'guest' | 'forgot';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, signIn, resetPassword, continueAsGuest } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !username.trim() || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await signUp(email.trim(), fullName.trim(), username.trim(), password);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Welcome to FitBox! 🎉',
        description: 'Your account has been created successfully.',
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Signup failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({
        title: 'Error',
        description: 'Please enter your email and password',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Welcome back!',
        description: `Signed in successfully`,
      });
      navigate('/dashboard');
    } else {
      toast({
        title: 'Sign in failed',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name',
        variant: 'destructive',
      });
      return;
    }

    continueAsGuest(guestName.trim());
    toast({
      title: 'Welcome! 🎉',
      description: `Continuing as ${guestName.trim()}`,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-fitness-green/20 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            {mode === 'welcome' && 'Welcome to FitBox'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'signin' && 'Sign In'}
            {mode === 'guest' && 'Continue as Guest'}
            {mode === 'forgot' && 'Reset Password'}
          </CardTitle>
          <CardDescription className="text-base">
            {mode === 'welcome' && 'Your fitness journey starts here!'}
            {mode === 'signup' && 'Join us and track your progress'}
            {mode === 'signin' && 'Welcome back! Enter your credentials'}
            {mode === 'guest' && 'Choose a temporary name'}
            {mode === 'forgot' && 'Enter your registered email'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === 'welcome' && (
            <div className="space-y-3">
              <Button 
                className="w-full h-12 text-lg" 
                onClick={() => setMode('signup')}
              >
                Sign Up
              </Button>
              <Button 
                className="w-full h-12 text-lg" 
                variant="outline"
                onClick={() => setMode('signin')}
              >
                Sign In
              </Button>
              <Button 
                className="w-full h-12 text-lg" 
                variant="secondary"
                onClick={() => setMode('guest')}
              >
                Continue as Guest
              </Button>
            </div>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-fullname">Full Name</Label>
                <Input
                  id="signup-fullname"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-username">Username</Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="e.g. rahul_fit"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  disabled={loading}
                />
                <p className="text-[11px] text-muted-foreground">
                  3–30 characters (letters, numbers, hyphens, and underscores).
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signup-password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 pt-2">
                <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground pt-1">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary font-medium hover:underline focus:outline-none"
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </div>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setMode('welcome')}
                  disabled={loading}
                >
                  Back to Welcome
                </Button>
              </div>
            </form>
          )}

          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <Input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline focus:outline-none"
                  onClick={() => setMode('forgot')}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
              <div className="space-y-2 pt-2">
                <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <div className="text-center text-sm text-muted-foreground pt-1">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary font-medium hover:underline focus:outline-none"
                    disabled={loading}
                  >
                    Sign Up
                  </button>
                </div>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setMode('welcome')}
                  disabled={loading}
                >
                  Back to Welcome
                </Button>
              </div>
            </form>
          )}

          {mode === 'guest' && (
            <form onSubmit={handleGuest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest-name">Display Name</Label>
                <Input
                  id="guest-name"
                  type="text"
                  placeholder="What should we call you?"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Note: Your progress won't be saved as a guest
              </p>
              <div className="space-y-2 pt-2">
                <Button type="submit" className="w-full">
                  Continue
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setMode('welcome')}
                >
                  Back
                </Button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!email.trim()) {
                  toast({
                    title: 'Error',
                    description: 'Please enter your email',
                    variant: 'destructive',
                  });
                  return;
                }
                setLoading(true);
                const result = await resetPassword(email.trim());
                setLoading(false);
                if (result.success) {
                  toast({
                    title: 'Check your inbox',
                    description: `We sent a password reset link to ${email.trim()}.`,
                  });
                  setMode('signin');
                } else {
                  toast({
                    title: 'Error',
                    description: result.error ?? 'Could not send reset email.',
                    variant: 'destructive',
                  });
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                We&apos;ll email you a link to choose a new password.
              </p>
              <div className="space-y-2 pt-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMode('signin')}
                  disabled={loading}
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;