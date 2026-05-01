export type Severity = "low" | "medium" | "high" | "critical";

export interface Vulnerability {
  id: string;
  title: string;
  owasp_category: string;
  cwe_id: string;
  severity: Severity;
  description: string;
  affected_code: string;
  line_numbers: number[];
  exploit_scenario: string;
}

export interface Hallucination {
  id: string;
  title: string;
  type: "fake_api" | "wrong_signature" | "unsafe_assumption" | "missing_validation" | "invented_pattern" | "logical_contradiction" | "race_condition" | "missing_import";
  description: string;
  affected_code: string;
  correct_approach: string;
}

export interface CodeSmell {
  id: string;
  title: string;
  category: "god_function" | "magic_number" | "deep_nesting" | "dry_violation" | "poor_naming" | "missing_types" | "n_plus_one" | "broad_exception" | "dead_code" | "missing_docs" | "blocking_async" | "missing_validation";
  severity: "low" | "medium" | "high";
  description: string;
  affected_code: string;
}

export interface FixSuggestion {
  id: string;
  references_issue: string;
  title: string;
  why_dangerous: string;
  affected_code?: string;
  fixed_code: string;
  references: string[];
}

export interface RecommendedTool {
  tool: string;
  purpose: string;
  url: string;
}

export interface AnalysisResponse {
  severity: Severity;
  summary: string;
  risk_score: number;
  vulnerabilities: Vulnerability[];
  hallucinations: Hallucination[];
  code_smells: CodeSmell[];
  fix_suggestions: FixSuggestion[];
  positive_findings: string[];
  recommended_tools: RecommendedTool[];
}
