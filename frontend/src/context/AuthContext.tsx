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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('PROCUREMENT_OFFICER');
  const [loading, setLoading] = useState<boolean>(true);

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
        // Fallback default profile if profiles table not populated yet
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
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // 2. Listen to auth changes
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
      const isEmailUnconfirmed = error.message?.toLowerCase().includes('email not confirmed');
      if (isEmailUnconfirmed) {
        return {
          error: {
            ...error,
            message: 'Email confirmation pending in Supabase. Please check your inbox or disable "Confirm Email" in Supabase Auth Settings.',
            isEmailUnconfirmed: true
          }
        };
      }
    }
    if (data?.session) {
      setSession(data.session);
      setUser(data.user);
      if (data.user) {
        await fetchProfile(data.user.id, data.user.email);
      }
    }
    return { error };
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

    if (!error && data.user) {
      // Upsert profile row in profiles table
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
        // Table trigger on_auth_user_created also inserts this profile automatically
      }

      // If user session is returned (email confirmation disabled in Supabase), update local state
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

    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { error };
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
