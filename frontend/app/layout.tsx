import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "CodeGuard-AI | Secure Your Code",
  description: "Production-grade AI-powered code security auditing platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
        <AuthProvider>
          <div className="fixed inset-0 grid-bg -z-10" />
          <div className="fixed inset-0 hero-gradient -z-10" />
          <Nav />
          <main className="container mx-auto px-4 py-12">
            {children}
          </main>
          <footer className="border-t border-border/40 py-12 mt-20">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-muted-foreground">
                © 2024 CodeGuard-AI. Built for secure-first development.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
