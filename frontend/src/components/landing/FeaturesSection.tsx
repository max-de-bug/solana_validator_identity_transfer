"use client";

import { motion, Variants } from "framer-motion";
import { FEATURES } from "@/lib/constants";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

export default function FeaturesSection() {
  return (
    <section className="border-t border-zinc-200 py-20">
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
            Security First
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-zinc-500 max-w-lg mx-auto"
          >
            Every layer of ValidatorShift is designed with security as the primary concern.
            Your keys are yours — always.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={index + 2}
              className="card group"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{
                  background: `${feature.color}15`,
                }}
              >
                <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
