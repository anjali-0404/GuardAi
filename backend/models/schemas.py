from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class AnalysisRequest(BaseModel):
    code: str
    language: str

class Vulnerability(BaseModel):
    id: str
    title: str
    owasp_category: str
    cwe_id: str
    severity: Literal["low", "medium", "high", "critical"]
    description: str
    affected_code: str
    line_numbers: List[int]
    exploit_scenario: str

class Hallucination(BaseModel):
    id: str
    title: str
    type: Literal["fake_api", "wrong_signature", "unsafe_assumption", "missing_validation", "invented_pattern", "logical_contradiction", "race_condition", "missing_import"]
    description: str
    affected_code: str
    correct_approach: str

class CodeSmell(BaseModel):
    id: str
    title: str
    category: Literal["god_function", "magic_number", "deep_nesting", "dry_violation", "poor_naming", "missing_types", "n_plus_one", "broad_exception", "dead_code", "missing_docs", "blocking_async", "missing_validation"]
    severity: Literal["low", "medium", "high"]
    description: str
    affected_code: str

class FixSuggestion(BaseModel):
    id: str
    references_issue: str
    title: str
    why_dangerous: str
    affected_code: Optional[str] = None
    fixed_code: str
    references: List[str]

class RecommendedTool(BaseModel):
    tool: str
    purpose: str
    url: str

class AnalysisResponse(BaseModel):
    severity: Literal["low", "medium", "high", "critical"]
    summary: str
    risk_score: int = Field(ge=0, le=100)
    vulnerabilities: List[Vulnerability]
    hallucinations: List[Hallucination]
    code_smells: List[CodeSmell]
    fix_suggestions: List[FixSuggestion]
    positive_findings: List[str]
    recommended_tools: List[RecommendedTool]
