import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, BookOpen, Loader2, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api, Textbook } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Textbooks = () => {
  const { isSignedIn, getToken } = useAuth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Request form state
  const [requestTitle, setRequestTitle] = useState('');
  const [requestAuthor, setRequestAuthor] = useState('');
  const [requestCourse, setRequestCourse] = useState('');

  // Set up API token getter if signed in (textbooks endpoint works either way)
  useEffect(() => {
    if (isSignedIn) {
      api.setTokenGetter(() => getToken());
    }
  }, [isSignedIn, getToken]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch textbooks — always enabled, no auth required
  const { data, isLoading, error } = useQuery({
    queryKey: ['textbooks', debouncedSearch],
    queryFn: () => api.listTextbooks(debouncedSearch || undefined),
    retry: false,
  });

  const textbooks = data?.textbooks ?? [];

  const handleRequestSubmit = () => {
    const subject = encodeURIComponent(`Textbook Request: ${requestTitle}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to request support for the following textbook:\n\n` +
      `Title: ${requestTitle}\n` +
      `Author: ${requestAuthor}\n` +
      `Course: ${requestCourse}\n\n` +
      `Thanks!`
    );
    window.location.href = `mailto:jeremy@usepen.dev?subject=${subject}&body=${body}`;
  };

  const requestFormReady = requestTitle.trim().length > 0;

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-background to-background" />
          <div className="container px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-sm uppercase tracking-wider text-purple-400 mb-4 block">
                Textbook catalog
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Supported{' '}
                <span className="font-handwriting text-gradient">Textbooks</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect your textbook to your coursework. Pen reads your notes in the context of what you're studying
                and helps you understand, solve problems, and complete assignments.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search + Results */}
        <section className="pb-20 md:pb-28">
          <div className="container px-6 max-w-4xl mx-auto">
            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mb-10 max-w-lg mx-auto"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl"
              />
            </motion.div>

            {/* Results */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold mb-2">Unable to load textbooks</h2>
                <p className="text-muted-foreground">Please try again later.</p>
              </div>
            ) : textbooks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold mb-2">
                  {debouncedSearch ? 'No textbooks match your search' : 'No textbooks available yet'}
                </h2>
                <p className="text-muted-foreground">
                  {debouncedSearch
                    ? 'Try a different search term, or request it below.'
                    : 'Check back soon, or request your textbook below.'}
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {textbooks.map((textbook, index) => (
                  <TextbookCard key={textbook.textbook_id} textbook={textbook} index={index} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Request a Textbook */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="container px-6 relative z-10 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Don't see your textbook?
              </h2>
              <p className="text-muted-foreground">
                Let us know what you're studying and we'll work on adding it.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-1.5 block">Textbook title *</label>
                <Input
                  placeholder="e.g. Calculus: Early Transcendentals"
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Author</label>
                <Input
                  placeholder="e.g. James Stewart"
                  value={requestAuthor}
                  onChange={(e) => setRequestAuthor(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Course name</label>
                <Input
                  placeholder="e.g. MATH 150 - Calculus I"
                  value={requestCourse}
                  onChange={(e) => setRequestCourse(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                disabled={!requestFormReady}
                onClick={handleRequestSubmit}
              >
                <Mail className="w-4 h-4 mr-2" />
                Request this textbook
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const TextbookCard = ({ textbook, index }: { textbook: Textbook; index: number }) => {
  const subjectColors: Record<string, string> = {
    mathematics: 'bg-blue-500/10 text-blue-400',
    science: 'bg-green-500/10 text-green-400',
    english: 'bg-yellow-500/10 text-yellow-400',
    history: 'bg-orange-500/10 text-orange-400',
    'computer science': 'bg-purple-500/10 text-purple-400',
  };

  const colorClass = subjectColors[textbook.subject.toLowerCase()] || 'bg-muted text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-lg mb-1">{textbook.title}</h3>
          {textbook.author && (
            <p className="text-sm text-muted-foreground mb-3">by {textbook.author}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {textbook.subject && (
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${colorClass}`}>
                {textbook.subject}
              </span>
            )}
            {textbook.edition && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {textbook.edition}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {textbook.chapter_count} chapters
            </span>
            <span className="text-xs text-muted-foreground">
              {textbook.section_count} sections
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Textbooks;
