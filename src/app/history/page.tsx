import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Lock, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let cases: any[] = [];
  if (user) {
    const { data } = await supabase
      .from("cases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    cases = data || [];
  }

  return (
    <div className="app relative">
      <nav className="navbar mb-12 rounded-2xl flex items-center gap-6">
        <Link href="/case-intake">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Intake
          </Button>
        </Link>
        <div className="h-6 w-px bg-white/10" />
        <h1 className="text-xl font-medium tracking-tight text-white m-0">Case History</h1>
      </nav>

      {!user ? (
        <div className="relative panel min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Blurred Fake Data Background */}
          <div className="absolute inset-0 p-8 blur-sm opacity-30 pointer-events-none grid gap-4 select-none">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-white/5 border border-white/10 w-full" />
            ))}
          </div>

          <div className="relative z-10 text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-[#9D00FF]/10 flex items-center justify-center mx-auto mb-6 border border-[#9D00FF]/30">
              <Lock className="h-8 w-8 text-[#9D00FF]" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Secure History Locked</h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Create a free account to securely save your memory analysis results, access past IOCs, and track your investigation history.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button variant="primary">Sign In / Register</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel min-h-[500px]">
          {cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Database className="h-8 w-8 text-zinc-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Cases Found</h2>
              <p className="text-zinc-500 max-w-sm mb-6">
                You haven't run any memory analysis jobs yet. Your completed investigations will appear here.
              </p>
              <Link href="/case-intake">
                <Button variant="primary">Start Investigation</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {cases.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-[#202026] bg-white/5 hover:border-[#9D00FF]/50 transition-colors flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-white">{c.case_name}</h3>
                    <p className="text-sm text-zinc-400">Ref: {c.reference_id} • OS: {c.os_profile}</p>
                  </div>
                  <Button variant="outline" size="sm">View Report</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
