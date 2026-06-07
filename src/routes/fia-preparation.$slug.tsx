import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FiaPreloadVideos, FiaResultVideoCircle, type FiaVideoKind } from "@/components/fia/result-video-circle";

export const Route = createFileRoute("/fia-preparation/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug.toUpperCase()} MCQ Test — FIA Preparation` }],
  }),
  component: CategoryQuiz,
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-red-400">Error: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-8 text-center text-white">Category not found.</div>,
});

type Mcq = { id: string; question: string; options: string[]; correct_index: number; explanation: string };
type Category = { id: string; slug: string; name: string; accent_color: string; description: string };

const COUNT_OPTIONS = [20, 50, 100, 150, 200];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function CategoryQuiz() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["fia-category-quiz", slug],
    queryFn: async () => {
      const { data: cat, error: e1 } = await supabase
        .from("fia_categories").select("*").eq("slug", slug).maybeSingle();
      if (e1) throw e1;
      if (!cat) return { category: null, mcqs: [] as Mcq[] };
      const { data: mcqs, error: e2 } = await supabase
        .from("fia_mcqs").select("*").eq("category_id", cat.id);
      if (e2) throw e2;
      return { category: cat as Category, mcqs: (mcqs ?? []) as Mcq[] };
    },
  });

  const [started, setStarted] = useState(false);
  const [desiredCount, setDesiredCount] = useState<number>(20);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [seed, setSeed] = useState(0);
  const [overlay, setOverlay] = useState<FiaVideoKind | null>(null);
  // Track whether we should show back-video on leaving start screen too
  const visitedRef = useRef(false);
  useEffect(() => { visitedRef.current = true; }, []);

  const allShuffled = useMemo(() => {
    if (!data?.mcqs) return [];
    return shuffle(data.mcqs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.mcqs, seed]);

  const shuffled = useMemo(() => allShuffled.slice(0, desiredCount), [allShuffled, desiredCount]);

  const total = shuffled.length;
  const finished = started && idx >= total;

  // Intercept mobile/browser back button — push a dummy state when component mounts
  // and on popstate, show the back overlay (only if user hasn't completed).
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.pushState({ fiaGuard: true }, "");
    const onPop = () => {
      // user just pressed back — re-push to keep them here, then show overlay
      if (!finished) {
        window.history.pushState({ fiaGuard: true }, "");
        setOverlay("back");
      } else {
        navigate({ to: "/fia-preparation" });
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [finished, navigate]);

  if (isLoading) return <div className="min-h-screen bg-black text-white p-8 text-center">Loading...</div>;
  if (!data?.category) return <div className="min-h-screen bg-black text-white p-8 text-center">Category not found.</div>;

  const c = data.category;
  const score = picks.filter((p, i) => p !== null && p === shuffled[i]?.correct_index).length;
  const availableTotal = allShuffled.length;
  const visibleCountOptions = COUNT_OPTIONS.filter((n) => n <= availableTotal);
  if (availableTotal > 0 && !visibleCountOptions.includes(desiredCount) && availableTotal < desiredCount) {
    // ensure desiredCount is achievable; if not, will be set in handler
  }

  const startQuiz = () => {
    const n = Math.min(desiredCount, availableTotal);
    setDesiredCount(n);
    setStarted(true); setIdx(0); setPicks(Array(n).fill(null)); setRevealed(false); setSeed((s) => s + 1);
  };

  const handleBack = () => {
    // Show back video both during quiz AND from start screen (after they entered)
    if (!finished) {
      setOverlay("back");
      return;
    }
    navigate({ to: "/fia-preparation" });
  };

  // When quiz finishes, decide pass/fail overlay video
  const resultKind: FiaVideoKind | null = finished
    ? (score >= Math.ceil(total / 2) ? "pass" : "fail")
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <FiaPreloadVideos />

      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 z-10 bg-black/70 backdrop-blur">
        <button onClick={handleBack} className="text-xs px-3 py-1.5 rounded-full border border-white/15 hover:bg-white/10">← Back</button>
        <div className="text-sm font-bold" style={{ color: c.accent_color }}>{c.name} Preparation</div>
        <div className="w-16" />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {!started && (
          <div className="rounded-2xl p-6 text-center border bg-zinc-900/60"
            style={{ borderColor: `${c.accent_color}55`, boxShadow: `0 0 24px ${c.accent_color}33` }}>
            <h1 className="text-3xl font-bold mb-2"
              style={{ color: c.accent_color, textShadow: `0 0 14px ${c.accent_color}80` }}>
              {c.name} MCQ Test
            </h1>
            <p className="text-sm text-zinc-400 mb-2">{c.description}</p>
            <p className="text-xs mb-4">Available Questions: <strong style={{ color: c.accent_color }}>{availableTotal}</strong></p>

            {availableTotal === 0 ? (
              <p className="text-yellow-400 text-sm">Abhi tak is category mein koi MCQ nahi. Admin se add karwaen.</p>
            ) : (
              <>
                <div className="mb-5">
                  <p className="text-xs text-zinc-300 mb-2 font-semibold">Kitne MCQs attempt karne hain?</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {visibleCountOptions.map((n) => {
                      const active = desiredCount === n;
                      return (
                        <button key={n} onClick={() => setDesiredCount(n)}
                          className="px-4 py-2 rounded-full text-sm font-bold border transition"
                          style={{
                            borderColor: active ? c.accent_color : "rgba(255,255,255,0.15)",
                            background: active ? c.accent_color : "transparent",
                            color: active ? "#000" : "#fff",
                            boxShadow: active ? `0 0 14px ${c.accent_color}90` : "none",
                          }}>
                          {n}
                        </button>
                      );
                    })}
                    {availableTotal > 0 && !visibleCountOptions.includes(availableTotal) && (
                      <button onClick={() => setDesiredCount(availableTotal)}
                        className="px-4 py-2 rounded-full text-sm font-bold border transition"
                        style={{
                          borderColor: desiredCount === availableTotal ? c.accent_color : "rgba(255,255,255,0.15)",
                          background: desiredCount === availableTotal ? c.accent_color : "transparent",
                          color: desiredCount === availableTotal ? "#000" : "#fff",
                        }}>
                        All ({availableTotal})
                      </button>
                    )}
                  </div>
                </div>

                <button onClick={startQuiz}
                  className="px-6 py-3 rounded-full font-bold tracking-wider"
                  style={{ background: c.accent_color, color: "#000", boxShadow: `0 0 24px ${c.accent_color}90` }}>
                  ▶ START TEST
                </button>
              </>
            )}
          </div>
        )}

        {started && !finished && shuffled[idx] && (
          <div className="rounded-2xl p-5 border bg-zinc-900/60"
            style={{ borderColor: `${c.accent_color}55`, boxShadow: `0 0 18px ${c.accent_color}22` }}>
            <div className="flex justify-between text-xs text-zinc-400 mb-3">
              <span>Question {idx + 1} / {total}</span>
              <span>Score: {score}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-5">
              <div className="h-full transition-all" style={{ width: `${((idx + 1) / total) * 100}%`, background: c.accent_color }} />
            </div>

            <h2 className="text-lg font-semibold mb-5">{shuffled[idx].question}</h2>

            <div className="space-y-2">
              {shuffled[idx].options.map((opt, oi) => {
                const isPicked = picks[idx] === oi;
                const isCorrect = shuffled[idx].correct_index === oi;
                let cls = "border-white/15 hover:border-[oklch(0.85_0.22_145)]";
                if (revealed) {
                  if (isCorrect) cls = "border-[oklch(0.85_0.22_145)] bg-[oklch(0.85_0.22_145/0.15)] text-[oklch(0.9_0.22_145)]";
                  else if (isPicked) cls = "border-[oklch(0.7_0.28_25)] bg-[oklch(0.7_0.28_25/0.15)] text-[oklch(0.85_0.22_30)]";
                } else if (isPicked) {
                  cls = "border-[oklch(0.85_0.22_145)] bg-[oklch(0.85_0.22_145/0.08)]";
                }
                return (
                  <button key={oi} disabled={revealed}
                    onClick={() => setPicks((p) => p.map((v, i) => (i === idx ? oi : v)))}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition text-sm flex items-center gap-3 ${cls}`}>
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span>{opt}</span>
                    {revealed && isCorrect && <span className="ml-auto">✓</span>}
                    {revealed && isPicked && !isCorrect && <span className="ml-auto">✗</span>}
                  </button>
                );
              })}
            </div>

            {revealed && shuffled[idx].explanation && (
              <div className="mt-4 p-3 rounded-lg bg-white/5 text-xs text-zinc-300">
                <strong>Explanation:</strong> {shuffled[idx].explanation}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5">
              {!revealed ? (
                <button disabled={picks[idx] === null} onClick={() => setRevealed(true)}
                  className="px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
                  style={{ background: c.accent_color, color: "#000" }}>Check</button>
              ) : (
                <button onClick={() => { setRevealed(false); setIdx((i) => i + 1); }}
                  className="px-5 py-2 rounded-full text-sm font-semibold"
                  style={{ background: c.accent_color, color: "#000" }}>
                  {idx + 1 === total ? "Finish" : "Next →"}
                </button>
              )}
            </div>
          </div>
        )}

        {finished && resultKind && (
          <div className="rounded-2xl p-8 text-center border bg-zinc-900/60"
            style={{ borderColor: `${c.accent_color}55`, boxShadow: `0 0 28px ${c.accent_color}44` }}>
            <div className="mb-5">
              <FiaResultVideoCircle kind={resultKind} size={240} />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: c.accent_color }}>Quiz Complete!</h2>
            <p className="text-5xl font-bold my-4" style={{ color: c.accent_color, textShadow: `0 0 18px ${c.accent_color}` }}>
              {score} / {total}
            </p>
            <p className="text-white text-base font-semibold mb-5">
              {resultKind === "pass"
                ? (score === total ? "🔥 Perfect score! Mubarak ho!" : "👏 Bohat acha! Practice jari rakhen.")
                : "📚 Aur practice ki zarurat hai. Phir try karen!"}
            </p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setStarted(false); setIdx(0); }} className="px-5 py-2 rounded-full text-sm border border-white/15">Retry</button>
              <button onClick={() => navigate({ to: "/fia-preparation" })}
                className="px-5 py-2 rounded-full text-sm font-semibold"
                style={{ background: c.accent_color, color: "#000" }}>
                Home
              </button>
            </div>
          </div>
        )}
      </main>

      {overlay === "back" && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 gap-6">
          <FiaResultVideoCircle kind="back" size={260} />
          <p className="text-center text-base text-white font-semibold max-w-xs">
            {started ? "Test adhura chhor ke ja rahe ho? Try again later!" : "Wapas ja rahe ho? Test zaroor try karna!"}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setOverlay(null)}
              className="px-5 py-2 rounded-full text-sm font-semibold"
              style={{ background: c.accent_color, color: "#000" }}>
              {started ? "Wapas test par" : "Ruk jao"}
            </button>
            <button onClick={() => navigate({ to: "/fia-preparation" })}
              className="px-5 py-2 rounded-full text-sm border border-white/20 text-white">
              Phir bhi jao
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
