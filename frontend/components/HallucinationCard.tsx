"use client";

import { Hallucination } from "@/types/analysis";

interface HallucinationCardProps {
  hallucination: Hallucination;
}

export function HallucinationCard({ hallucination }: HallucinationCardProps) {
  return (
    <div className="p-5 border border-border rounded-xl bg-accent/20 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
          {hallucination.type.replace("_", " ")}
        </span>
        <h3 className="font-bold text-sm">{hallucination.title}</h3>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {hallucination.description}
      </p>

      <div className="grid grid-cols-1 gap-2">
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase text-destructive/70">Hallucinated</span>
          <pre className="p-2 bg-destructive/5 border border-destructive/10 rounded font-mono text-[10px] overflow-x-auto">
            <code>{hallucination.affected_code}</code>
          </pre>
        </div>
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase text-green-500/70">Correct Approach</span>
          <pre className="p-2 bg-green-500/5 border border-green-500/10 rounded font-mono text-[10px] overflow-x-auto">
            <code>{hallucination.correct_approach}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
