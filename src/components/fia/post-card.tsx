import { useState } from "react";

export interface FiaPostData {
  id: string;
  title: string;
  description: string;
  images: string[];
  videos?: string[];
  created_at: string;
}

export function FiaPostCard({ post }: { post: FiaPostData }) {
  const [idx, setIdx] = useState(0);
  const hasImages = post.images && post.images.length > 0;
  const total = post.images?.length ?? 0;
  const videos = post.videos ?? [];

  return (
    <article className="rounded-2xl overflow-hidden flex flex-col border bg-zinc-900/70"
      style={{ borderColor: "oklch(0.85 0.22 145 / 0.3)", boxShadow: "0 0 18px oklch(0.85 0.22 145 / 0.18)" }}>
      {hasImages && (
        <div className="relative aspect-video bg-black/50">
          <img src={post.images[idx]} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
          {total > 1 && (
            <>
              <button onClick={() => setIdx((idx - 1 + total) % total)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full">‹</button>
              <button onClick={() => setIdx((idx + 1) % total)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full">›</button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {post.images.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? "bg-[oklch(0.85_0.22_145)]" : "bg-white/40"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold" style={{ color: "oklch(0.85 0.22 145)", textShadow: "0 0 8px oklch(0.85 0.22 145 / 0.5)" }}>{post.title}</h3>
        <p className="mt-2 text-sm text-zinc-300 whitespace-pre-wrap flex-1">{post.description}</p>
        {videos.length > 0 && (
          <div className="mt-3 space-y-2">
            {videos.map((url) => (
              <video key={url} src={url} controls className="w-full rounded-lg bg-black" />
            ))}
          </div>
        )}
        <p className="mt-3 text-[10px] uppercase tracking-widest text-zinc-500">
          {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>
    </article>
  );
}
