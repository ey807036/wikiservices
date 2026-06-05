import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, useRouterState,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-store";
import { WishlistProvider } from "@/lib/wishlist-store";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Toaster } from "@/components/ui/sonner";
import { ThemeIntensity } from "@/components/site/theme-intensity";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { ThemeProvider } from "@/components/site/theme-provider";
import { ClickSound } from "@/components/site/click-sound";
import { MobileHackerLogin } from "@/components/site/mobile-hacker-login";
import { FloatingMascots } from "@/components/site/floating-mascots";
import { SiteAnnouncementPopup } from "@/components/site/site-announcement-popup";
import { PageLoader } from "@/components/site/page-loader";
import { SiteProtection } from "@/components/site/site-protection";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "𓆩𝗪𝗶𝗸𝗶 𝘀𝗲𝗿𝘃𝗶𝗰𝗲𝘀𓆪 jammer and haking devices" },
      { name: "description", content: "Wifi jamming _bluetooth jammer_signal jammer_any device hack like cars tv ac projecter laptop,PC ,mobile,mp3 sounds,camra hack, electric bulb much more things💀" },
      { property: "og:title", content: "𓆩𝗪𝗶𝗸𝗶 𝘀𝗲𝗿𝘃𝗶𝗰𝗲𝘀𓆪 jammer and haking devices" },
      { property: "og:description", content: "Wifi jamming _bluetooth jammer_signal jammer_any device hack like cars tv ac projecter laptop,PC ,mobile,mp3 sounds,camra hack, electric bulb much more things💀" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "𓆩𝗪𝗶𝗸𝗶 𝘀𝗲𝗿𝘃𝗶𝗰𝗲𝘀𓆪 jammer and haking devices" },
      { name: "twitter:description", content: "Wifi jamming _bluetooth jammer_signal jammer_any device hack like cars tv ac projecter laptop,PC ,mobile,mp3 sounds,camra hack, electric bulb much more things💀" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/59edb91c-7758-4fef-8982-2a5f9554dac4" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/59edb91c-7758-4fef-8982-2a5f9554dac4" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="matrix" style={{ colorScheme: "dark", backgroundColor: "oklch(0.08 0.015 145)" }}>
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin");
  const isFia = path.startsWith("/fia-preparation");
  if (isAdmin || isFia) return <>{children}</>;
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function FloatingChrome() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/fia-preparation") || path.startsWith("/admin")) return null;
  return (
    <>
      <WhatsAppButton />
      <FloatingMascots />
      <SiteAnnouncementPopup />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ThemeProvider />
            <ClickSound />
            <Layout><Outlet /></Layout>
            <WhatsAppButton />
            <FloatingMascots />
            <SiteAnnouncementPopup />
            <PageLoader />
            <SiteProtection />
            <Toaster richColors position="top-right" />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
