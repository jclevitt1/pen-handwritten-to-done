import { motion } from "framer-motion";
import { Pencil, Brain, Zap } from "lucide-react";

const steps = [
  {
    icon: Pencil,
    title: "Write anything",
    description: "Sketch your idea, jot a note, draw a diagram. Use your natural handwriting.",
    visual: (
      <svg viewBox="0 0 200 120" className="w-full h-32 stroke-primary fill-none" strokeWidth="2">
        <motion.path
          d="M20 80 Q40 30, 80 60 T140 40 T180 70"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.circle
          cx="30" cy="75" r="4"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="fill-primary"
        />
        <motion.circle
          cx="100" cy="50" r="4"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="fill-primary"
        />
        <motion.circle
          cx="170" cy="65" r="4"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.1 }}
          className="fill-primary"
        />
      </svg>
    ),
  },
  {
    icon: Brain,
    title: "AI understands",
    description: "It reads your handwriting and figures out exactly what you need.",
    visual: (
      <svg viewBox="0 0 200 120" className="w-full h-32 stroke-primary fill-none" strokeWidth="2">
        <motion.circle
          cx="100" cy="60" r="35"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          strokeDasharray="4 4"
        />
        <motion.path
          d="M70 45 L90 65 L130 40"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.line
            key={angle}
            x1={100 + 45 * Math.cos((angle * Math.PI) / 180)}
            y1={60 + 45 * Math.sin((angle * Math.PI) / 180)}
            x2={100 + 55 * Math.cos((angle * Math.PI) / 180)}
            y2={60 + 55 * Math.sin((angle * Math.PI) / 180)}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.1 }}
          />
        ))}
      </svg>
    ),
  },
  {
    icon: Zap,
    title: "It's done",
    description: "Code generated. Notes summarized. Project updated. Like magic.",
    visual: (
      <svg viewBox="0 0 200 120" className="w-full h-32 stroke-primary fill-none" strokeWidth="2">
        <motion.rect
          x="40" y="20" width="120" height="80" rx="8"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        />
        <motion.line
          x1="55" y1="45" x2="95" y2="45"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="stroke-primary/60"
        />
        <motion.line
          x1="55" y1="60" x2="145" y2="60"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="stroke-primary/60"
        />
        <motion.line
          x1="55" y1="75" x2="120" y2="75"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="stroke-primary/60"
        />
        <motion.path
          d="M150 85 L158 93 L175 70"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="stroke-primary"
          strokeWidth="3"
        />
      </svg>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 relative">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How it <span className="font-handwriting text-gradient">works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            From sketch to solution in seconds.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative"
            >
              <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 h-full transition-all duration-300 hover:border-primary/30 hover:bg-card">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Visual */}
                <div className="mb-6">{step.visual}</div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
