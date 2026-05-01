"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { analyzeCode } from "@/lib/api";
import { CodeEditor } from "@/components/CodeEditor";
import { LanguageSelector } from "@/components/LanguageSelector";

import { Shield, Zap, Search, Code2 } from "lucide-react";

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if there's a fixed code to apply
    const fixedCode = sessionStorage.getItem("fixedCode");
    const fixedCodeLanguage = sessionStorage.getItem("fixedCodeLanguage");
    if (fixedCode) {
      setCode(fixedCode);
      if (fixedCodeLanguage && fixedCodeLanguage !== "auto") {
        setLanguage(fixedCodeLanguage);
      }
      // Clear the fixed code from sessionStorage after applying
      sessionStorage.removeItem("fixedCode");
      sessionStorage.removeItem("fixedCodeLanguage");
    }
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analyzeCode(code, language);
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      sessionStorage.setItem("lastCode", code);
      sessionStorage.setItem("lastLanguage", language);
      router.push("/results");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-pulse">
          <Shield className="w-3 h-3" />
          Production-Grade Analysis
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
          Secure Your Code with <br />
          <span className="text-primary">CodeGuard-AI</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
          The ultimate security auditing platform for developers. Detect vulnerabilities, fix hallucinations, and improve code quality in seconds.
        </p>
      </section>

      {/* Main Analysis Tool */}
      <section className="max-w-5xl mx-auto space-y-8 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 -z-10" />
        
        <div className="glass rounded-2xl overflow-hidden border border-border shadow-2xl">
          <div className="p-4 border-b border-border bg-accent/50 flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-4">
              <LanguageSelector value={language} onChange={setLanguage} />
              <div className="h-4 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <Code2 className="w-3 h-3" />
                Input code snippet
              </div>
            </div>
            
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !code.trim()}
              className="group relative bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] px-8 py-2.5 rounded-full font-bold transition-all disabled:opacity-50 disabled:hover:shadow-none"
            >
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 group-hover:fill-current transition-colors" />
                )}
                <span>{isLoading ? "Auditing..." : "Start Deep Audit"}</span>
              </div>
            </button>
          </div>

          <div className="bg-background/50">
            <CodeEditor 
              value={code} 
              onChange={setCode} 
              language={language} 
            />
          </div>
        </div>

        {error && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 rounded-xl text-sm font-medium flex gap-3 items-start">
              <div className="p-1 rounded-full bg-destructive/20 mt-0.5">
                <Zap className="w-3 h-3" />
              </div>
              <div>
                <p className="font-bold mb-1">Audit Failed</p>
                <p className="opacity-80">{error}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pb-20">
        <div className="p-8 glass rounded-2xl space-y-4 hover:border-primary/50 transition-colors group">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">OWASP Top 10</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Comprehensive scanning against broken access control, injection, cryptographic failures, and more.
          </p>
        </div>

        <div className="p-8 glass rounded-2xl space-y-4 hover:border-primary/50 transition-colors group">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Hallucination Detection</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            AI-specialized engine to catch fake APIs, wrong signatures, and unsafe assumptions in generated code.
          </p>
        </div>

        <div className="p-8 glass rounded-2xl space-y-4 hover:border-primary/50 transition-colors group">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Deep Remediation</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Don't just find bugs — fix them. Get production-ready code suggestions and security best practices.
          </p>
        </div>
      </section>
    </div>
  );
}
