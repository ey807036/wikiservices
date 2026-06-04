// MCQ bulk paste parser
export type ParsedMcq = {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

const OPTION_RE = /^\s*([A-Da-d])[\)\.\:\-]\s*(.+?)\s*$/;
const Q_RE = /^\s*(?:Q\s*\d*[\.\)\:]|\d+[\.\)\:])\s*(.+?)\s*$/i;

function isCorrectMarker(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\*\s*$/.test(text) ||
    /^\s*\*/.test(text) ||
    t.includes("(correct)") ||
    t.includes("[correct]") ||
    t.includes("[ans]") ||
    t.includes("(ans)") ||
    t.includes("✓")
  );
}

function stripCorrectMarker(text: string): string {
  return text
    .replace(/\*+/g, "")
    .replace(/\((?:correct|ans)\)/gi, "")
    .replace(/\[(?:correct|ans)\]/gi, "")
    .replace(/✓/g, "")
    .trim();
}

export function parseMcqs(input: string): { mcqs: ParsedMcq[]; errors: string[] } {
  const errors: string[] = [];
  const mcqs: ParsedMcq[] = [];

  const normalized = input.replace(/\r\n/g, "\n").trim();
  if (!normalized) return { mcqs, errors };

  const blocks = normalized
    .split(/\n\s*\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  blocks.forEach((block, idx) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 5) {
      errors.push(`Q${idx + 1}: kam se kam 1 question + 4 options chahiye`);
      return;
    }

    let question = "";
    const opts: { letter: string; text: string; correct: boolean }[] = [];
    let explanation = "";

    for (const line of lines) {
      const optMatch = line.match(OPTION_RE);
      if (optMatch && opts.length < 4) {
        const raw = optMatch[2];
        const correct = isCorrectMarker(raw) || isCorrectMarker(line);
        opts.push({
          letter: optMatch[1].toUpperCase(),
          text: stripCorrectMarker(raw),
          correct,
        });
      } else if (/^explanation[\:\-]/i.test(line)) {
        explanation = line.replace(/^explanation[\:\-]\s*/i, "").trim();
      } else if (!question) {
        const qm = line.match(Q_RE);
        question = qm ? qm[1] : line;
      } else if (opts.length === 0) {
        question += " " + line;
      } else {
        explanation = explanation ? explanation + " " + line : line;
      }
    }

    if (!question) { errors.push(`Q${idx + 1}: question missing`); return; }
    if (opts.length !== 4) { errors.push(`Q${idx + 1}: ${opts.length} options mile, 4 chahiye`); return; }
    const correctIdx = opts.findIndex((o) => o.correct);
    if (correctIdx === -1) { errors.push(`Q${idx + 1}: correct answer mark nahi mila (* lagayen)`); return; }

    mcqs.push({
      question,
      options: opts.map((o) => o.text),
      correct_index: correctIdx,
      explanation,
    });
  });

  return { mcqs, errors };
}

export const MCQ_EXAMPLE = `1. Pakistan ka qaumi parinda kaun sa hai?
A) Tota
B) Chakor *
C) Kabootar
D) Bulbul
Explanation: Chakor Pakistan ka national bird hai.

2. FIA ka pura naam kya hai?
A) Federal Industrial Agency
B) Federal Investigation Agency *
C) Foreign Intelligence Agency
D) Federal Inquiry Authority`;
