"use client";

import { AnalysisResponse, FixSuggestion } from "@/types/analysis";
import { useRouter } from "next/navigation";

interface FixPanelProps {
  fix: FixSuggestion;
}

type ReferencedIssue = {
  id: string;
  affected_code?: string;
  line_numbers?: number[];
};

function normalizeNewlines(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function normalizeForLooseMatch(value: string) {
  return normalizeNewlines(value).trim().replace(/[ \t]+/g, " ");
}

function replacePreservingLineEndings(source: string, start: number, length: number, replacement: string) {
  const before = source.slice(0, start);
  const target = source.slice(start, start + length);
  const after = source.slice(start + length);
  const usesCrLf = target.includes("\r\n") || (!target.includes("\n") && source.includes("\r\n"));
  const normalizedReplacement = replacement.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return before + (usesCrLf ? normalizedReplacement.replace(/\n/g, "\r\n") : normalizedReplacement) + after;
}

function replaceByExactSnippet(currentCode: string, affectedCode: string, fixedCode: string) {
  const candidates = Array.from(new Set([
    affectedCode,
    affectedCode.trim(),
    normalizeNewlines(affectedCode),
    normalizeNewlines(affectedCode).trim(),
  ])).filter(Boolean);

  for (const candidate of candidates) {
    const index = currentCode.indexOf(candidate);
    if (index !== -1) {
      return replacePreservingLineEndings(currentCode, index, candidate.length, fixedCode);
    }
  }

  const normalizedCurrent = normalizeNewlines(currentCode);
  const normalizedAffected = normalizeNewlines(affectedCode).trim();
  const normalizedIndex = normalizedCurrent.indexOf(normalizedAffected);
  if (normalizedIndex !== -1) {
    return replacePreservingLineEndings(normalizedCurrent, normalizedIndex, normalizedAffected.length, fixedCode);
  }

  return null;
}

function replaceByLooseLineMatch(currentCode: string, affectedCode: string, fixedCode: string) {
  const lines = normalizeNewlines(currentCode).split("\n");
  const affectedLines = normalizeNewlines(affectedCode).trim().split("\n").filter((line) => line.trim());
  const affectedLineCount = Math.max(1, affectedLines.length);
  const normalizedAffected = normalizeForLooseMatch(affectedCode);

  for (let start = 0; start <= lines.length - affectedLineCount; start++) {
    const candidate = lines.slice(start, start + affectedLineCount).join("\n");
    if (normalizeForLooseMatch(candidate) === normalizedAffected) {
      const fixedLines = normalizeNewlines(fixedCode).split("\n");
      const updatedLines = [
        ...lines.slice(0, start),
        ...fixedLines,
        ...lines.slice(start + affectedLineCount),
      ];
      const updated = updatedLines.join("\n");
      return currentCode.includes("\r\n") ? updated.replace(/\n/g, "\r\n") : updated;
    }
  }

  return null;
}

function replaceByLineNumbers(currentCode: string, lineNumbers: number[] | undefined, fixedCode: string) {
  if (!lineNumbers?.length) return null;

  const lines = normalizeNewlines(currentCode).split("\n");
  const validLineNumbers = lineNumbers
    .filter((line) => Number.isInteger(line) && line > 0 && line <= lines.length)
    .sort((a, b) => a - b);

  if (!validLineNumbers.length) return null;

  const start = validLineNumbers[0] - 1;
  const end = validLineNumbers[validLineNumbers.length - 1];
  const fixedLines = normalizeNewlines(fixedCode).split("\n");
  const updated = [
    ...lines.slice(0, start),
    ...fixedLines,
    ...lines.slice(end),
  ].join("\n");

  return currentCode.includes("\r\n") ? updated.replace(/\n/g, "\r\n") : updated;
}

function getReferencedIssue(fix: FixSuggestion, analysisResult: AnalysisResponse | null): ReferencedIssue | null {
  if (!analysisResult) return null;

  try {
    const issues: ReferencedIssue[] = [
      ...analysisResult.vulnerabilities,
      ...analysisResult.hallucinations,
      ...analysisResult.code_smells,
    ];

    return issues.find((issue) => issue.id === fix.references_issue) ?? null;
  } catch {
    return null;
  }
}

export function FixPanel({ fix }: FixPanelProps) {
  const router = useRouter();
  
  const handleApplyFix = () => {
    // Get the current code from sessionStorage (set when navigating to results)
    const currentCode = sessionStorage.getItem("lastCode") || "";
    
    // Get analysisResult to look up referenced issue details
    const analysisResultStr = sessionStorage.getItem("analysisResult");
    const analysisResult = analysisResultStr ? JSON.parse(analysisResultStr) : null;
    const referencedIssue = getReferencedIssue(fix, analysisResult);
    const affectedCode = fix.affected_code || (referencedIssue ? referencedIssue.affected_code : undefined) || "";
    
    if (!affectedCode.trim()) {
      alert("Unable to apply fix: this fix suggestion does not include the affected code to replace.");
      return;
    }
    
    const fixedCode =
      replaceByExactSnippet(currentCode, affectedCode, fix.fixed_code) ??
      replaceByLooseLineMatch(currentCode, affectedCode, fix.fixed_code) ??
      replaceByLineNumbers(currentCode, referencedIssue ? referencedIssue.line_numbers : undefined, fix.fixed_code);

    if (!fixedCode) {
      alert("Unable to apply fix: The affected code was not found in the current file. Re-run the audit so CodeGuard-AI can generate a fresh fix for the current code.");
      return;
    }
    
    // Store the fixed code in sessionStorage to be used on the home page
    // Also preserve analysisResult for potential future use
    sessionStorage.setItem("fixedCode", fixedCode);
    sessionStorage.setItem("lastCode", fixedCode);
    sessionStorage.setItem("fixedCodeLanguage", "auto"); // We could try to detect language, but for now use auto
    // Note: We deliberately preserve analysisResult in sessionStorage
    // Redirect back to home page
    router.push("/");
  };

  return (
    <div className="bg-accent/40 border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border bg-accent/60">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono text-muted-foreground">{fix.references_issue}</span>
          <h3 className="font-bold text-sm">{fix.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-tight">
          {fix.why_dangerous}
        </p>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase text-primary/70">Fixed Implementation</span>
          <pre className="p-3 bg-black/60 rounded-md font-mono text-[11px] overflow-x-auto border border-primary/20">
            <code className="text-blue-300">{fix.fixed_code}</code>
          </pre>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {fix.references.map((ref, i) => (
            <span key={i} className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border">
              {ref}
            </span>
          ))}
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleApplyFix}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Apply Fix
          </button>
        </div>
      </div>
    </div>
  );
}
