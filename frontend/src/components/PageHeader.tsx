"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

/**
 * Consistent animated page header used across all transfer pages.
 */
export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl font-bold mb-3"
      >
        <span className="gradient-text">{title}</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-[var(--color-text-secondary)]"
      >
        {subtitle}
      </motion.p>
      {children}
    </div>
  );
}
