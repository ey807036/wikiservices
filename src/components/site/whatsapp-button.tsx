import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const PHONE = "923000000000"; // change to your support number
const MESSAGE = "Asalam-o-Alaikum! I need help with Wikiservices.";

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-2">
      {open && (
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-primary/40 bg-card/95 p-3 pr-8 shadow-[0_0_24px_rgba(34,197,94,0.35)] backdrop-blur max-w-[230px] relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-1 right-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="text-xs font-mono text-primary">&gt; support_online</p>
          <p className="mt-1 text-sm font-medium leading-tight">Need help? Chat with us on WhatsApp</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#25D366] px-2.5 py-1 text-xs font-semibold text-black hover:opacity-90"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Start chat
          </a>
        </div>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(true)}
        aria-label="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-black shadow-[0_0_24px_rgba(37,211,102,0.6)] transition-transform hover:scale-110"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary ring-2 ring-background animate-pulse" />
        <svg viewBox="0 0 32 32" className="relative h-7 w-7" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.21c-.29-.14-1.7-.84-1.96-.94-.26-.1-.45-.14-.64.14-.19.29-.74.94-.9 1.13-.17.19-.33.21-.62.07-.29-.14-1.21-.45-2.3-1.42-.85-.76-1.42-1.69-1.59-1.97-.17-.29-.02-.45.13-.59.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.64-1.55-.88-2.12-.23-.55-.47-.48-.64-.49l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43s1.02 2.82 1.17 3.01c.14.19 2.02 3.08 4.89 4.32.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.33zM16.02 5.33c-5.89 0-10.67 4.78-10.67 10.67 0 1.88.49 3.71 1.43 5.33L5.33 26.67l5.49-1.43a10.62 10.62 0 0 0 5.2 1.32h.01c5.89 0 10.67-4.78 10.67-10.67S21.91 5.33 16.02 5.33z"/>
        </svg>
      </a>
    </div>
  );
}
