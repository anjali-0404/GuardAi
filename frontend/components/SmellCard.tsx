"use client";

import { CodeSmell } from "@/types/analysis";

interface SmellCardProps {
  smell: CodeSmell;
}

export function SmellCard({ smell }: SmellCardProps) {
  return (
    <div className="p-5 border border-border rounded-xl bg-accent/20 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{smell.title}</h3>
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
          smell.severity === "high" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
          smell.severity === "medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
          "bg-blue-500/10 text-blue-500 border-blue-500/20"
        } border`}>
          {smell.severity}
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {smell.description}
      </p>

      <pre className="p-2 bg-black/20 border border-white/5 rounded font-mono text-[10px] overflow-x-auto text-muted-foreground">
        <code>{smell.affected_code}</code>
      </pre>
    </div>
  );
}
