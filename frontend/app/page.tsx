"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { analyzeCode } from "@/lib/api";
import { CodeEditor } from "@/components/CodeEditor";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Shield, Zap, Search, Code2, Play, X, Key, Terminal, Rocket, CheckCircle, Copy, Check } from "lucide-react";

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const router = useRouter();
  const videoRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fixedCode = sessionStorage.getItem("fixedCode");
    const fixedCodeLanguage = sessionStorage.getItem("fixedCodeLanguage");
    if (fixedCode) {
      setCode(fixedCode);
      if (fixedCodeLanguage && fixedCodeLanguage !== "auto") {
        setLanguage(fixedCodeLanguage);
      }
      sessionStorage.removeItem("fixedCode");
      sessionStorage.removeItem("fixedCodeLanguage");
    }
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowVideoModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
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

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const integrationSteps = [
    {
      step: 1,
      title: "Install & Clone",
      icon: <Terminal className="w-5 h-5" />,
      command: "git clone https://github.com/your-org/codeguard.git && cd codeguard",
      description: "Clone the repository and navigate to the project directory.",
    },
    {
      step: 2,
      title: "Set Your API Key",
      icon: <Key className="w-5 h-5" />,
      command: `GEMINI_API_KEY=your_gemini_api_key_here`,
      description: "Get your free Gemini API key from Google AI Studio and set it in your .env file.",
    },
    {
      step: 3,
      title: "Start Backend",
      icon: <Shield className="w-5 h-5" />,
      command: "cd backend && pip install -r requirements.txt && uvicorn main:app --reload",
      description: "Launch the FastAPI backend. It runs on http://localhost:8000 by default.",
    },
    {
      step: 4,
      title: "Start Frontend",
      icon: <Rocket className="w-5 h-5" />,
      command: "cd frontend && npm install && npm run dev",
      description: "Launch the Next.js frontend. It runs on http://localhost:3000.",
    },
  ];

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
            <CodeEditor value={code} onChange={setCode} language={language} />
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
      <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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

      {/* ─── DEMO VIDEO SECTION ─── */}
      <section id="demo" className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest">
            <Play className="w-3 h-3 fill-current" />
            Live Demo
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            See CodeGuard-AI in{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Action
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Watch how CodeGuard-AI detects critical vulnerabilities and generates production-ready fixes in under 30 seconds.
          </p>
        </div>

        {/* Video Player Card */}
        <div className="relative group cursor-pointer" onClick={() => setShowVideoModal(true)}>
          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/20 to-primary/30 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Fake Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1117] border-b border-white/5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs text-muted-foreground font-mono">
                localhost:3000 — CodeGuard-AI
              </span>
            </div>

            {/* Thumbnail area */}
            <div className="relative aspect-video bg-gradient-to-br from-[#020617] via-[#0f1a2e] to-[#020617] flex items-center justify-center overflow-hidden">
              {/* Animated grid background */}
              <div className="absolute inset-0 grid-bg opacity-30" />

              {/* Simulated code lines */}
              <div className="absolute inset-0 p-8 flex gap-6 opacity-20 pointer-events-none select-none font-mono text-xs leading-6 overflow-hidden">
                <div className="flex-1 space-y-1">
                  {[
                    <><span className="text-purple-400">import</span> <span className="text-blue-300">os</span></>,
                    <><span className="text-purple-400">import</span> <span className="text-blue-300">subprocess</span></>,
                    "",
                    <><span className="text-yellow-400">def</span> <span className="text-green-300">run_command</span><span className="text-white">(cmd):</span></>,
                    <>&nbsp;&nbsp;<span className="text-blue-300">result</span> <span className="text-white">= subprocess.run(cmd, shell=</span><span className="text-orange-400">True</span><span className="text-white">)</span></>,
                    <>&nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-blue-300">result</span></>,
                    "",
                    <><span className="text-red-400 bg-red-900/30 px-1 rounded">⚠ CRITICAL: shell=True injection risk</span></>,
                    <><span className="text-orange-400 bg-orange-900/20 px-1 rounded">⚠ MEDIUM: No input sanitization</span></>,
                  ].map((line, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-white/20 w-4 text-right">{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
                <div className="w-64 space-y-2">
                  <div className="bg-destructive/20 border border-destructive/30 rounded-lg p-3 text-red-400">
                    <div className="font-bold text-xs mb-1">CRITICAL VULNERABILITY</div>
                    <div className="text-[10px]">Shell injection via cmd parameter</div>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-blue-400">
                    <div className="font-bold text-xs mb-1">AI FIX READY</div>
                    <div className="text-[10px]">subprocess.run(shlex.split(cmd))</div>
                  </div>
                </div>
              </div>

              {/* Play button */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/40 group-hover:border-primary transition-all duration-300 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                  <Play className="w-8 h-8 text-primary fill-primary ml-1" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg">Watch Demo</p>
                  <p className="text-muted-foreground text-sm">2 min walkthrough • No signup needed</p>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 divide-x divide-white/5 bg-[#0d1117]">
              {[
                { label: "Vulnerabilities Detected", value: "12 types" },
                { label: "Time to First Audit", value: "< 5 sec" },
                { label: "Fix Accuracy", value: "94.7%" },
              ].map((stat) => (
                <div key={stat.label} className="px-6 py-4 text-center">
                  <p className="text-primary font-bold text-lg">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW TO INTEGRATE ─── */}
      <section id="integrate" className="max-w-5xl mx-auto space-y-10 pb-20">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest">
            <Rocket className="w-3 h-3" />
            Quick Setup
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">
            Integrate in{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-primary">
              4 Steps
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From zero to running security audits with your own API key in under 5 minutes.
          </p>
        </div>

        <div className="space-y-4">
          {integrationSteps.map((item) => (
            <div
              key={item.step}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start gap-5">
                {/* Step number */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold group-hover:bg-primary group-hover:text-white transition-all">
                  {item.step}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-primary">{item.icon}</span>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{item.description}</p>

                  {/* Command block */}
                  <div className="flex items-center gap-2 bg-[#0d1117] border border-white/5 rounded-xl px-4 py-3 font-mono text-sm overflow-x-auto">
                    <span className="text-green-400 flex-shrink-0">$</span>
                    <span className="text-slate-300 flex-1">{item.command}</span>
                    <button
                      onClick={() => copyToClipboard(item.command, item.step)}
                      className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                      title="Copy"
                    >
                      {copiedStep === item.step ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Deploy CTA */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-green-500/20 rounded-2xl blur-xl opacity-70" />
          <div className="relative glass rounded-2xl p-8 text-center space-y-4 border border-white/10">
            <div className="flex justify-center gap-3 mb-2">
              {[Shield, Zap, CheckCircle].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-5 h-5" />
                </div>
              ))}
            </div>
            <h3 className="text-2xl font-extrabold">Ready to Deploy?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Deploy CodeGuard-AI to Vercel, Railway, or any cloud provider. Full Docker support included.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
              >
                <Rocket className="w-4 h-4" /> Deploy to Vercel
              </a>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                <Key className="w-4 h-4" /> Get Free API Key
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VIDEO MODAL ─── */}
      {showVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" />

          {/* Modal */}
          <div
            className="relative z-10 w-full max-w-4xl animate-in zoom-in-90 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-3 bg-[#0d1117] border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm">CodeGuard-AI — Demo Walkthrough</span>
                </div>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* YouTube embed — replace VIDEO_ID with your actual YouTube video ID */}
              <div className="aspect-video bg-[#020617] flex items-center justify-center">
                <iframe
                  ref={videoRef}
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/CrhyVCAiQIs?autoplay=1&rel=0&modestbranding=1&color=white"
                  title="CodeGuard-AI — AI Code Security Review Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="px-5 py-3 bg-[#0d1117] border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  AI-powered code security review — detect vulnerabilities in seconds
                </p>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="text-xs text-primary hover:underline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
