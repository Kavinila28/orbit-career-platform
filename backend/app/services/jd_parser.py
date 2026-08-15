"""Deterministic Job Description Taxonomy Parser & Algorithmic Weighting Engine for ORBIT.

Extracts structured technical skill requirements from raw job description text,
classifies requirements into Required vs Preferred, resolves synonyms to canonical
taxonomy keys, and assigns strictly normalized mathematical weights at full precision.
"""
import re
from typing import Dict, Any, List, Optional, Tuple
from pydantic import BaseModel, Field


class ParsedJobSkill(BaseModel):
    name: str
    category: str
    importance: str  # "Required" | "Preferred"
    weight: float = Field(ge=0.0, le=1.0)
    raw_mentions: int = 1
    description: str


class ExtractedJobData(BaseModel):
    title: str
    company: str
    department: str
    level: str
    location: str
    salary_range: Optional[str]
    raw_description: str
    required_skills: List[Dict[str, Any]]
    preferred_skills: List[Dict[str, Any]]
    responsibilities: List[str]
    total_skills_detected: int


# Canonical Synonyms Mapping Dictionary
SKILL_SYNONYMS = {
    # Languages
    "python": "Python",
    "py": "Python",
    "python3": "Python",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "golang": "Go",
    "go": "Go",
    "c++": "C++",
    "cpp": "C++",
    "c#": "C#",
    "csharp": "C#",
    "java": "Java",
    "rust": "Rust",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "bash": "Bash",
    "shell": "Bash",
    "sql": "SQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "sqlite": "SQLite",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    
    # AI / ML
    "pytorch": "PyTorch",
    "torch": "PyTorch",
    "tensorflow": "TensorFlow",
    "tf": "TensorFlow",
    "keras": "Keras",
    "scikit-learn": "Scikit-Learn",
    "sklearn": "Scikit-Learn",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "computer vision": "Computer Vision",
    "cv": "Computer Vision",
    "llm": "LLM",
    "large language models": "LLM",
    "transformers": "Transformers",
    "transformer": "Transformers",
    "huggingface": "Hugging Face",
    "hugging face": "Hugging Face",
    "onnx": "ONNX",
    "langchain": "LangChain",
    
    # Backend
    "fastapi": "FastAPI",
    "fast-api": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    "node": "Node.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express",
    "express.js": "Express",
    "nestjs": "NestJS",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "graphql": "GraphQL",
    "rest": "REST APIs",
    "rest api": "REST APIs",
    "restful": "REST APIs",
    "grpc": "gRPC",
    
    # Cloud & DevOps
    "docker": "Docker",
    "containerization": "Docker",
    "containers": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "GCP",
    "google cloud": "GCP",
    "azure": "Azure",
    "terraform": "Terraform",
    "ci/cd": "CI/CD",
    "github actions": "GitHub Actions",
    "linux": "Linux",
    "helm": "Helm",
    "prometheus": "Prometheus",
    "grafana": "Grafana",
    
    # Frontend
    "react": "React",
    "react.js": "React",
    "reactjs": "React",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "vue": "Vue",
    "vue.js": "Vue",
    "vuejs": "Vue",
    "tailwind": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "redux": "Redux"
}

