import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Terminal, Mail, Lock, User, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

type S = { mode?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): S => ({ mode: typeof s.mode === "string" ? s.mode : undefined }),
  component: Auth,
});

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const chars = "アァカサタナハマヤラワABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]<>$#@!*&".split("");
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array(columns).fill(1);
    const draw = () => {
      ctx.fillStyle = "rgba(5, 12, 8, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#22ff88";
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    const id = window.setInterval(draw, 50);
    return () => { window.clearInterval(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

function Auth() {
  const { mode } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(mode === "signup" ? "signup" : "signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Access granted!");
    navigate({ to: "/" });
  };
  const signUp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: name } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — logging you in...");
    const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
    if (!e2) navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* LEFT — animated matrix terminal */}
        <div className="relative hidden overflow-hidden border-r border-primary/30 bg-[#050c08] lg:block">
          <MatrixRain />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#050c08]/60 to-[#050c08]" />
          <div className="absolute inset-0 flex flex-col justify-between p-10">
            <Link to="/" className="flex items-center gap-2 text-primary">
              <img src={logo} alt="Wikiservices" className="h-9 w-9 rounded-md" />
              <span className="font-mono text-lg font-bold tracking-wider">WIKISERVICES</span>
            </Link>

            <div className="space-y-6">
              <div className="rounded-lg border border-primary/40 bg-black/60 p-5 font-mono text-sm shadow-[0_0_30px_rgba(34,255,136,0.15)] backdrop-blur">
                <div className="mb-3 flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-muted-foreground">~ wikiservices/auth.sh</span>
                </div>
                <p className="text-primary">$ initializing secure tunnel...</p>
                <p className="text-primary/80">$ encryption: <span className="text-foreground">AES-256</span></p>
                <p className="text-primary/80">$ status: <span className="text-foreground">ready</span></p>
                <p className="mt-2 text-primary">
                  $ awaiting credentials<span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary align-middle" />
                </p>
              </div>

              <div>
                <h2 className="font-mono text-3xl font-bold leading-tight text-foreground">
                  &gt; Access the <span className="text-gradient">Network</span>
                </h2>
                <p className="mt-2 max-w-md font-mono text-sm text-muted-foreground">
                  Premium WiFi gear, blazing fast checkout. Login to track orders & unlock member pricing.
                </p>
              </div>
            </div>

            <div className="flex gap-6 font-mono text-xs text-muted-foreground">
              <span>&gt; uptime: 99.9%</span>
              <span>&gt; encrypted: yes</span>
              <span>&gt; trusted by 10k+</span>
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="relative flex items-center justify-center px-4 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
              <img src={logo} alt="Wikiservices" className="h-8 w-8 rounded-md" />
              <span className="font-mono font-bold">WIKISERVICES</span>
            </Link>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
              <Terminal className="h-3 w-3" /> secure_login.exe
            </div>
            <h1 className="font-mono text-3xl font-bold tracking-tight">
              {tab === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "signin" ? "Enter credentials to continue" : "Join Wikiservices in seconds — no email verification needed"}
            </p>

            <Tabs value={tab} onValueChange={setTab} className="mt-6">
              <TabsList className="grid w-full grid-cols-2 bg-card/60 border border-primary/20">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={signIn} className="mt-6 space-y-4 rounded-2xl border border-primary/30 bg-card/60 p-6 shadow-[0_0_30px_rgba(34,255,136,0.08)] backdrop-blur">
                  <Field icon={<Mail className="h-4 w-4" />} label="Email">
                    <Input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                  </Field>
                  <Field icon={<Lock className="h-4 w-4" />} label="Password">
                    <Input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
                  </Field>
                  <Button type="submit" className="group w-full gap-2" disabled={loading}>
                    {loading ? "Authenticating..." : <>Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUp} className="mt-6 space-y-4 rounded-2xl border border-primary/30 bg-card/60 p-6 shadow-[0_0_30px_rgba(34,255,136,0.08)] backdrop-blur">
                  <Field icon={<User className="h-4 w-4" />} label="Full name">
                    <Input required placeholder="Ali Ahmed" value={name} onChange={e => setName(e.target.value)} className="pl-10" />
                  </Field>
                  <Field icon={<Mail className="h-4 w-4" />} label="Email">
                    <Input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                  </Field>
                  <Field icon={<Lock className="h-4 w-4" />} label="Password">
                    <Input type="password" placeholder="At least 6 characters" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
                  </Field>
                  <Button type="submit" className="group w-full gap-2" disabled={loading}>
                    {loading ? "Creating..." : <>Create account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
              &gt; protected by Wikiservices security layer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary/70">{icon}</span>
        {children}
      </div>
    </div>
  );
}
