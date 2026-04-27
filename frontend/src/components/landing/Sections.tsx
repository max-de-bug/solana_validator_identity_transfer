"use client";

import { motion, Variants } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { FeatureItem, StepItem } from "@/lib/constants";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

/* ─── Section Header ─── */
interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="text-center mb-16"
    >
      <motion.h2
        variants={fadeUp}
        custom={0}
        className="text-3xl sm:text-4xl font-bold mb-4"
      >
        {title}
      </motion.h2>
      <motion.p
        variants={fadeUp}
        custom={1}
        className="text-[var(--color-text-secondary)] max-w-lg mx-auto"
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}

/* ─── Step Card ─── */
interface StepCardProps {
  step: StepItem;
  index: number;
  isLast: boolean;
}

export function StepCard({ step, index, isLast }: StepCardProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUp}
      custom={index + 2}
      className="relative"
    >
      <div className="card h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="step-indicator step-active">{step.step}</div>
          {!isLast && (
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] hidden lg:block absolute -right-3 top-8" />
          )}
        </div>
        <step.icon className="w-8 h-8 text-[#6366f1] mb-3" />
        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Feature Card ─── */
interface FeatureCardProps {
  feature: FeatureItem;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeUp}
      custom={index}
      className="card group"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{
          background: `${feature.color}15`,
          border: `1px solid ${feature.color}30`,
        }}
      >
        <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}
