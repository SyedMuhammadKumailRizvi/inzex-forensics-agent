"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate Supabase insert delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md panel p-8"
      >
        <h1 className="text-2xl font-bold mb-2">We value your feedback</h1>
        <p className="text-zinc-400 mb-8 text-sm">Help us improve the Inzex Forensics Platform.</p>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#9D00FF]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#9D00FF]/50">
              <Send className="h-8 w-8 text-[#9D00FF]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Feedback Sent!</h2>
            <p className="text-zinc-400 text-sm mb-8">Thank you for helping us shape the future of autonomous forensics.</p>
            <Button variant="outline" className="w-full" onClick={() => setIsSuccess(false)}>
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Email (Optional)</label>
              <Input type="email" placeholder="agent@inzex.ai" />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Your Message</label>
              <textarea 
                required
                className="w-full h-32 rounded-xl border border-[#202026] bg-[#0a0a0c]/80 px-4 py-3 text-sm text-[#FAFAFA] transition-all duration-300 placeholder:text-[#52525B] focus:border-[#9D00FF] focus:bg-[#121215] focus:outline-none focus:ring-1 focus:ring-[#9D00FF] resize-none"
                placeholder="What can we do better?"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              Submit Feedback
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
