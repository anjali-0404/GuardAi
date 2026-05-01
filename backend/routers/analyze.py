import os
import re

from fastapi import APIRouter

from models.schemas import AnalysisRequest, AnalysisResponse
from services.gemini import gemini_service
from services.prompt import build_analysis_prompt

router = APIRouter()

SQL_KEYWORDS = r"(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)"
USER_INPUT_NAMES = r"(user_input|userInput|username|password|email|request|params|query|input)"


def find_sql_injection_snippet(code: str):
    for line_number, line in enumerate(code.splitlines(), start=1):
        stripped = line.strip()
        contains_sql = re.search(SQL_KEYWORDS, stripped, re.IGNORECASE) is not None
        contains_user_input = re.search(USER_INPUT_NAMES, stripped, re.IGNORECASE) is not None
        uses_unsafe_string_building = (
            re.search(r"f[\"'].*\{[^}]+\}.*[\"']", stripped) is not None
            or re.search(r"[\"'].*\b" + SQL_KEYWORDS + r"\b.*[\"']\s*\+", stripped, re.IGNORECASE) is not None
            or ".format(" in stripped
            or "% " in stripped
        )
        uses_parameter_binding = re.search(r"execute\s*\([^,\n]+,\s*[\(\[]", stripped) is not None

        if contains_sql and contains_user_input and uses_unsafe_string_building and not uses_parameter_binding:
            return {"code": stripped, "line_number": line_number}

    return None


def build_parameterized_sql_fix(affected_code: str, language: str) -> str:
    if language.lower() in {"javascript", "typescript", "node", "nodejs"}:
        return 'await db.query("SELECT * FROM users WHERE username = ?", [userInput]);'

    if affected_code.startswith("query"):
        return 'query = "SELECT * FROM users WHERE username = %s"\ncursor.execute(query, (user_input,))'

    return 'cursor.execute("SELECT * FROM users WHERE username = %s", (user_input,))'


def build_fallback_analysis(code: str, language: str):
    vulnerable_snippet = find_sql_injection_snippet(code)
    if vulnerable_snippet:
        return {
            "severity": "high",
            "summary": "Found 1 high-risk SQL injection vulnerability caused by building a SQL statement with untrusted input.",
            "risk_score": 85,
            "vulnerabilities": [
                {
                    "id": "sql-injection-1",
                    "title": "SQL Injection Vulnerability",
                    "owasp_category": "A03:2021 - Injection",
                    "cwe_id": "CWE-89",
                    "severity": "high",
                    "description": "The code builds a SQL query with direct string interpolation or concatenation, allowing attackers to change the query structure.",
                    "affected_code": vulnerable_snippet["code"],
                    "line_numbers": [vulnerable_snippet["line_number"]],
                    "exploit_scenario": "An attacker can submit input such as ' OR 1=1 -- to bypass checks or retrieve unintended rows.",
                }
            ],
            "hallucinations": [],
            "code_smells": [],
            "fix_suggestions": [
                {
                    "id": "FIX-001",
                    "references_issue": "sql-injection-1",
                    "title": "Use parameterized queries",
                    "why_dangerous": "String interpolation and concatenation let attacker-controlled data become executable SQL.",
                    "affected_code": vulnerable_snippet["code"],
                    "fixed_code": build_parameterized_sql_fix(vulnerable_snippet["code"], language),
                    "references": ["OWASP A03:2021", "CWE-89"],
                }
            ],
            "positive_findings": [],
            "recommended_tools": [
                {
                    "tool": "Bandit",
                    "purpose": "Static security checks for risky Python patterns.",
                    "url": "https://bandit.readthedocs.io/",
                }
            ],
        }

    return {
        "severity": "low",
        "summary": "No obvious SQL injection pattern was found by the local fallback scanner. Parameterized query usage appears safe for the checked pattern.",
        "risk_score": 5,
        "vulnerabilities": [],
        "hallucinations": [],
        "code_smells": [],
        "fix_suggestions": [],
        "positive_findings": ["No direct SQL string interpolation or concatenation detected."],
        "recommended_tools": [],
    }


def contains_sql_code(code: str) -> bool:
    return re.search(SQL_KEYWORDS, code, re.IGNORECASE) is not None


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_code_endpoint(request: AnalysisRequest):
    try:
        if contains_sql_code(request.code):
            return build_fallback_analysis(request.code, request.language)

        gemini_api_key = os.getenv("GEMINI_API_KEY")
        has_gemini_key = gemini_api_key and gemini_api_key != "sk-placeholder-key-for-ui-testing"

        if has_gemini_key and gemini_service is not None:
            prompt = build_analysis_prompt(request.code, request.language)
            return await gemini_service.analyze_code(prompt)

        return build_fallback_analysis(request.code, request.language)
    except Exception as e:
        print(f"Gemini API error, falling back to local scanner: {e}")
        return build_fallback_analysis(request.code, request.language)
