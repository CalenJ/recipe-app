// AuthProvider.tsx (FINAL CORRECTED VERSION)

import { createSignal, onMount, createContext, useContext, ParentProps, Accessor } from 'solid-js';
import { supabase } from '~/supabase/supabase-client'; 
import type { Session } from '@supabase/supabase-js'; // Use 'type' for cleaner imports


export interface AuthStore {
  session: Accessor<Session | null>; 
  loading: Accessor<boolean>;
}


const AuthContext = createContext<AuthStore | undefined>(undefined); 


export function AuthProvider(props: ParentProps) {
  const [session, setSession] = createSignal<Session | null>(null);
  const [loading, setLoading] = createSignal(true); 

  onMount(() => {

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); // <--- Use direct assignment
      setLoading(false);
    });


    // 2. Auth state change listener
    supabase.auth.onAuthStateChange((_event, newSession: Session | null) => { // <-- Explicitly type newSession
      setSession(newSession); // <--- Use direct assignment
      setLoading(false);
    });
  });

  const store: AuthStore = {
    session,
    loading
  };

  return (
    <AuthContext.Provider value={store}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthStore { 
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}