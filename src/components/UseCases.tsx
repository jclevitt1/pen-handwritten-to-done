import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// SVG illustrations for each use case
const ArchitectureDiagram = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Main boxes */}
    <rect x="70" y="10" width="60" height="25" rx="4" className="fill-primary/20 stroke-primary" />
    <text x="100" y="26" textAnchor="middle" className="fill-primary text-[8px] font-handwriting">Frontend</text>
    
    <rect x="20" y="70" width="50" height="25" rx="4" className="fill-blue-500/20 stroke-blue-400" />
    <text x="45" y="86" textAnchor="middle" className="fill-blue-400 text-[8px] font-handwriting">API</text>
    
    <rect x="130" y="70" width="50" height="25" rx="4" className="fill-emerald-500/20 stroke-emerald-400" />
    <text x="155" y="86" textAnchor="middle" className="fill-emerald-400 text-[8px] font-handwriting">Database</text>
    
    {/* Connecting lines with arrows */}
    <path d="M85 35 L50 70" className="stroke-muted-foreground" strokeDasharray="4 2" />
    <path d="M115 35 L150 70" className="stroke-muted-foreground" strokeDasharray="4 2" />
    <path d="M70 82 L130 82" className="stroke-muted-foreground" strokeDasharray="4 2" />
    
    {/* Handwritten annotation */}
    <text x="100" y="55" textAnchor="middle" className="fill-primary/70 text-[7px] font-handwriting">REST calls</text>
  </svg>
);

const BudgetDiagram = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Pie chart */}
    <circle cx="60" cy="60" r="40" className="fill-card stroke-border" />
    <path d="M60 60 L60 20 A40 40 0 0 1 94 40 Z" className="fill-primary/60 stroke-primary" />
    <path d="M60 60 L94 40 A40 40 0 0 1 85 95 Z" className="fill-blue-500/40 stroke-blue-400" />
    <path d="M60 60 L85 95 A40 40 0 0 1 35 95 Z" className="fill-emerald-500/40 stroke-emerald-400" />
    
    {/* Labels */}
    <text x="130" y="30" className="fill-primary text-[8px] font-handwriting">Marketing 35%</text>
    <text x="130" y="50" className="fill-blue-400 text-[8px] font-handwriting">Product 40%</text>
    <text x="130" y="70" className="fill-emerald-400 text-[8px] font-handwriting">Ops 25%</text>
    
    {/* Title */}
    <text x="100" y="110" textAnchor="middle" className="fill-muted-foreground text-[9px] font-handwriting">Q2 Budget Focus</text>
  </svg>
);

const RecordKeepingDiagram = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Folder stack */}
    <rect x="30" y="20" width="60" height="45" rx="3" className="fill-primary/20 stroke-primary" />
    <path d="M30 30 L45 30 L50 20 L90 20" className="stroke-primary" />
    <text x="60" y="50" textAnchor="middle" className="fill-primary text-[8px] font-handwriting">Invoices</text>
    
    <rect x="110" y="20" width="60" height="45" rx="3" className="fill-blue-500/20 stroke-blue-400" />
    <path d="M110 30 L125 30 L130 20 L170 20" className="stroke-blue-400" />
    <text x="140" y="50" textAnchor="middle" className="fill-blue-400 text-[8px] font-handwriting">Contracts</text>
    
    {/* Checklist */}
    <rect x="70" y="75" width="60" height="35" rx="3" className="fill-emerald-500/10 stroke-emerald-400" />
    <path d="M80 85 L85 90 L95 80" className="stroke-emerald-400" strokeWidth="2" />
    <line x1="100" y1="85" x2="120" y2="85" className="stroke-muted-foreground" />
    <path d="M80 100 L85 105 L95 95" className="stroke-emerald-400" strokeWidth="2" />
    <line x1="100" y1="100" x2="120" y2="100" className="stroke-muted-foreground" />
  </svg>
);

