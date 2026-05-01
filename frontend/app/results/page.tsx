"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResponse } from "@/types/analysis";
import { RiskGauge } from "@/components/RiskGauge";
import { VulnerabilityCard } from "@/components/VulnerabilityCard";
import { HallucinationCard } from "@/components/HallucinationCard";
import { SmellCard } from "@/components/SmellCard";
import { FixPanel } from "@/components/FixPanel";

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  if (!result) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4">
      <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Processing security report...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Header / Summary */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center glass p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
                result.severity === "critical" ? "bg-destructive text-destructive-foreground animate-pulse" :
                result.severity === "high" ? "bg-orange-600 text-white" :
                result.severity === "medium" ? "bg-yellow-600 text-white" :
                "bg-green-600 text-white"
              }`}>
                {result.severity} Risk Level
              </span>
              <h1 className="text-4xl font-black tracking-tight">Audit Report</h1>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {result.summary}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {result.positive_findings.map((finding, i) => (
                <span key={i} className="text-[10px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full">
                  ✓ {finding}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-center md:justify-end pr-4">
            <RiskGauge score={result.risk_score} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section id="vulnerabilities" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Vulnerabilities
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {result.vulnerabilities.length}
              </span>
            </h2>
            {result.vulnerabilities.length > 0 ? (
              <div className="space-y-4">
                {result.vulnerabilities.map((v) => (
                  <VulnerabilityCard key={v.id} vulnerability={v} />
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                No vulnerabilities found.
              </div>
            )}
          </section>

          <section id="hallucinations" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Hallucinations
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {result.hallucinations.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.hallucinations.map((h) => (
                <HallucinationCard key={h.id} hallucination={h} />
              ))}
            </div>
          </section>

          <section id="smells" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Code Smells
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {result.code_smells.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.code_smells.map((s) => (
                <SmellCard key={s.id} smell={s} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar / Fixes */}
        <div className="space-y-8">
          <section id="fixes" className="space-y-4 sticky top-8">
            <h2 className="text-2xl font-bold">Fix Suggestions</h2>
            <div className="space-y-4">
              {result.fix_suggestions.map((f) => (
                <FixPanel key={f.id} fix={f} />
              ))}
            </div>
            
            <div className="p-6 bg-accent/30 rounded-xl border border-border space-y-4">
              <h3 className="font-bold">Recommended Tools</h3>
              <div className="space-y-3">
                {result.recommended_tools.map((tool, i) => (
                  <div key={i} className="text-sm">
                    <a href={tool.url} target="_blank" className="text-primary hover:underline font-medium">
                      {tool.tool}
                    </a>
                    <p className="text-muted-foreground text-xs mt-0.5">{tool.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
