// hooks/useUser.js
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

export function useUser() {
  const [user, setUser] = useState(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const getSession = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      fetchingRef.current = false;
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  return user;
}