import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

let authPromise = null;
let authInitialized = false;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const initAuth = async () => {
      if (authPromise) {
        const user = await authPromise;
        if (mountedRef.current) setUser(user);
        setLoading(false);
        return;
      }
      if (!authInitialized) {
        authInitialized = true;
        authPromise = (async () => {
          const { data: { session } } = await supabase.auth.getSession();
          return session?.user ?? null;
        })();
      }
      const currentUser = await authPromise;
      if (mountedRef.current) setUser(currentUser);
      setLoading(false);
    };
    
    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      if (mountedRef.current) setUser(newUser);
      if (newUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', newUser.id)
          .maybeSingle();
        if (mountedRef.current) setUserAvatar(userData?.avatar_url || null);
      } else {
        if (mountedRef.current) setUserAvatar(null);
      }
    });

    return () => {
      mountedRef.current = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userAvatar, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);