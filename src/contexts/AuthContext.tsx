import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { signUpSchema, signInSchema } from '@/lib/authSchemas';

interface User {
  id: string; // Same as profileId for backwards compatibility
  profileId: string;
  authUserId: string;
  username: string;
  phoneNumber: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authUserId: string | null;
  profileId: string | null;
  signUp: (email: string, fullName: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  continueAsGuest: (guestName: string) => void;
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch profile data
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('auth_user_id', currentSession.user.id)
                .single();

              if (profile) {
                const newUser: User = {
                  id: profile.id,
                  profileId: profile.id,
                  authUserId: currentSession.user.id,
                  username: profile.username,
                  phoneNumber: profile.phone_number,
                  isGuest: false,
                };
                setUser(newUser);

                if (import.meta.env.DEV && profile.id === currentSession.user.id) {
                  console.warn(
                    '[AuthContext Dev Check] profile.id matches auth_user_id exactly. If schema has separate UUIDs, confirm ID mapping.'
                  );
                }
              } else {
                console.warn('[AuthContext] Profile not found for authenticated user, creating minimal fallback user');
                setUser({
                  id: currentSession.user.id,
                  profileId: currentSession.user.id,
                  authUserId: currentSession.user.id,
                  username: currentSession.user.email?.split('@')[0] || 'User',
                  phoneNumber: '',
                  isGuest: false,
                });
              }
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          // Check for guest user
          const storedUser = localStorage.getItem('fitBoxUser');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.isGuest) {
                setUser({
                  ...parsedUser,
                  profileId: parsedUser.profileId || 'guest',
                  authUserId: parsedUser.authUserId || 'guest',
                });
              } else {
                localStorage.removeItem('fitBoxUser');
              }
            } catch {
              localStorage.removeItem('fitBoxUser');
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', existingSession.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              profileId: profile.id,
              authUserId: existingSession.user.id,
              username: profile.username,
              phoneNumber: profile.phone_number || '',
              isGuest: false,
            });
          } else {
            console.warn('[AuthContext] Profile not found for authenticated user in getSession, creating minimal fallback user');
            setUser({
              id: existingSession.user.id,
              profileId: existingSession.user.id,
              authUserId: existingSession.user.id,
              username: existingSession.user.email?.split('@')[0] || 'User',
              phoneNumber: '',
              isGuest: false,
            });
          }
          setLoading(false);
        }, 0);
      } else {
        const storedUser = localStorage.getItem('fitBoxUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.isGuest) {
              setUser({
                ...parsedUser,
                profileId: parsedUser.profileId || 'guest',
                authUserId: parsedUser.authUserId || 'guest',
              });
            }
          } catch {
            localStorage.removeItem('fitBoxUser');
          }
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, fullName: string, username: string, password: string) => {
    try {
      // Validate inputs
      const validation = signUpSchema.safeParse({ email, fullName, username, password });
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }

      const normalizedUsername = username.trim().toLowerCase();

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: normalizedUsername,
            full_name: fullName
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
          return { success: false, error: 'An account with that email already exists. Please sign in or use a different email.' };
        }
        if (authError.message === 'Failed to fetch') {
          return { success: false, error: 'Network Error: Cannot connect to Supabase. Your project might be paused due to inactivity, or an adblocker (like Brave Shields) is blocking the request. Please check your Supabase dashboard to unpause it.' };
        }
        throw authError;
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create account' };
      }

      // Check for fake signup (user already exists but Supabase returns user with empty identities)
      if (authData.user.identities && authData.user.identities.length === 0) {
        return { success: false, error: 'An account with that email already exists. Please sign in or use a different email.' };
      }

      // If session was returned, user is auto-signed in (email confirmation disabled)
      if (authData.session) {
        return { success: true };
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          return { success: false, error: 'Account created but email confirmation is required. Please contact support or ask the administrator to disable email confirmation in Supabase.' };
        }
        console.warn('Auto sign-in after signup failed:', signInError.message);
        return { success: true };
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      if (errorMessage === 'Failed to fetch') {
        return { success: false, error: 'Network Error: Cannot connect to Supabase. Your project might be paused due to inactivity, or an adblocker (like Brave Shields) is blocking the request. Please check your Supabase dashboard to unpause it.' };
      }
      return { success: false, error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validate inputs
      const validation = signInSchema.safeParse({ email, password });
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid username or password. Please check your credentials and try again.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Your account email has not been confirmed. Please contact support.' };
        }
        if (error.message === 'Failed to fetch') {
          return { success: false, error: 'Network Error: Cannot connect to Supabase. Your project might be paused due to inactivity, or an adblocker (like Brave Shields) is blocking the request. Please check your Supabase dashboard to unpause it.' };
        }
        throw error;
      }

      if (!data.session) {
        return { success: false, error: 'Failed to sign in' };
      }

      return { success: true };
    } catch (error) {
      console.error('Signin error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      if (errorMessage === 'Failed to fetch') {
        return { success: false, error: 'Network Error: Cannot connect to Supabase. Your project might be paused due to inactivity, or an adblocker (like Brave Shields) is blocking the request. Please check your Supabase dashboard to unpause it.' };
      }
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // redirectTo must match a configured Supabase redirect URL.
      // The email link brings the user back to /auth where they can sign in
      // with the new password they set via Supabase's hosted reset page.
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        if (error.message === "Failed to fetch") {
          return {
            success: false,
            error:
              "Network Error: Cannot connect to Supabase. Your project might be paused due to inactivity, or an adblocker (like Brave Shields) is blocking the request. Please check your Supabase dashboard to unpause it.",
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send reset email";
      return { success: false, error: errorMessage };
    }
  };

  const continueAsGuest = (guestName: string) => {
    const guestUser: User = {
      id: 'guest',
      profileId: 'guest',
      authUserId: 'guest',
      username: guestName,
      phoneNumber: '',
      isGuest: true,
    };

    setUser(guestUser);
    localStorage.setItem('fitBoxUser', JSON.stringify(guestUser));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    localStorage.removeItem('fitBoxUser');
  };

  const authUserId = session?.user?.id || (user?.isGuest ? 'guest' : user?.authUserId || null);
  const profileId = user?.profileId || null;

  return (
    <AuthContext.Provider value={{ user, session, authUserId, profileId, signUp, signIn, resetPassword, continueAsGuest, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- Intentional co-location of Provider and Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};