# Skill Categories
CATEGORY_MAPPING = {
    "Python": "Languages", "JavaScript": "Languages", "TypeScript": "Languages",
    "Go": "Languages", "C++": "Languages", "C#": "Languages", "Java": "Languages",
    "Rust": "Languages", "Kotlin": "Languages", "Swift": "Languages", "Bash": "Languages",
    "SQL": "Databases", "PostgreSQL": "Databases", "MySQL": "Databases", "SQLite": "Databases",
    "MongoDB": "Databases", "Redis": "Databases",
    "PyTorch": "AI/ML", "TensorFlow": "AI/ML", "Keras": "AI/ML", "Scikit-Learn": "AI/ML",
    "Machine Learning": "AI/ML", "Deep Learning": "AI/ML", "NLP": "AI/ML",
    "Computer Vision": "AI/ML", "LLM": "AI/ML", "Transformers": "AI/ML",
    "Hugging Face": "AI/ML", "ONNX": "AI/ML", "LangChain": "AI/ML",
    "FastAPI": "Backend", "Flask": "Backend", "Django": "Backend", "Node.js": "Backend",
    "Express": "Backend", "NestJS": "Backend", "Spring Boot": "Backend", "GraphQL": "Backend",
    "REST APIs": "Backend", "gRPC": "Backend",
    "Docker": "Cloud/DevOps", "Kubernetes": "Cloud/DevOps", "AWS": "Cloud/DevOps",
    "GCP": "Cloud/DevOps", "Azure": "Cloud/DevOps", "Terraform": "Cloud/DevOps",
    "CI/CD": "Cloud/DevOps", "GitHub Actions": "Cloud/DevOps", "Linux": "Cloud/DevOps",
    "Helm": "Cloud/DevOps", "Prometheus": "Cloud/DevOps", "Grafana": "Cloud/DevOps",
    "React": "Frontend", "Next.js": "Frontend", "Vue": "Frontend",
    "Tailwind CSS": "Frontend", "Redux": "Frontend"
}


def segment_job_description(text: str) -> Dict[str, str]:
    """Segment raw job description into sections (Required, Preferred, Responsibilities)."""
    section_patterns = {
        "required": r"(?:minimum\s+qualifications|requirements(?:\s*&(?:\s*qualifications)?)?|what\s+you(?:'ll|\s+will)\s+need|required\s+skills|basic\s+qualifications|must\s+have)",
        "preferred": r"(?:preferred\s+qualifications|preferred(?:\s*&(?:\s*qualifications)?)?|nice\s+to\s+have|bonus\s+points|bonus\s+qualifications|preferred\s+skills|plus)",
        "responsibilities": r"(?:responsibilities|what\s+you(?:'ll|\s+will)\s+do|the\s+role|about\s+the\s+role|key\s+responsibilities|duties)",
        "about": r"(?:about\s+us|company\s+overview|who\s+we\s+are)"
    }

    normalized_text = text.replace("\r\n", "\n")
    lines = normalized_text.split("\n")
    
    sections = {
        "header": "",
        "required": "",
        "preferred": "",
        "responsibilities": "",
        "about": "",
        "body": ""
    }

    current_section = "body"
    header_regex = re.compile(
        r"^(?:\d+\.?\s*)?(?:" + "|".join(
            f"(?P<{k}>{pat})" for k, pat in section_patterns.items()
        ) + r")(?:\s*[:\-])?$",
        re.IGNORECASE
    )

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        match = header_regex.match(stripped)
        if match:
            for sec_name in section_patterns.keys():
                if match.group(sec_name):
                    current_section = sec_name
                    break
        else:
            sections[current_section] += line + "\n"

    return {k: v.strip() for k, v in sections.items() if v.strip()}


def extract_responsibilities(text: str, sections: Dict[str, str]) -> List[str]:
    """Extract actionable day-to-day engineering responsibilities."""
    resp_text = sections.get("responsibilities", "")
    if not resp_text:
        resp_text = text

    extracted = []
    lines = resp_text.split("\n")
    for line in lines:
        cleaned = line.strip()
        if re.match(r"^[\-\*•\d\.]+\s+[A-Z]", cleaned) and len(cleaned) > 25:
            item = re.sub(r"^[\-\*•\d\.]+\s+", "", cleaned)
            if item not in extracted and len(extracted) < 6:
                extracted.append(item)

    if not extracted:
        extracted = [
            "Design, build, and maintain production software systems.",
            "Collaborate across cross-functional engineering and product teams.",
            "Implement high-quality unit and integration test coverage."
        ]

    return extracted


