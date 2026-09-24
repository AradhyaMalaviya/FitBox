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
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchUserProfile = async (
  authUserId: string,
  userEmail?: string,
  metadata?: Record<string, unknown>
): Promise<User> => {
  // First attempt to query the profile row created by DB trigger
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  // If missing immediately after signup, wait 250ms and retry once (DB trigger async timing)
  if (!profile) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const retry = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    profile = retry.data;
  }

  // If still missing, attempt to self-heal by inserting missing profile record
  if (!profile) {
    const rawUsername = (
      (metadata?.username as string) ||
      userEmail?.split('@')[0] ||
      `user_${authUserId.slice(0, 6)}`
    )
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '');
    const cleanUsername = rawUsername || `user_${authUserId.slice(0, 8)}`;

    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        auth_user_id: authUserId,
        username: cleanUsername,
        phone_number: (metadata?.phone_number as string) || null,
      })
      .select('*')
      .maybeSingle();

    if (newProfile) {
      profile = newProfile;
    }
  }

  if (profile) {
    return {
      id: profile.id,
      profileId: profile.id,
      authUserId,
      username: profile.username || 'User',
      phoneNumber: profile.phone_number || '',
      isGuest: false,
    };
  }

  // Fallback if network or DB issue
  console.warn('[AuthContext] Profile not found after retries, using fallback user');
  return {
    id: authUserId,
    profileId: authUserId,
    authUserId,
    username: (metadata?.username as string) || userEmail?.split('@')[0] || 'User',
    phoneNumber: '',
    isGuest: false,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let inFlightId: string | null = null;

    const handleUserSession = async (currentSession: Session | null) => {
      setSession(currentSession);

      if (currentSession?.user) {
        const uid = currentSession.user.id;
        if (inFlightId === uid) return;
        inFlightId = uid;

        try {
          const loadedUser = await fetchUserProfile(
            uid,
            currentSession.user.email,
            currentSession.user.user_metadata
          );
          if (isMounted) {
            setUser(loadedUser);
            localStorage.removeItem('fitBoxUser');
          }
        } catch (err) {
          console.error('[AuthContext] Error loading user profile:', err);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
          inFlightId = null;
        }
      } else {
        // No session: Check for guest user
        const storedUser = localStorage.getItem('fitBoxUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.isGuest) {
              if (isMounted) {
                setUser({
                  ...parsedUser,
                  profileId: parsedUser.profileId || 'guest',
                  authUserId: parsedUser.authUserId || 'guest',
                });
              }
            } else {
              localStorage.removeItem('fitBoxUser');
              if (isMounted) setUser(null);
            }
          } catch {
            localStorage.removeItem('fitBoxUser');
            if (isMounted) setUser(null);
          }
        } else {
          if (isMounted) setUser(null);
        }
        if (isMounted) setLoading(false);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        handleUserSession(currentSession);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      handleUserSession(existingSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, fullName: string, username: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedUsername = username.trim().toLowerCase();
      const trimmedFullName = fullName.trim();

      // Validate inputs
      const validation = signUpSchema.safeParse({
        email: normalizedEmail,
        fullName: trimmedFullName,
        username: normalizedUsername,
        password,
      });
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0]?.message || 'Invalid registration details' };
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            username: normalizedUsername,
            full_name: trimmedFullName,
          },
        },
      });

      if (authError) {
        const msg = authError.message || '';
        if (msg.includes('already registered') || msg.includes('already been registered')) {
          return { success: false, error: 'An account with that email already exists. Please sign in or use a different email.' };
        }
        if (
          msg.includes('profiles_username_key') ||
          msg.includes('profiles_username_unique') ||
          (msg.toLowerCase().includes('duplicate key') && msg.toLowerCase().includes('username'))
        ) {
          return { success: false, error: 'That username is already taken. Please choose a different username.' };
        }
        if (msg.includes('Database error saving new user')) {
          return { success: false, error: 'Could not create account. That username or email may already be in use. Please try a different username or sign in.' };
        }
        if (msg === 'Failed to fetch') {
          return { success: false, error: 'Network Error: Cannot connect to Supabase. Your project might be paused due to inactivity, or an adblocker (like Brave Shields) is blocking the request. Please check your Supabase dashboard to unpause it.' };
        }
        return { success: false, error: msg };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create account. Please try again.' };
      }

      // Check for fake signup (user already exists but Supabase returns user with empty identities when email confirmation is on)
      if (authData.user.identities && authData.user.identities.length === 0) {
        return { success: false, error: 'An account with that email already exists. Please sign in or use a different email.' };
      }

      // If session was returned immediately (email confirmation disabled in Supabase)
      if (authData.session) {
        localStorage.removeItem('fitBoxUser');
        return { success: true };
      }

      // Attempt auto sign-in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          return { success: false, error: 'Account created! Please check your email to confirm your account before signing in.' };
        }
        return { success: false, error: 'Account created! Please proceed to the Sign In screen to log in with your credentials.' };
      }

      localStorage.removeItem('fitBoxUser');
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
      const normalizedEmail = email.trim().toLowerCase();

      // Validate inputs
      const validation = signInSchema.safeParse({ email: normalizedEmail, password });
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0]?.message || 'Invalid email or password' };
      }

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        const msg = error.message || '';
        if (msg.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
        }
        if (msg.includes('Email not confirmed')) {
          return { success: false, error: 'Your email address has not been confirmed yet. Please check your inbox for the confirmation link.' };
        }
        if (msg === 'Failed to fetch') {
          return { success: false, error: 'Network Error: Cannot connect to Supabase. Your project might be paused due to inactivity, or an adblocker (like Brave Shields) is blocking the request. Please check your Supabase dashboard to unpause it.' };
        }
        return { success: false, error: msg };
      }

      if (!data.session) {
        return { success: false, error: 'Failed to sign in. Please try again.' };
      }

      localStorage.removeItem('fitBoxUser');
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
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message === 'Failed to fetch') {
          return {
            success: false,
            error:
              'Network Error: Cannot connect to Supabase. Your project might be paused due to inactivity, or an adblocker (like Brave Shields) is blocking the request.',
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send reset email';
      return { success: false, error: errorMessage };
    }
  };

  const continueAsGuest = (guestName: string) => {
    const cleanGuestName = guestName.trim() || 'Athlete';
    const guestUser: User = {
      id: 'guest',
      profileId: 'guest',
      authUserId: 'guest',
      username: cleanGuestName,
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