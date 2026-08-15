import io
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.pdf_parser import extract_text_from_pdf, parse_resume_pdf


def generate_test_pdf_bytes(content: str) -> bytes:
    """Generate a real valid PDF in memory with ASCII-safe text stream."""
    # Replace unicode characters with standard ASCII for test PDF stream
    clean_content = (
        content
        .replace("\u2022", "-")
        .replace("•", "-")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .replace("\r", "")
    )
    lines = clean_content.split("\n")
    
    stream_lines = ["BT", "/F1 12 Tf", "50 750 Td", "14 TL"]
    for line in lines:
        stream_lines.append(f"({line}) '")
    stream_lines.append("ET")
    text_stream = "\n".join(stream_lines)
    text_bytes = text_stream.encode("utf-8")

    pdf_content = (
        f"%PDF-1.4\n"
        f"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        f"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        f"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        f"4 0 obj << /Length {len(text_bytes)} >>\n"
        f"stream\n{text_stream}\nendstream\nendobj\n"
        f"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        f"xref\n0 6\n"
        f"0000000000 65535 f \n"
        f"0000000010 00000 n \n"
        f"0000000060 00000 n \n"
        f"0000000115 00000 n \n"
        f"0000000240 00000 n \n"
        f"0000000320 00000 n \n"
        f"trailer << /Size 6 /Root 1 0 R >>\n"
        f"startxref\n390\n%%EOF\n"
    )
    return pdf_content.encode("utf-8")


@pytest.fixture
def sample_resume_text():
    return """Alex Rivera
San Francisco, CA - alex.rivera@example.com - github.com/alexrivera-ai

Education
B.S. in Computer Science, Stanford University (2020 - 2024)

Technical Skills
Languages: Python, JavaScript, TypeScript, SQL, Bash
AI & Machine Learning: PyTorch, TensorFlow, Scikit-Learn, Hugging Face, Transformers
Backend & Databases: FastAPI, PostgreSQL, Redis, REST APIs
Cloud & DevOps: Docker, AWS, GitHub Actions, Linux

Certifications
AWS Certified Solutions Architect Associate (2024)

Work Experience
Junior Machine Learning Engineer - AI Startup Inc. (2023 - Present)
- Developed and fine-tuned Transformer models in PyTorch for sentiment analysis.
- Built async REST endpoints using FastAPI and PostgreSQL.
- Packaged ML inference pipelines into Docker containers.
"""


@pytest.mark.asyncio
async def test_pdf_extraction_service(sample_resume_text):
    """Test real PDF text extraction and deterministic taxonomy parsing."""
    pdf_bytes = generate_test_pdf_bytes(sample_resume_text)
    assert len(pdf_bytes) > 50

    # 1. Raw extraction test
    extracted_text = extract_text_from_pdf(pdf_bytes)
    assert "Alex Rivera" in extracted_text
    assert "PyTorch" in extracted_text

    # 2. End-to-end parsing test
    result = parse_resume_pdf(pdf_bytes)
    assert result.name == "Alex Rivera"
    assert result.email == "alex.rivera@example.com"
    assert result.github_username == "alexrivera-ai"
    assert "education" in result.sections
    assert "skills" in result.sections
    assert "certifications" in result.sections

    # Check extracted skills
    skill_names = [s["name"] for s in result.extracted_skills]
    assert "Python" in skill_names
    assert "FastAPI" in skill_names
    assert "PyTorch" in skill_names
    assert "Docker" in skill_names
    assert "AWS" in skill_names

    # Check that AWS skill has PARTIAL evidence due to certificate, while others are SELF_REPORTED
    aws_skill = next(s for s in result.extracted_skills if s["name"] == "AWS")
    assert aws_skill["certified"] is True
    assert aws_skill["evidenceState"] == "PARTIAL"

    fastapi_skill = next(s for s in result.extracted_skills if s["name"] == "FastAPI")
    assert fastapi_skill["certified"] is False
    assert fastapi_skill["evidenceState"] == "SELF_REPORTED"
    assert fastapi_skill["repoCount"] == 0  # Zero fabricated repos


@pytest.mark.asyncio
async def test_upload_resume_endpoint(sample_resume_text):
    """Test POST /api/v1/resumes/upload with a valid PDF file."""
    pdf_bytes = generate_test_pdf_bytes(sample_resume_text)
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        files = {"file": ("alex_rivera_resume.pdf", pdf_bytes, "application/pdf")}
        response = await client.post("/api/v1/resumes/upload", files=files)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Alex Rivera"
        assert data["email"] == "alex.rivera@example.com"
        assert data["github_username"] == "alexrivera-ai"
        assert len(data["extracted_skills"]) > 5
        assert "skills" in data["sections_detected"]


@pytest.mark.asyncio
async def test_upload_non_pdf_rejected():
    """Test that uploading non-PDF files is rejected with HTTP 400."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        files = {"file": ("resume.docx", b"PKFakeWordDocContent", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        response = await client.post("/api/v1/resumes/upload", files=files)
        assert response.status_code == 400
        assert "Only PDF format is supported" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_empty_pdf_rejected():
    """Test that uploading an empty 0-byte file is rejected with HTTP 400."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        files = {"file": ("empty.pdf", b"", "application/pdf")}
        response = await client.post("/api/v1/resumes/upload", files=files)
        assert response.status_code == 400
        assert "empty" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_upload_corrupt_pdf_rejected():
    """Test that corrupted PDF bytes return HTTP 422 Unprocessable Entity."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        files = {"file": ("corrupted.pdf", b"%PDF-1.4\nCorrupted binary payload\n%%EOF", "application/pdf")}
        response = await client.post("/api/v1/resumes/upload", files=files)
        assert response.status_code in [400, 422]