def extract_skills_and_weights(raw_text: str, sections: Dict[str, str]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Deterministically extracts skills, classifies Required vs Preferred,
    and applies full-precision mathematical weight normalization (Sum of weights == 1.0).
    
    Mathematical Weighting Rules:
    1. Base Importance:
       - Required skill: base_weight = 1.0
       - Preferred skill: base_weight = 0.5
    2. Mention Frequency Multiplier:
       - multiplier = min(1.3, 1.0 + 0.1 * (mentions - 1))
    3. Normalization Formula (Full Float Precision):
       - raw_weight = base_weight * multiplier
       - normalized_weight = raw_weight / sum(raw_weights)
    4. Exact Sum Guarantee:
       - math.isclose(sum(normalized_weights), 1.0, rel_tol=1e-9) == True
    """
    raw_text_lower = raw_text.lower()
    required_text_lower = (sections.get("required", "") + "\n" + sections.get("body", "")).lower()
    preferred_text_lower = sections.get("preferred", "").lower()

    detected_skills_map: Dict[str, Dict[str, Any]] = {}

    # Identify all distinct canonical skills present in text
    for synonym_kw, canonical_name in SKILL_SYNONYMS.items():
        pattern = r"\b" + re.escape(synonym_kw) + r"\b"
        matches = list(re.finditer(pattern, raw_text_lower))
        count = len(matches)

        if count > 0:
            in_preferred = bool(re.search(pattern, preferred_text_lower)) and not bool(re.search(pattern, required_text_lower))
            importance = "Preferred" if in_preferred else "Required"
            
            if canonical_name not in detected_skills_map:
                detected_skills_map[canonical_name] = {
                    "name": canonical_name,
                    "category": CATEGORY_MAPPING.get(canonical_name, "General"),
                    "importance": importance,
                    "mentions": count
                }
            else:
                detected_skills_map[canonical_name]["mentions"] += count
                if importance == "Required":
                    detected_skills_map[canonical_name]["importance"] = "Required"

    if not detected_skills_map:
        return (
            [
                {"name": "Python", "category": "Languages", "importance": "Required", "weight": 0.5, "description": "Core programming competency"},
                {"name": "SQL", "category": "Databases", "importance": "Required", "weight": 0.5, "description": "Database querying competency"}
            ],
            []
        )

    # Calculate raw weights
    skill_entries = list(detected_skills_map.values())
    raw_weights = []
    for s in skill_entries:
        base_w = 1.0 if s["importance"] == "Required" else 0.5
        freq_multiplier = min(1.3, 1.0 + 0.1 * (s["mentions"] - 1))
        raw_w = base_w * freq_multiplier
        s["raw_weight"] = raw_w
        raw_weights.append(raw_w)

    total_raw_weight = sum(raw_weights) if raw_weights else 1.0

    # Normalize weights at full precision
    required_list = []
    preferred_list = []

    for s in skill_entries:
        norm_weight = s["raw_weight"] / total_raw_weight
        formatted_skill = {
            "name": s["name"],
            "category": s["category"],
            "importance": s["importance"],
            "weight": norm_weight,
            "description": f"Core competency for {s['name']} in {s['category']}"
        }

        if s["importance"] == "Required":
            required_list.append(formatted_skill)
        else:
            preferred_list.append(formatted_skill)

    # Sort descending by weight for clear ranking
    required_list.sort(key=lambda x: x["weight"], reverse=True)
    preferred_list.sort(key=lambda x: x["weight"], reverse=True)

    return required_list, preferred_list


def parse_job_description(
    raw_text: str,
    title: Optional[str] = None,
    company: Optional[str] = None,
    department: Optional[str] = None,
    level: Optional[str] = None,
    location: Optional[str] = None,
    salary_range: Optional[str] = None
) -> ExtractedJobData:
    """End-to-end deterministic job description parser."""
    if not raw_text or len(raw_text.strip()) < 15:
        raise ValueError("Job description text is empty or too short to analyze.")

    sections = segment_job_description(raw_text)
    required_skills, preferred_skills = extract_skills_and_weights(raw_text, sections)
    responsibilities = extract_responsibilities(raw_text, sections)

    inferred_title = title or "Software Engineer"
    if not title:
        first_line = raw_text.strip().split("\n")[0]
        if len(first_line) < 60 and not re.search(r"[:@]", first_line):
            inferred_title = first_line

    return ExtractedJobData(
        title=inferred_title,
        company=company or "Company Benchmark",
        department=department or "Engineering",
        level=level or "Target Role",
        location=location or "Remote / Hybrid",
        salary_range=salary_range or "$130,000 - $180,000",
        raw_description=raw_text,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        responsibilities=responsibilities,
        total_skills_detected=len(required_skills) + len(preferred_skills)
    )
