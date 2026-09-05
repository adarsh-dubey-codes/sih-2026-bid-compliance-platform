import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';


export type UserRole = 'ADMIN' | 'PROCUREMENT_OFFICER' | 'BIDDER' | 'AUDITOR';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendVerificationEmail: (email: string) => Promise<{ error: any }>;
  startDemoSession: (roleChoice?: UserRole, fullName?: string, email?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatAuthError = (error: any) => {
  if (!error) return null;
  const msg = error.message?.toLowerCase() || '';
  const status = error.status || error.code;

  if (status === 429 || msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_email_send_rate_limit')) {
    return {
      ...error,
      message: 'Supabase Email Rate Limit Exceeded (429). Email sending is temporarily throttled by Supabase. Please wait 60 seconds or use Demo Quick Access.',
      isRateLimited: true,
    };
  }

  if (msg.includes('email not confirmed')) {
    return {
      ...error,
      message: 'Email confirmation is pending in Supabase Auth. Please check your inbox, or disable "Confirm Email" in Supabase Dashboard → Auth → Providers → Email.',
      isEmailUnconfirmed: true,
    };
  }

  return error;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('PROCUREMENT_OFFICER');
  const [loading, setLoading] = useState<boolean>(true);
  const [lastEmailSentTime, setLastEmailSentTime] = useState<number>(0);

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data as UserProfile);
        setRole(data.role as UserRole);
      } else {
        const defaultProf: UserProfile = {
          id: userId,
          full_name: userEmail?.split('@')[0] || 'Government Official',
          email: userEmail || 'officer@mopng.gov.in',
          role: 'PROCUREMENT_OFFICER',
        };
        setProfile(defaultProf);
        setRole('PROCUREMENT_OFFICER');
      }
    } catch {
      setRole('PROCUREMENT_OFFICER');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setRole('PROCUREMENT_OFFICER');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: formatAuthError(error) };
    }
    if (data?.session) {
      setSession(data.session);
      setUser(data.user);
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email);
      }
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, roleChoice: UserRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: roleChoice,
        },
      },
    });

    if (error) {
      return { data: null, error: formatAuthError(error) };
    }

    if (data?.user) {
      try {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            full_name: fullName,
            email,
            role: roleChoice,
          },
        ]);
      } catch {
        // Trigger handle_new_user handles fallback
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        setProfile({
          id: data.user.id,
          full_name: fullName,
          email,
          role: roleChoice,
        });
        setRole(roleChoice);
      }
    }

    return { data, error: null };
  };

  const resendVerificationEmail = async (email: string) => {
    const now = Date.now();
    if (now - lastEmailSentTime < 60000) {
      const waitSecs = Math.ceil((60000 - (now - lastEmailSentTime)) / 1000);
      return {
        error: {
          message: `Throttled: Please wait ${waitSecs} seconds before requesting another email.`,
          isRateLimited: true,
        },
      };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      return { error: formatAuthError(error) };
    }

    setLastEmailSentTime(now);
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const now = Date.now();
    if (now - lastEmailSentTime < 60000) {
      const waitSecs = Math.ceil((60000 - (now - lastEmailSentTime)) / 1000);
      return {
        error: {
          message: `Throttled: Please wait ${waitSecs} seconds before requesting another password reset.`,
          isRateLimited: true,
        },
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      return { error: formatAuthError(error) };
    }

    setLastEmailSentTime(now);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const startDemoSession = (
    roleChoice: UserRole = 'PROCUREMENT_OFFICER',
    fullName: string = 'Dr. S. K. Sharma (GAIL Official)',
    email: string = 'officer@mopng.gov.in'
  ) => {
    const demoUser: User = {
      id: 'demo-sovereign-user-id',
      app_metadata: { provider: 'email' },
      user_metadata: { full_name: fullName, role: roleChoice },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email,
    } as any;

    const demoSession: Session = {
      access_token: 'demo-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'demo-refresh-token',
      user: demoUser,
    };

    const demoProfile: UserProfile = {
      id: 'demo-sovereign-user-id',
      full_name: fullName,
      email,
      role: roleChoice,
    };

    setUser(demoUser);
    setSession(demoSession);
    setProfile(demoProfile);
    setRole(roleChoice);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        resendVerificationEmail,
        startDemoSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
