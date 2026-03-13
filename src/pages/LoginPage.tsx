import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { apiCreateStudent } from "@/lib/api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Register/login student via backend API
      const studentName = name.trim() || email.split("@")[0];
      const student = await apiCreateStudent(studentName, email);
      sessionStorage.setItem("amypo_student_id", student._id);
      sessionStorage.setItem("amypo_student_name", student.name);
      sessionStorage.setItem("amypo_student_email", student.email);
      navigate("/dashboard");
    } catch {
      // If backend is unavailable, still allow navigation (offline mode)
      sessionStorage.setItem("amypo_student_email", email);
      sessionStorage.setItem("amypo_student_name", name.trim() || email.split("@")[0]);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden gradient-bg-animated">
      {/* Background orbs */}
      <div className="absolute left-1/3 top-1/4 h-96 w-96 rounded-full bg-primary/15 blur-[130px] float" />
      <div className="absolute right-1/3 bottom-1/4 h-80 w-80 rounded-full bg-accent/15 blur-[110px] float" style={{ animationDelay: '-3s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl shadow-primary/10">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
              >
                <Code2 className="h-6 w-6 text-primary-foreground" />
              </motion.div>
            </Link>
            <h1 className="mt-5 text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your AMYPO account</p>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
              <Input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border/50 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary/50 transition-all duration-300"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-border/50 bg-secondary/30 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary/50 transition-all duration-300"
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-border/50 bg-secondary/30 pr-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary focus-visible:border-primary/50 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" className="border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                Remember me
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
            <span>
              Don't have an account?{" "}
              <Link to="/dashboard" className="text-primary hover:underline font-medium">
                Get started
              </Link>
            </span>
            <span className="text-xs text-muted-foreground/50">— or —</span>
            <Link to="/trainer/login" className="text-primary/80 hover:text-primary transition-colors flex items-center gap-1.5 text-sm font-medium">
              <Eye className="h-4 w-4" />
              Educator / Trainer Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
