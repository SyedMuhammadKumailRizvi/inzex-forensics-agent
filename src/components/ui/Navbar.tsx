"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";

export function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 absolute top-0 left-0 right-0 z-50">
      <nav className="navbar flex justify-between items-center w-full rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Inzex Logo"
            width={32}
            height={32}
          />
          <span className="font-bold text-lg tracking-wide text-white">INZEX<span className="text-[#9D00FF]">.AI</span></span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href="/feedback" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">
            Feedback
          </Link>
          
          {session ? (
            <>
              <Link href="/history" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <button 
                onClick={handleSignOut}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Log In
            </Link>
          )}

          <Link href="/case-intake">
            <Button variant="primary" size="sm">
              Launch App
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
