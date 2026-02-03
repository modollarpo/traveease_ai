"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { puffyTap } from "@/lib/motion";

export function ConciergeAgentWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      setLoading(true);
      setReply(null);
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Agent request failed");
      }
      setReply(data.reply);
    } catch (err: any) {
      setReply(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="mb-3 w-80 max-w-[90vw] rounded-3xl bg-slate-900/95 p-4 text-xs text-slate-50 shadow-gummy ring-1 ring-white/10"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neo-mint text-traveease-blue text-sm">
                  🤝
                </span>
                <div>
                  <p className="text-[11px] font-semibold">Concierge Agent</p>
                  <p className="text-[10px] text-slate-300">
                    Ask anything about todays trip.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[10px] text-slate-400 hover:text-slate-100"
              >
                Close
              </button>
            </div>
            <div className="mb-2 rounded-2xl bg-black/40 p-2 text-[10px] text-slate-200">
              Try: My flight is delayed, re-optimise my afternoon in Nairobi.
            </div>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mb-2 w-full rounded-2xl border border-slate-700 bg-black/40 p-2 text-[11px] text-slate-50 placeholder:text-slate-400 focus:border-neo-mint focus:outline-none"
              placeholder="Type your request to the concierge agent…"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] text-slate-400">
                Behind the scenes, LangGraph agents call Amadeus, Treepz & vendors.
              </p>
              <motion.div {...puffyTap}>
                <Button
                  size="sm"
                  variant="primary"
                  className="gummy-button bg-neo-mint text-traveease-blue hover:bg-neo-mint/90 px-3 text-[11px]"
                  onClick={sendMessage}
                  disabled={loading}
                >
                  {loading ? "Thinking…" : "Send"}
                </Button>
              </motion.div>
            </div>
            {reply && (
              <div className="mt-2 space-y-2 rounded-2xl bg-black/40 p-2 text-[10px] text-slate-200">
                {reply.itinerary && (
                  <div>
                    <p className="mb-1 font-semibold">Proposed itinerary</p>
                    <p className="text-[10px] text-slate-300">
                      Status: {reply.itinerary.status ?? "pending"}
                    </p>
                  </div>
                )}
                {reply.prices && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(reply.prices).map(([ccy, amount]) => (
                      <span
                        key={ccy}
                        className="rounded-full bg-slate-800 px-2 py-1 text-[9px]"
                      >
                        {ccy}: {amount}
                      </span>
                    ))}
                  </div>
                )}
                {reply.visa && (
                  <div>
                    <p className="mb-1 font-semibold">Visa overview</p>
                    <p className="text-[10px] text-slate-300">
                      {reply.visa.eligible
                        ? "Eligible for e-visa or standard processing."
                        : "Additional visa checks may be required."}
                    </p>
                    {reply.visa.processing_time_days && (
                      <p className="text-[10px] text-slate-400">
                        Est. processing: {reply.visa.processing_time_days} days
                      </p>
                    )}
                    {reply.visa.visa_fee && reply.visa.currency && (
                      <p className="text-[10px] text-slate-400">
                        Approx. visa fee: {reply.visa.visa_fee} {reply.visa.currency}
                      </p>
                    )}
                  </div>
                )}
                {reply.approval_required && (
                  <p className="text-[9px] text-heritage-clay">
                    Human approval required before we confirm any changes.
                  </p>
                )}
                {!reply.itinerary && !reply.prices && (
                  <pre className="whitespace-pre-wrap text-[9px] text-slate-200">
                    {JSON.stringify(reply, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        {...puffyTap}
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-neo-mint text-traveease-blue shadow-gummy focus:outline-none"
      >
        <span className="text-xl">💬</span>
      </motion.button>
    </div>
  );
}
