"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { STEPS } from "@/lib/constants";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

export default function HowItWorksSection() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50 py-20 grainy">
      <div className="max-w-wrapper">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4"
          >
            Transfer in 4 simple steps
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-zinc-500 max-w-lg mx-auto"
          >
            The entire process takes under a minute. Your keypair is encrypted in your browser before it ever leaves your machine.
          </motion.p>
        </motion.div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i + 2}
              className="relative"
            >
              <div className="card h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">
                    {step.step}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    Step {step.step}
                  </span>
                </div>
                <step.icon className="w-7 h-7 text-indigo-500 mb-3" />
                <h3 className="text-base font-semibold text-zinc-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed flex-1">
                  {step.description}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-12 -right-4 text-zinc-300">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
