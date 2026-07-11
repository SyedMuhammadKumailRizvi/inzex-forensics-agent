import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, Lock, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function HistoryPage() {
  const supabase = await createClient();

  // For the Hackathon Demo, we bypass auth and show all cases
  const { data } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });
  const cases = data || [];

  return (
    <div className="app relative min-h-screen">
      <nav className="navbar mb-12 rounded-2xl flex items-center gap-6">
        <Link href="/case-intake">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Intake
          </Button>
        </Link>
        <div className="h-6 w-px bg-white/10" />
        <h1 className="text-xl font-medium tracking-tight text-white m-0">Global Case History (Demo Mode)</h1>
      </nav>

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
              <div key={c.id} className="p-5 rounded-xl border border-[#202026] bg-white/5 hover:border-[#9D00FF]/50 transition-colors flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">{c.case_designation}</h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                    <span className="bg-white/5 px-2 py-1 rounded">Ref: {c.reference_id || 'N/A'}</span>
                    <span className="bg-white/5 px-2 py-1 rounded">Status: {c.status}</span>
                    <span className="bg-white/5 px-2 py-1 rounded">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <Link href={`/workspace/${c.id}?view=report`}>
                  <Button variant="outline" size="sm">View Workspace</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
