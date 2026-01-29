import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Code, FileText, GitBranch } from "lucide-react";

const useCases = [
  {
    icon: Code,
    sketch: "Sketch an app idea",
    result: "get working code",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: FileText,
    sketch: "Scribble meeting notes",
    result: "get a clean summary",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: GitBranch,
    sketch: "Draw a fix",
    result: "update your codebase",
    color: "from-emerald-500/20 to-green-500/20",
  },
];

const UseCases = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % useCases.length);
    }, 4000);
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
        <div className="max-w-3xl mx-auto">
          <div className="relative h-64 md:h-72">
            <AnimatePresence mode="wait">
              {useCases.map(
                (useCase, index) =>
                  index === activeIndex && (
                    <motion.div
                      key={useCase.sketch}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <div
                        className={`h-full rounded-3xl border border-border bg-gradient-to-br ${useCase.color} backdrop-blur-sm p-8 md:p-12 flex flex-col items-center justify-center text-center`}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-card/80 flex items-center justify-center mb-6 border border-border">
                          <useCase.icon className="w-8 h-8 text-primary" />
                        </div>

                        <div className="text-2xl md:text-4xl font-medium">
                          <span className="font-handwriting text-primary">
                            {useCase.sketch}
                          </span>
                          <span className="mx-3 text-muted-foreground">→</span>
                          <span>{useCase.result}</span>
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
        <div className="hidden lg:grid grid-cols-3 gap-4 mt-16 max-w-4xl mx-auto">
          {useCases.map((useCase, index) => (
            <motion.button
              key={useCase.sketch}
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
              <useCase.icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm">
                <span className="font-handwriting text-primary">{useCase.sketch}</span>
                <span className="text-muted-foreground"> → </span>
                <span>{useCase.result}</span>
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
