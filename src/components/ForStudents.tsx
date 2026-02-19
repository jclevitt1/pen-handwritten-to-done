import { motion } from "framer-motion";
import { BookOpen, BrainCircuit, PenLine } from "lucide-react";

const ForStudents = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-500/5 to-background" />

      <div className="container px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm uppercase tracking-wider text-purple-400 mb-4 block">
            For students
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Your notes, your textbook,{" "}
            <span className="font-handwriting text-gradient">your tutor</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect your textbook to your coursework. The moment you take notes, Pen is already helping you understand, solve, and study.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-11 max-w-5xl mx-auto">
          {[
            {
              icon: BookOpen,
              title: "Connect your textbook",
              description:
                "Upload your course materials. Pen reads your notes in context of what you're actually studying, and helps you work through assignments.",
            },
            {
              icon: PenLine,
              title: "Take notes like normal",
              description:
                "Write in lecture, jot during study sessions. Pen picks up where you left off. No extra steps.",
            },
            {
              icon: BrainCircuit,
              title: "Get help immediately",
              description:
                "Confused by a concept? Stuck on a problem? Pen clarifies, solves, and builds study guides from your own handwriting.",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 text-center transition-all duration-300 hover:border-purple-500/30"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5 mx-auto">
                <item.icon className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ForStudents;