const SchoolWorkDiagram = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Notebook */}
    <rect x="20" y="15" width="70" height="90" rx="3" className="fill-card stroke-border" />
    <line x1="35" y1="15" x2="35" y2="105" className="stroke-primary/30" />
    
    {/* Handwritten notes */}
    <path d="M40 30 Q55 28 70 32" className="stroke-muted-foreground" strokeWidth="1" />
    <path d="M40 42 Q60 40 80 44" className="stroke-muted-foreground" strokeWidth="1" />
    <path d="M40 54 Q50 52 65 55" className="stroke-primary" strokeWidth="1" />
    <text x="42" y="70" className="fill-primary text-[7px] font-handwriting">E = mc²</text>
    <path d="M40 80 Q55 78 75 82" className="stroke-muted-foreground" strokeWidth="1" />
    
    {/* Grade circle */}
    <circle cx="150" cy="40" r="25" className="fill-emerald-500/20 stroke-emerald-400" />
    <text x="150" y="46" textAnchor="middle" className="fill-emerald-400 text-[16px] font-bold">A+</text>
    
    {/* Arrow */}
    <path d="M100 50 L120 45" className="stroke-primary" strokeWidth="2" markerEnd="url(#arrowhead)" />
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" className="fill-primary" />
      </marker>
    </defs>
    
    {/* Caption */}
    <text x="150" y="85" textAnchor="middle" className="fill-muted-foreground text-[8px] font-handwriting">Instant feedback</text>
  </svg>
);

const useCases = [
  {
    title: "Architecture Diagrams",
    sketch: "Draw a system design",
    result: "get live updates & code",
    Illustration: ArchitectureDiagram,
    color: "from-primary/20 to-amber-500/20",
  },
  {
    title: "Business Planning",
    sketch: "Sketch quarterly budget",
    result: "get structured plans",
    Illustration: BudgetDiagram,
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Record Keeping",
    sketch: "Organize your documents",
    result: "stay on top of everything",
    Illustration: RecordKeepingDiagram,
    color: "from-emerald-500/20 to-green-500/20",
  },
  {
    title: "School Work",
    sketch: "Jot down study notes",
    result: "ace your assignments",
    Illustration: SchoolWorkDiagram,
    color: "from-purple-500/20 to-pink-500/20",
  },
];

const UseCases = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % useCases.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="use-cases" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />

      <div className="container px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Turn <span className="font-handwriting text-gradient">anything</span> into action
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Whatever you write, Pen makes it real.
          </p>
        </motion.div>

        {/* Rotating showcase */}
        <div className="max-w-4xl mx-auto">
          <div className="relative h-80 md:h-96">
            <AnimatePresence mode="wait">
              {useCases.map(
                (useCase, index) =>
                  index === activeIndex && (
                    <motion.div
                      key={useCase.title}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <div
                        className={`h-full rounded-3xl border border-border bg-gradient-to-br ${useCase.color} backdrop-blur-sm p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10`}
                      >
                        {/* Illustration */}
                        <div className="w-full md:w-1/2 h-40 md:h-full flex items-center justify-center">
                          <div className="w-full max-w-xs h-full text-foreground">
                            <useCase.Illustration />
                          </div>
                        </div>

                        {/* Text content */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                            {useCase.title}
                          </span>
                          <div className="text-xl md:text-3xl font-medium">
                            <span className="font-handwriting text-primary">
                              {useCase.sketch}
                            </span>
                            <span className="block mt-2 text-muted-foreground">→</span>
                            <span className="block mt-2">{useCase.result}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {useCases.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-8 bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* All use cases grid (visible on larger screens) */}
        <div className="hidden lg:grid grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <motion.button
              key={useCase.title}
              onClick={() => setActiveIndex(index)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                index === activeIndex
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card/50 hover:border-primary/30"
              }`}
            >
              <div className="h-16 mb-3 text-foreground opacity-70">
                <useCase.Illustration />
              </div>
              <p className="text-xs font-medium text-primary mb-1">{useCase.title}</p>
              <p className="text-xs text-muted-foreground">
                {useCase.sketch} → {useCase.result}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
