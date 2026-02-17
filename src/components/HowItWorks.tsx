import { motion, type Variants } from "framer-motion";
import { FolderUp, Pencil, Brain, Zap } from "lucide-react";

// Parent variant triggers children when in view
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

// Reusable child variants — animated when parent enters viewport
const drawVariant: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (custom: { duration?: number; delay?: number } = {}) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: custom.duration ?? 0.8, delay: custom.delay ?? 0 },
  }),
};

const drawPathOnly: Variants = {
  hidden: { pathLength: 0 },
  visible: (custom: { duration?: number; delay?: number } = {}) => ({
    pathLength: 1,
    transition: { duration: custom.duration ?? 0.8, delay: custom.delay ?? 0 },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { delay?: number; opacity?: number } = {}) => ({
    opacity: custom.opacity ?? 1,
    transition: { delay: custom.delay ?? 0 },
  }),
};

const scaleIn: Variants = {
  hidden: { scale: 0 },
  visible: (custom: { delay?: number } = {}) => ({
    scale: 1,
    transition: { delay: custom.delay ?? 0 },
  }),
};

const scaleOpacity: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (custom: { duration?: number } = {}) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: custom.duration ?? 0.6 },
  }),
};

const scaleXIn: Variants = {
  hidden: { scaleX: 0 },
  visible: (custom: { delay?: number } = {}) => ({
    scaleX: 1,
    transition: { delay: custom.delay ?? 0 },
  }),
};

const floatIn: Variants = {
  hidden: (custom: { startY?: number } = {}) => ({ y: custom.startY ?? -20, opacity: 0 }),
  visible: (custom: { endY?: number; endOpacity?: number; delay?: number; duration?: number } = {}) => ({
    y: custom.endY ?? 0,
    opacity: custom.endOpacity ?? 0.5,
    transition: { delay: custom.delay ?? 0, duration: custom.duration ?? 0.4 },
  }),
};

const scaleOpacityRect: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
};

const steps = [
  {
    icon: FolderUp,
    title: "Upload or start new",
    description: "Create a new project or drop in any folder from your computer. Code, documents, whatever you've got.",
    visual: (
      <svg viewBox="0 0 200 120" className="w-full h-32 stroke-primary fill-none" strokeWidth="2">
        {/* Folder base */}
        <motion.path
          d="M30 45 L30 95 L170 95 L170 45 L100 45 L90 35 L40 35 L30 45 Z"
          variants={drawVariant}
          custom={{ duration: 0.8 }}
        />
        {/* Upload arrow */}
        <motion.path
          d="M100 85 L100 55"
          variants={drawPathOnly}
          custom={{ duration: 0.4, delay: 0.6 }}
          strokeWidth="3"
        />
        <motion.path
          d="M85 70 L100 55 L115 70"
          variants={drawPathOnly}
          custom={{ duration: 0.3, delay: 0.9 }}
          strokeWidth="3"
        />
        {/* Small files floating in */}
        <motion.rect
          x="50" y="15" width="20" height="25" rx="2"
          variants={floatIn}
          custom={{ startY: -20, endY: 15, endOpacity: 0.5, delay: 1.1, duration: 0.4 }}
        />
        <motion.rect
          x="130" y="10" width="20" height="25" rx="2"
          variants={floatIn}
          custom={{ startY: -20, endY: 10, endOpacity: 0.5, delay: 1.3, duration: 0.4 }}
        />
      </svg>
    ),
  },
  {
    icon: Pencil,
    title: "Write",
    description: "Sketch ideas with Apple Pencil, jot notes, or describe what you need.",
    visual: (
      <svg viewBox="0 0 200 120" className="w-full h-32 stroke-primary fill-none" strokeWidth="2">
        <motion.path
          d="M20 80 Q40 30, 80 60 T140 40 T180 70"
          variants={drawPathOnly}
          custom={{ duration: 1.5 }}
        />
        <motion.circle
          cx="30" cy="75" r="4"
          variants={scaleIn}
          custom={{ delay: 0.5 }}
          className="fill-primary"
        />
        <motion.circle
          cx="100" cy="50" r="4"
          variants={scaleIn}
          custom={{ delay: 0.8 }}
          className="fill-primary"
        />
        <motion.circle
          cx="170" cy="65" r="4"
          variants={scaleIn}
          custom={{ delay: 1.1 }}
          className="fill-primary"
        />
      </svg>
    ),
  },
  {
    icon: Brain,
    title: "Pen understands",
    description: "It reads your handwriting, sees your files, and figures out what you need.",
    visual: (
      <svg viewBox="0 0 200 120" className="w-full h-32 stroke-primary fill-none" strokeWidth="2">
        <motion.circle
          cx="100" cy="60" r="35"
          variants={scaleOpacity}
          custom={{ duration: 0.6 }}
          strokeDasharray="4 4"
        />
        <motion.path
          d="M70 45 L90 65 L130 40"
          variants={drawPathOnly}
          custom={{ duration: 0.8, delay: 0.4 }}
        />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.line
            key={angle}
            x1={100 + 45 * Math.cos((angle * Math.PI) / 180)}
            y1={60 + 45 * Math.sin((angle * Math.PI) / 180)}
            x2={100 + 55 * Math.cos((angle * Math.PI) / 180)}
            y2={60 + 55 * Math.sin((angle * Math.PI) / 180)}
            variants={fadeIn}
            custom={{ delay: 0.6 + i * 0.1, opacity: 0.5 }}
          />
        ))}
      </svg>
    ),
  },
  {
    icon: Zap,
    title: "It's done",
    description: "Meeting notes become action items. Sketches become working code. Edits get applied. Whatever makes sense.",
    visual: (
      <svg viewBox="0 0 200 120" className="w-full h-32 stroke-primary fill-none" strokeWidth="2">
        <motion.rect
          x="40" y="20" width="120" height="80" rx="8"
          variants={scaleOpacityRect}
        />
        <motion.line
          x1="55" y1="45" x2="95" y2="45"
          variants={scaleXIn}
          custom={{ delay: 0.3 }}
          className="stroke-primary/60"
        />
        <motion.line
          x1="55" y1="60" x2="145" y2="60"
          variants={scaleXIn}
          custom={{ delay: 0.5 }}
          className="stroke-primary/60"
        />
        <motion.line
          x1="55" y1="75" x2="120" y2="75"
          variants={scaleXIn}
          custom={{ delay: 0.7 }}
          className="stroke-primary/60"
        />
        <motion.path
          d="M150 85 L158 93 L175 70"
          variants={drawPathOnly}
          custom={{ delay: 0.9, duration: 0.4 }}
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
          <h2 className="text-3xl md:text-5xl font-bold mb-4 pb-1">
            How it <span className="font-handwriting text-gradient">works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-4">
            From notes to done.
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Bring your own projects, documents, or start fresh. Pen works with what you already have.
          </p>
        </motion.div>

        {/* Context note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto px-4 py-3 rounded-full border border-border bg-card/50 inline-block">
            From notes → execution. You may upload any existing project you want Pen to work on, and select it from your notes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.15 }}
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
