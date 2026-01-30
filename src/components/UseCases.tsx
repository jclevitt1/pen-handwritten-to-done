import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Import use case images
import architectureImg from "@/assets/usecase-architecture.png";
import budgetImg from "@/assets/usecase-budget.png";
import recordsImg from "@/assets/usecase-records.png";
import schoolImg from "@/assets/usecase-school.png";

const useCases = [
  {
    title: "Architecture Diagrams",
    sketch: "Draw a system design",
    result: "get live updates & code",
    image: architectureImg,
    color: "from-primary/20 to-amber-500/20",
  },
  {
    title: "Business Planning",
    sketch: "Sketch quarterly budget",
    result: "get structured plans",
    image: budgetImg,
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Record Keeping",
    sketch: "Organize your documents",
    result: "stay on top of everything",
    image: recordsImg,
    color: "from-emerald-500/20 to-green-500/20",
  },
  {
    title: "School Work",
    sketch: "Jot down study notes",
    result: "ace your assignments",
    image: schoolImg,
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
                        <div className="w-full md:w-1/2 h-40 md:h-full flex items-center justify-center overflow-hidden rounded-xl">
                          <img 
                            src={useCase.image} 
                            alt={useCase.title}
                            className="w-full h-full object-cover"
                          />
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
              <div className="h-16 mb-3 overflow-hidden rounded-lg">
                <img 
                  src={useCase.image} 
                  alt={useCase.title}
                  className="w-full h-full object-cover opacity-80"
                />
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
