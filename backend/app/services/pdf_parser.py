"""Real PDF Resume Extraction & Section Analysis Engine for ORBIT.

Uses pypdf for binary text extraction and deterministic NLP/regex heuristics
for section segmentation and technical skill taxonomy extraction.
"""
import io
import re
from typing import Dict, Any, List, Optional, Tuple
from pypdf import PdfReader
from pydantic import BaseModel


class ExtractedResumeData(BaseModel):
    raw_text: str
    name: str
    email: Optional[str] = None
    github_username: Optional[str] = None
    location: Optional[str] = "Remote"
    education: Optional[str] = None
    sections: Dict[str, str]
    extracted_skills: List[Dict[str, Any]]
    certifications: List[Dict[str, Any]]
    stats: Dict[str, Any]


# Canonical Technical Skill Taxonomy Dictionary
TECH_TAXONOMY = {
    "Languages": [
        "Python", "JavaScript", "TypeScript", "C++", "C#", "Java", "Go", "Golang", 
        "Rust", "SQL", "R", "Bash", "Shell", "HTML", "CSS", "Kotlin", "Swift"
    ],
    "AI/ML": [
        "PyTorch", "TensorFlow", "Scikit-Learn", "Keras", "Machine Learning", 
        "Deep Learning", "NLP", "Natural Language Processing", "Computer Vision",
        "LLM", "Transformers", "Hugging Face", "HuggingFace", "BERT", "RoBERTa",
        "ONNX", "LangChain", "LlamaIndex", "Vector Databases", "Chroma", "Pinecone"
    ],
    "Backend": [
        "FastAPI", "Flask", "Django", "Node.js", "Express", "NestJS", "Spring Boot",
        "GraphQL", "REST", "RESTful API", "gRPC", "Microservices"
    ],
    "Databases": [
        "PostgreSQL", "Postgres", "MySQL", "SQLite", "MongoDB", "Redis", 
        "DynamoDB", "Cassandra", "Elasticsearch", "SQLAlchemy", "Prisma"
    ],
    "Cloud/DevOps": [
        "Docker", "Kubernetes", "K8s", "AWS", "Amazon Web Services", "GCP", 
        "Google Cloud Platform", "Azure", "Terraform", "CI/CD", "GitHub Actions",
        "GitLab CI", "Linux", "Helm", "Prometheus", "Grafana"
    ],
    "Frontend": [
        "React", "Next.js", "Vue", "Vue.js", "Angular", "Tailwind CSS", 
        "Redux", "Vite", "Webpack"
    ]
}

