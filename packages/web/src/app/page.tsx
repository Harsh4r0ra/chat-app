'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import Chat from '../components/Chat';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white"
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return <Chat session={session} />;
}