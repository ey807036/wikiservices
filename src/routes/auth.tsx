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
import { lovable } from "@/integrations/lovable/index";
import logo from "@/assets/logo.png";
import hacker from "@/assets/hacker-3d.png";

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

  useEffect(() => {
    const finishOAuth = async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const search = new URLSearchParams(window.location.search);
      const accessToken = hash.get("access_token") || search.get("access_token");
      const refreshToken = hash.get("refresh_token") || search.get("refresh_token");
      const oauthError = hash.get("error_description") || search.get("error_description") || hash.get("error") || search.get("error");

      if (oauthError) {
        toast.error(oauthError);
        window.history.replaceState(null, "", "/auth");
        setLoading(false);
        return;
      }

      if (accessToken && refreshToken) {
        setLoading(true);
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        window.history.replaceState(null, "", "/auth");
        setLoading(false);
        if (error) return toast.error(error.message || "Google session save nahi hua");
        toast.success("Signed in with Google ✨");
        navigate({ to: "/", replace: true });
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) navigate({ to: "/", replace: true });
    };
    finishOAuth();
  }, [navigate]);

  useEffect(() => { if (user) navigate({ to: "/", replace: true }); }, [user, navigate]);

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

  const googleSignIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
      extraParams: { prompt: "select_account" },
    });
    if (result.error) {
      setLoading(false);
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }
    if (result.redirected) return; // browser navigates away
    const { data } = await supabase.auth.getSession();
    setLoading(false);
    if (data.session?.user) {
      toast.success("Signed in with Google ✨");
      navigate({ to: "/", replace: true });
    } else {
      toast.error("Google session save nahi hua — dobara try karein");
    }
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

            <div className="relative flex flex-1 items-center justify-center py-6">
              {/* glow ring behind character */}
              <div className="absolute h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-pulse" />
              <div className="absolute h-56 w-56 rounded-full border border-primary/30 animate-[spin_20s_linear_infinite]" />
              <div className="absolute h-72 w-72 rounded-full border border-primary/10 animate-[spin_30s_linear_infinite_reverse]" />

              {/* 3D hacker character */}
              <img
                src={hacker}
                alt="Wikiservices hacker mascot"
                className="relative z-10 h-[320px] w-auto drop-shadow-[0_20px_40px_rgba(34,255,136,0.35)] animate-[float_4s_ease-in-out_infinite]"
                loading="lazy"
              />

              {/* floating terminal chip */}
              <div className="absolute bottom-2 right-0 max-w-[260px] rounded-lg border border-primary/40 bg-black/80 p-3 font-mono text-xs shadow-[0_0_20px_rgba(34,255,136,0.25)] backdrop-blur">
                <p className="text-primary">$ tunnel <span className="text-foreground">secure</span></p>
                <p className="text-primary/80">$ enc: <span className="text-foreground">AES-256</span></p>
                <p className="text-primary">$ awaiting<span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle" /></p>
              </div>
            </div>

            <div>
              <h2 className="font-mono text-2xl font-bold leading-tight text-foreground">
                &gt; Access the <span className="text-gradient">Network</span>
              </h2>
              <p className="mt-2 max-w-md font-mono text-sm text-muted-foreground">
                Premium WiFi gear, blazing fast checkout. Login to unlock member pricing.
              </p>
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
            <Link to="/" className="mb-4 flex items-center gap-2 lg:hidden">
              <img src={logo} alt="Wikiservices" className="h-8 w-8 rounded-md" />
              <span className="font-mono font-bold">WIKISERVICES</span>
            </Link>

            {/* Mobile hacker character */}
            <div className="relative mb-6 flex items-center justify-center lg:hidden">
              <div className="absolute h-44 w-44 rounded-full bg-primary/20 blur-3xl animate-pulse" />
              <div className="absolute h-36 w-36 rounded-full border border-primary/30 animate-[spin_20s_linear_infinite]" />
              <img
                src={hacker}
                alt="Wikiservices hacker mascot"
                className="relative z-10 h-40 w-auto drop-shadow-[0_15px_30px_rgba(34,255,136,0.4)] animate-[float_4s_ease-in-out_infinite]"
                loading="lazy"
              />
            </div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
              <Terminal className="h-3 w-3" /> secure_login.exe
            </div>
            <h1 className="font-mono text-3xl font-bold tracking-tight">
              {tab === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === "signin" ? "Enter credentials to continue" : "Join Wikiservices in seconds — no email verification needed"}
            </p>

            {/* Premium Google sign-in */}
            <button
              type="button"
              onClick={googleSignIn}
              disabled={loading}
              className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-card/80 via-card/60 to-card/80 px-4 py-3 font-mono text-sm font-semibold text-foreground shadow-[0_0_30px_rgba(34,255,136,0.15)] backdrop-blur transition-all hover:scale-[1.02] hover:border-primary/70 hover:shadow-[0_0_40px_rgba(34,255,136,0.35)] disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <svg className="relative h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.9 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.8-3.1-11.4-7.5l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.2 5.2C40.7 35.4 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z"/>
              </svg>
              <span className="relative">Continue with Google</span>
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-primary/20" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-primary/20" />
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 bg-card/60 border border-primary/20">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={signIn} className="mt-6 space-y-4 rounded-2xl border border-primary/30 bg-card/60 p-6 shadow-[0_0_30px_rgba(34,255,136,0.08)] backdrop-blur">
                  <Field icon={<Mail className="h-4 w-4" />} label="Email">
                    <Input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="input-neon pl-10 h-11" />
                  </Field>
                  <Field icon={<Lock className="h-4 w-4" />} label="Password">
                    <Input type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} className="input-neon pl-10 h-11" />
                  </Field>
                  <Button type="submit" className="group w-full gap-2" disabled={loading}>
                    {loading ? "Authenticating..." : <>Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUp} className="mt-6 space-y-4 rounded-2xl border border-primary/30 bg-card/60 p-6 shadow-[0_0_30px_rgba(34,255,136,0.08)] backdrop-blur">
                  <Field icon={<User className="h-4 w-4" />} label="Full name">
                    <Input required placeholder="Ali Ahmed" value={name} onChange={e => setName(e.target.value)} className="input-neon pl-10 h-11" />
                  </Field>
                  <Field icon={<Mail className="h-4 w-4" />} label="Email">
                    <Input type="email" placeholder="you@example.com" required value={email} onChange={e => setEmail(e.target.value)} className="input-neon pl-10 h-11" />
                  </Field>
                  <Field icon={<Lock className="h-4 w-4" />} label="Password">
                    <Input type="password" placeholder="At least 6 characters" minLength={6} required value={password} onChange={e => setPassword(e.target.value)} className="input-neon pl-10 h-11" />
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
      <div className="field-neon relative mt-1.5">
        <div className="relative rounded-[calc(var(--radius)+1px)] bg-card/70">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-primary drop-shadow-[0_0_6px_color-mix(in_oklab,var(--primary)_70%,transparent)]">{icon}</span>
          {children}
        </div>
      </div>
    </div>
  );
}
