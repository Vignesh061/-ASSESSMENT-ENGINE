import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, Eye, EyeOff, Loader2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginTrainer,
  registerTrainer,
  getTrainerSession,
  ensureDefaultTrainer,
} from "@/lib/trainerAuth";
import { seedIfNeeded } from "@/lib/trainerStore";

const TrainerLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("admin@amypo.com");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("amypo123");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ensureDefaultTrainer();
    seedIfNeeded();
    if (getTrainerSession()) navigate("/trainer");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const res = await loginTrainer(email, password);
        if (res.success) navigate("/trainer");
        else setError(res.message);
      } else {
        if (password !== confirm) {
          setError("Passwords do not match.");
          return;
        }
        const res = await registerTrainer(email, name, password);
        if (res.success) {
          await loginTrainer(email, password);
          navigate("/trainer");
        } else setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg-animated flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-8 text-center border-b border-border/50">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Trainer Portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">AMYPO · Educator Access</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {/* Mode toggle */}
            <div className="mb-6 flex rounded-lg border border-border/50 p-1 bg-secondary/30">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-border/50 bg-secondary/30"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="trainer@amypo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border/50 bg-secondary/30"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-border/50 bg-secondary/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="border-border/50 bg-secondary/30"
                  />
                </div>
              )}

              {error && (
                <p className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Code2 className="h-4 w-4" />
                )}
                {mode === "login" ? "Sign in to Dashboard" : "Create Account"}
              </Button>
            </form>

            {mode === "login" && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Default: <span className="text-foreground font-mono">admin@amypo.com</span> /{" "}
                <span className="text-foreground font-mono">amypo123</span>
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Student?{" "}
          <a href="/login" className="text-primary hover:underline">
            Go to Student Login →
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default TrainerLogin;