# Known Certification Patterns
KNOWN_CERTS = [
    {"pattern": r"AWS\s+Certified\s+Solutions\s+Architect", "name": "AWS Certified Solutions Architect", "skill": "AWS"},
    {"pattern": r"AWS\s+Certified\s+(?:Developer|Cloud\s+Practitioner|SysOps)", "name": "AWS Certified Practitioner/Developer", "skill": "AWS"},
    {"pattern": r"TensorFlow\s+Developer\s+Certificate", "name": "TensorFlow Developer Certificate", "skill": "TensorFlow"},
    {"pattern": r"CKA|Certified\s+Kubernetes\s+Administrator", "name": "Certified Kubernetes Administrator (CKA)", "skill": "Kubernetes"},
    {"pattern": r"GCP\s+Professional\s+Cloud\s+Architect", "name": "GCP Professional Cloud Architect", "skill": "GCP"},
    {"pattern": r"HashiCorp\s+Certified:\s+Terraform\s+Associate", "name": "Terraform Associate", "skill": "Terraform"}
]


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text from PDF binary stream using pypdf.
    
    Raises:
        ValueError: If PDF is empty, encrypted, or corrupted.
    """
    if not pdf_bytes or len(pdf_bytes) < 10:
        raise ValueError("Uploaded file is empty or too small to be a valid PDF.")

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
    except Exception as e:
        raise ValueError(f"Corrupt or invalid PDF file format: {str(e)}")

    if reader.is_encrypted:
        raise ValueError("PDF is encrypted and cannot be parsed without password.")

    if len(reader.pages) == 0:
        raise ValueError("PDF document contains 0 pages.")

    full_text = []
    for page_idx, page in enumerate(reader.pages):
        page_text = page.extract_text()
        if page_text:
            full_text.append(page_text)

    combined_text = "\n\n".join(full_text).strip()
    if not combined_text:
        raise ValueError("PDF contains no extractable text (it may be a scanned image).")

    return combined_text


def segment_resume_sections(text: str) -> Dict[str, str]:
    """Segment raw resume text into logical sections based on standard headings."""
    section_patterns = {
        "skills": r"(?:technical\s+skills|skills|technologies|core\s+competencies|tooling)",
        "experience": r"(?:work\s+experience|professional\s+experience|experience|employment\s+history)",
        "education": r"(?:education|academic\s+background|academic\s+history|university)",
        "projects": r"(?:projects|technical\s+projects|open\s+source|personal\s+projects)",
        "certifications": r"(?:certifications|certificates|licenses|credentials)"
    }

    # Normalize newlines
    normalized_text = text.replace("\r\n", "\n")
    lines = normalized_text.split("\n")
    
    sections = {
        "header": "",
        "skills": "",
        "experience": "",
        "education": "",
        "projects": "",
        "certifications": "",
        "other": ""
    }

    current_section = "header"
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


def extract_candidate_name(header_text: str, full_text: str) -> str:
    """Extract candidate name from header or top lines of resume."""
    candidates_lines = (header_text or full_text).split("\n")
    for line in candidates_lines[:5]:
        cleaned = line.strip()
        # Look for standard 2-4 word name line
        if re.match(r"^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$", cleaned):
            return cleaned
    
    # Fallback to first non-empty line
    for line in candidates_lines[:3]:
        cleaned = line.strip()
        if cleaned and len(cleaned) < 50 and not re.search(r"[@/\\:]", cleaned):
            return cleaned

    return "Candidate"


def extract_email(text: str) -> Optional[str]:
    """Extract email address from text."""
    match = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text)
    return match.group(0) if match else None


def extract_github_username(text: str) -> Optional[str]:
    """Extract GitHub handle or URL from text."""
    match = re.search(r"(?:github\.com/|github:\s*@?)([A-Za-z0-9-]+)", text, re.IGNORECASE)
    if match:
        return match.group(1)
    
    # Check for @username if near github keyword
    if "github" in text.lower():
        match_handle = re.search(r"@([A-Za-z0-9-]{3,39})\b", text)
        if match_handle:
            return match_handle.group(1)
            
    return None


def extract_certifications(text: str) -> List[Dict[str, Any]]:
    """Detect verified and recognized technical certifications."""
    detected = []
    for cert in KNOWN_CERTS:
        if re.search(cert["pattern"], text, re.IGNORECASE):
            detected.append({
                "name": cert["name"],
                "target_skill": cert["skill"],
                "evidence_state": "PARTIAL"
            })
    return detected


def extract_skills_with_taxonomy(
    full_text: str, 
    sections: Dict[str, str], 
    certifications: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Deterministically extract skills and assign strict evidence states."""
    extracted = []
    text_lower = full_text.lower()
    skills_section = sections.get("skills", "").lower()

    cert_skills = {c["target_skill"].lower(): c["name"] for c in certifications}

    for category, skill_list in TECH_TAXONOMY.items():
        for skill in skill_list:
            # Word boundary regex for exact matching
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"
            matches = list(re.finditer(pattern, text_lower))
            mention_count = len(matches)

            if mention_count > 0:
                has_cert = skill.lower() in cert_skills
                cert_name = cert_skills.get(skill.lower())

                # Since this is parsed from resume without GitHub sync yet,
                # evidenceState is strictly SELF_REPORTED unless paired with a recognized credential
                evidence_state = "PARTIAL" if has_cert else "SELF_REPORTED"

                extracted.append({
                    "name": skill,
                    "category": category,
                    "resumeMentions": mention_count,
                    "repoCount": 0,  # 0 until GitHub audit is performed
                    "certified": has_cert,
                    "certName": cert_name,
                    "evidenceState": evidence_state
                })

    return extracted


def parse_resume_pdf(pdf_bytes: bytes) -> ExtractedResumeData:
    """End-to-end deterministic PDF resume parsing pipeline."""
    raw_text = extract_text_from_pdf(pdf_bytes)
    sections = segment_resume_sections(raw_text)
    
    header_text = sections.get("header", "")
    name = extract_candidate_name(header_text, raw_text)
    email = extract_email(raw_text)
    github_user = extract_github_username(raw_text)
    certifications = extract_certifications(raw_text)
    
    extracted_skills = extract_skills_with_taxonomy(raw_text, sections, certifications)
    education_text = sections.get("education", "")

    # Clean education summary
    education_summary = None
    if education_text:
        edu_first_lines = [l.strip() for l in education_text.split("\n") if l.strip()]
        if edu_first_lines:
            education_summary = " • ".join(edu_first_lines[:2])

    top_lang = "Python"
    lang_skills = [s for s in extracted_skills if s["category"] == "Languages"]
    if lang_skills:
        lang_skills.sort(key=lambda s: s["resumeMentions"], reverse=True)
        top_lang = lang_skills[0]["name"]

    return ExtractedResumeData(
        raw_text=raw_text,
        name=name,
        email=email,
        github_username=github_user,
        location="Remote / Hybrid",
        education=education_summary,
        sections=sections,
        extracted_skills=extracted_skills,
        certifications=certifications,
        stats={
            "totalRepos": 0,
            "commitCountYear": 0,
            "topLanguage": top_lang
        }
    )
