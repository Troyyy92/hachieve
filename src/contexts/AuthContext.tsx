import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>; // Add logout function to context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        // If there's an error getting session, assume logged out
        setUser(null);
        setSession(null);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state changed:', _event, session); // Debug log
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    console.log("Attempting logout via AuthContext...");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during Supabase signOut:", error);
        // If signOut fails, especially with session missing or forbidden,
        // we should ensure local state is cleared.
        // This handles cases where the server might reject the logout but
        // the client still needs to reflect a logged-out state.
        if (error.message.includes("Auth session missing") || error.status === 403) {
          console.warn("Supabase signOut failed with session error or 403. Manually clearing local session.");
          // Clear Supabase-related items from local storage
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sb-')) { // Supabase keys usually start with 'sb-'
              localStorage.removeItem(key);
            }
          }
          // Force update AuthContext state to logged out
          setSession(null);
          setUser(null);
          console.log("Local session state cleared and AuthContext updated to logged out.");
        }
        throw error; // Re-throw the error for components to catch if needed
      } else {
        console.log("Supabase signOut successful.");
        // The onAuthStateChange listener should pick this up and update state,
        // but we can also proactively update for immediate feedback.
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Caught error in AuthContext logout:", error);
      // Ensure state is cleared even if an unexpected error occurs
      setSession(null);
      setUser(null);
      // Optionally, you could show a generic error toast here
    }
  };

  const value = {
    session,
    user,
    loading,
    logout, // Provide logout function
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};