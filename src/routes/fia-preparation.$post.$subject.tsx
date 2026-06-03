import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Trophy, RotateCw, Sparkles } from "lucide-react";

export const Route = createFileRoute("/fia-preparation/$post/$subject")({
  component: TestRunner,
});

type Q = { id: string; question: string; options: string[]; correct_answer: string };

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function TestRunner() {
  const { post, subject } = useParams({ from: "/fia-preparation/$post/$subject" });
  const [postName, setPostName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [accent, setAccent] = useState("#22d3ee");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ id: string; correct: boolean; picked: string; q: Q }[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTest = async () => {
    setLoading(true);
    const { data: p } = await supabase.from("fia_posts").select("*").eq("slug", post).maybeSingle();
    if (p) {
      setPostName(p.name);
      setAccent(p.accent_color);
    }
    const { data: s } = await supabase
      .from("fia_subjects")
      .select("id, name")
      .eq("post_id", p?.id)
      .eq("slug", subject)
      .maybeSingle();
    if (s) setSubjectName(s.name);

    const { data: q } = await supabase
      .from("fia_questions")
      .select("id, question, options, correct_answer")
      .eq("subject_id", s?.id);
    setQuestions(shuffle((q ?? []) as Q[]));
    setIdx(0);
    setPicked(null);
    setAnswers([]);
    setFinished(false);
    setLoading(false);
  };

  useEffect(() => {
    loadTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, subject]);

  const current = questions[idx];

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    const correct = opt === current.correct_answer;
    setAnswers((prev) => [...prev, { id: current.id, correct, picked: opt, q: current }]);
    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        setFinished(true);
      } else {
        setIdx(idx + 1);
        setPicked(null);
      }
    }, 900);
  };

  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers]);
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto p-10 text-center text-zinc-400">Loading test...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto p-10 text-center">
          <div className="text-2xl font-bold">No MCQs yet</div>
          <p className="mt-2 text-zinc-400">Coming soon — admin will add questions for this subject.</p>
          <Link
            to="/fia-preparation/$post"
            params={{ post }}
            className="mt-4 inline-block text-cyan-400 underline"
          >
            ← Go back
          </Link>
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  if (finished) {
    const rating =
      pct >= 80 ? "Excellent 🏆" : pct >= 60 ? "Good Job 💪" : pct >= 40 ? "Keep Practicing 📚" : "Try Again 🔥";
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-10">
          <div
            className="mx-auto max-w-2xl rounded-3xl border bg-zinc-900/70 p-6 sm:p-10 text-center"
            style={{
              borderColor: accent + "66",
              boxShadow: `0 0 40px ${accent}44`,
            }}
          >
            <div
              className="mx-auto grid h-20 w-20 place-items-center rounded-full"
              style={{
                backgroundColor: accent + "22",
                color: accent,
                boxShadow: `0 0 30px ${accent}aa`,
              }}
            >
              <Trophy className="h-10 w-10" />
            </div>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">Test Complete!</h1>
            <p className="mt-1 text-zinc-400">
              {postName} · {subjectName}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <Stat label="Score" value={`${score}/${questions.length}`} color="text-cyan-300" />
              <Stat label="Correct" value={String(score)} color="text-emerald-300" />
              <Stat label="Wrong" value={String(questions.length - score)} color="text-rose-300" />
            </div>

            <div className="mt-6">
              <div className="text-6xl font-black" style={{ color: accent }}>
                {pct}%
              </div>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold">
                <Sparkles className="h-4 w-4" /> {rating}
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Button
                onClick={loadTest}
                className="w-full sm:w-auto"
                style={{ background: accent, color: "#000" }}
              >
                <RotateCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
              <Link
                to="/fia-preparation/$post"
                params={{ post }}
                className="w-full rounded-md border border-white/10 px-4 py-2 text-center text-sm sm:w-auto"
              >
                Back to {postName}
              </Link>
            </div>

            {/* Review */}
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-zinc-400 hover:text-white">
                Review answers
              </summary>
              <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-1">
                {answers.map((a, i) => (
                  <div
                    key={a.id}
                    className={`rounded-lg border p-3 text-sm ${
                      a.correct
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-rose-500/30 bg-rose-500/10"
                    }`}
                  >
                    <div className="font-medium">
                      {i + 1}. {a.q.question}
                    </div>
                    <div className="mt-1 text-xs">
                      Your answer:{" "}
                      <span className={a.correct ? "text-emerald-300" : "text-rose-300"}>
                        {a.picked}
                      </span>
                    </div>
                    {!a.correct && (
                      <div className="text-xs">
                        Correct: <span className="text-emerald-300">{a.q.correct_answer}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // TEST IN PROGRESS
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <Header />
      <section className="container mx-auto px-4 py-6">
        <Link
          to="/fia-preparation/$post"
          params={{ post }}
          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Exit test
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">
              {postName} · {subjectName}
            </div>
            <div className="text-lg font-bold">
              Q {idx + 1} <span className="text-zinc-500">/ {questions.length}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400">Score</div>
            <div className="text-lg font-bold text-emerald-300">{score}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((idx + (picked ? 1 : 0)) / questions.length) * 100}%`,
              background: accent,
              boxShadow: `0 0 12px ${accent}`,
            }}
          />
        </div>

        <div
          className="mt-6 rounded-2xl border bg-zinc-900/70 p-5 sm:p-7"
          style={{
            borderColor: accent + "55",
            boxShadow: `0 0 22px ${accent}33`,
          }}
        >
          <div className="text-base font-semibold leading-snug sm:text-lg">
            {current.question}
          </div>
          <div className="mt-5 grid gap-2.5">
            {current.options.map((opt, i) => {
              const isPicked = picked === opt;
              const isCorrect = opt === current.correct_answer;
              const showCorrect = picked !== null && isCorrect;
              const showWrong = isPicked && !isCorrect;
              return (
                <button
                  key={i}
                  onClick={() => choose(opt)}
                  disabled={picked !== null}
                  className={`group flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                    showCorrect
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-100 shadow-[0_0_22px_rgba(16,185,129,0.6)]"
                      : showWrong
                      ? "border-rose-500 bg-rose-500/20 text-rose-100 shadow-[0_0_22px_rgba(244,63,94,0.6)]"
                      : picked
                      ? "border-white/10 bg-white/5 text-zinc-400"
                      : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        showCorrect
                          ? "bg-emerald-500 text-white"
                          : showWrong
                          ? "bg-rose-500 text-white"
                          : "bg-white/10 text-zinc-300 group-hover:bg-white/20"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </span>
                  {showCorrect && <Check className="h-5 w-5 text-emerald-300" />}
                  {showWrong && <X className="h-5 w-5 text-rose-300" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-wide text-zinc-400">{label}</div>
      <div className={`mt-1 text-xl font-black ${color}`}>{value}</div>
    </div>
  );
}
