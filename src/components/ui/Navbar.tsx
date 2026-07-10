"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";

export function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

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
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Hide the global navbar on the case intake page
  if (pathname === '/case-intake') {
    return null;
  }

  return (
    <>
      <div className="h-24 w-full shrink-0 hide-on-print" aria-hidden="true" />
      <div className="fixed top-0 left-0 right-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 z-50 hide-on-print">
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
            <div className="relative">
              <button 
                onClick={() => {
                  const dropdown = document.getElementById('profile-dropdown');
                  if (dropdown) dropdown.classList.toggle('hidden');
                }}
                className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/20 transition-all focus:outline-none overflow-hidden"
              >
                <span className="sr-only">Open user menu</span>
                {session.user.user_metadata?.avatar_url ? (
                  <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>

              {/* Dropdown Menu */}
              <div 
                id="profile-dropdown" 
                className="hidden absolute right-0 mt-2 w-48 rounded-xl bg-[#121215] border border-white/10 shadow-2xl overflow-hidden py-1"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm text-zinc-300 truncate">{session.user.email}</p>
                </div>
                <Link 
                  href="/history" 
                  className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => document.getElementById('profile-dropdown')?.classList.add('hidden')}
                >
                  History
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
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
    </>
  );
}
