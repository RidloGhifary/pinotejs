"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, MousePointer2 } from "lucide-react";

const comments = [
  { label: "1", className: "left-[34%] top-[28%]" },
  { label: "2", className: "right-[18%] top-[44%]" },
  { label: "3", className: "left-[23%] bottom-[24%]" },
];

export function ProductPreview() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      className="relative mx-auto w-full max-w-5xl"
      transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-blue-500/10 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-slate-950/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.035] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400/70" />
            <span className="h-3 w-3 rounded-full bg-yellow-300/70" />
            <span className="h-3 w-3 rounded-full bg-green-300/70" />
          </div>
          <div className="hidden rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-slate-400 sm:block">
            app.pinote.dev/review
          </div>
          <div className="h-6 w-20 rounded-full bg-white/[0.06]" />
        </div>

        <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[1fr_340px]">
          <div className="relative overflow-hidden p-5 sm:p-8">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <div className="mb-2 h-3 w-24 rounded-full bg-white/10" />
                <div className="h-7 w-48 rounded-lg bg-white/14" />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
                Review mode
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <div className="mb-4 h-36 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900" />
                <div className="space-y-3">
                  <div className="h-4 w-4/5 rounded-full bg-white/16" />
                  <div className="h-3 w-2/3 rounded-full bg-white/10" />
                  <div className="h-3 w-1/2 rounded-full bg-white/10" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-400/15 text-blue-200">
                      <MousePointer2 className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-24 rounded-full bg-white/16" />
                      <div className="h-2.5 w-32 rounded-full bg-white/8" />
                    </div>
                  </div>
                  <div className="h-24 rounded-xl border border-dashed border-white/12 bg-black/20" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="mb-3 h-3 w-28 rounded-full bg-white/14" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-16 rounded-xl bg-white/8" />
                    <div className="h-16 rounded-xl bg-white/8" />
                    <div className="h-16 rounded-xl bg-white/8" />
                  </div>
                </div>
              </div>
            </div>

            {comments.map((comment, index) => (
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                className={`absolute ${comment.className}`}
                key={comment.label}
                transition={{
                  delay: index * 0.45,
                  duration: 2.8,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-slate-950 bg-blue-400 text-xs font-bold text-slate-950 shadow-lg shadow-blue-500/30">
                  {comment.label}
                </div>
              </motion.div>
            ))}
          </div>

          <aside className="border-t border-white/10 bg-black/20 p-5 lg:border-l lg:border-t-0">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-200">
                  Comment thread
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">Hero CTA alignment</h3>
              </div>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-400/15 text-blue-200">
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-white">Maya Chen</p>
                    <p className="text-xs text-slate-500">Designer</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Can we move this CTA closer to the headline? The attachment stays
                  in place when the layout shifts.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-200 to-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-white">Ridlo</p>
                    <p className="text-xs text-slate-500">Developer</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-300">Updated and ready for review.</p>
              </div>
            </div>

            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
              <CheckCircle2 className="h-4 w-4" />
              Resolve comment
            </button>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
