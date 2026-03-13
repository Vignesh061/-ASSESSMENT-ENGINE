import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Eye,
  MousePointerClick,
  MessageSquareText,
  ArrowRight,
  Code2,
  Terminal,
  Sparkles,
  Zap,
  GraduationCap,
  BarChart2,
  BookOpen,
  Users,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "Auto Grading",
    description: "AI-powered evaluation of your HTML, CSS & JS code with instant scoring.",
    gradient: "from-purple-500 to-blue-500",
  },
  {
    icon: Eye,
    title: "Visual Comparison",
    description: "Compare your output with the expected design pixel by pixel.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: MousePointerClick,
    title: "Interactive Testing",
    description: "DOM, style, and interaction tests validate your code behavior.",
    gradient: "from-cyan-500 to-emerald-500",
  },
  {
    icon: MessageSquareText,
    title: "AI Feedback",
    description: "Get detailed feedback and suggestions to improve your code.",
    gradient: "from-pink-500 to-purple-500",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const LandingPage = () => {
  return (
    <div className="min-h-screen gradient-bg-animated">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-2xl">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
              <Code2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">AMYPO</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#courses" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Courses
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Animated background orbs */}
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[150px] float" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[130px] float" style={{ animationDelay: '-3s' }} />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[120px] float" style={{ animationDelay: '-1.5s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsla(262,83%,58%,0.05)_1px,transparent_1px),linear-gradient(90deg,hsla(262,83%,58%,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-primary/90 font-medium">AI-Powered Learning Platform</span>
            </motion.div>

            <h1 className="mx-auto max-w-5xl text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl lg:text-8xl">
              Learn Frontend{" "}
              <span className="gradient-text">Development</span>{" "}
              <br className="hidden sm:block" />
              with <span className="gradient-text-accent">AI Evaluation</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
            >
              Build real webpages. Get instant visual feedback. Master HTML, CSS & JavaScript
              with an AI that grades your code like a <span className="text-foreground font-medium">senior developer</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Link to="/trainer/login">
                <Button size="lg" className="gap-2 bg-primary px-10 text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 text-base h-12">
                  <GraduationCap className="h-4 w-4" />
                  Trainer Login
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="gap-2 border-border/50 px-10 text-foreground hover:bg-secondary hover:border-primary/30 transition-all duration-300 text-base h-12">
                  <Terminal className="h-4 w-4" />
                  Student Login
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="ghost" className="gap-2 border-transparent px-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 text-base h-12">
                  <ShieldCheck className="h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Code preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mx-auto mt-24 max-w-4xl"
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-4 font-mono text-xs text-muted-foreground">workspace.tsx</span>
              </div>
              <div className="p-6 font-mono text-sm leading-loose">
                <div className="text-muted-foreground">
                  <span className="text-primary">const</span>{" "}
                  <span className="text-accent">evaluate</span>{" "}
                  <span className="text-muted-foreground">= (</span>
                  <span className="text-warning">code</span>
                  <span className="text-muted-foreground">) =&gt; {"{"}</span>
                </div>
                <div className="ml-6 text-muted-foreground">
                  <span className="text-primary">const</span> result = <span className="text-accent">AI</span>.
                  <span className="text-success">grade</span>(code);
                </div>
                <div className="ml-6 text-muted-foreground">
                  <span className="text-primary">return</span>{" "}
                  <span className="text-foreground">{"{"} score, feedback, tests {"}"}</span>;
                </div>
                <div className="text-muted-foreground">{"};"}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Zap className="h-3 w-3" />
              FEATURES
            </div>
            <h2 className="text-4xl font-bold md:text-5xl">
              Everything you need to{" "}
              <span className="gradient-text">master frontend</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete learning environment powered by AI evaluation.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                className="group rounded-2xl border border-border/50 bg-card/50 p-7 backdrop-blur-sm card-hover"
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Courses preview */}
      <section id="courses" className="border-t border-border/30 py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl font-bold md:text-5xl">
              Structured <span className="gradient-text">learning paths</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From basics to advanced — progress at your own pace.
            </p>
          </motion.div>

          <div className="flex justify-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="group w-full max-w-2xl rounded-2xl border border-border/50 bg-card/50 p-10 text-center backdrop-blur-sm card-hover"
            >
              <h3 className="mb-3 text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
                Frontend Web Development
              </h3>
              <p className="text-sm text-muted-foreground mb-2">HTML + CSS + JavaScript • Beginner to Advanced</p>
              <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs text-muted-foreground">
                {["Level 1: Web Basics", "Level 2: Page Structure", "Level 3: Responsive Design", "Level 4: DOM & Interactivity", "Level 5: Advanced JS", "Level 6: Pro Skills", "Level 7: React.js"].map((lvl) => (
                  <span key={lvl} className="rounded-full border border-border/50 px-3 py-1 bg-secondary/50">{lvl}</span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-6">7 levels • 70+ lessons • Real-world projects</p>
              <Link to="/dashboard" className="inline-block">
                <Button variant="outline" size="sm" className="border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-300">
                  Explore
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
              <Code2 className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold gradient-text">AMYPO</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#courses" className="hover:text-foreground transition-colors">Courses</a>
            <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 AMYPO. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
