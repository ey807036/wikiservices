export function Footer() {
  return (
    <footer className="mt-16 border-t border-primary/30 bg-background">
      <div className="container mx-auto py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Wikiservices. All rights reserved.
      </div>
    </footer>
  );
}
