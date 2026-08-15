# ORBIT — AI Career Intelligence & Readiness Platform

> **Evidence-grounded career readiness analysis using verified technical proof, deterministic scoring, and AI-assisted career guidance.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://orbit-career-platform.vercel.app/)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7)](https://orbit-career-platform.onrender.com/docs)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-646CFF)](https://vitejs.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E)](https://supabase.com/)

---

## 🚀 Overview

**ORBIT** is an AI-powered Career Intelligence & Readiness Platform designed to answer a practical question:

> **"Does a candidate have verifiable technical evidence for a target engineering role?"**

Instead of relying only on self-reported skills from a resume, ORBIT combines:

- Resume-derived technical information
- Live GitHub repository telemetry
- Structured job-description requirements
- Deterministic readiness scoring
- Skill-gap analysis
- Evidence-based career recommendations

The platform is designed around a core principle:

> **A skill should not receive full credit merely because a candidate claims it.**

ORBIT distinguishes between verified evidence, inferred information, and unavailable metrics.

---

## 🌐 Live Application

### Frontend

**ORBIT Production Application**

https://orbit-career-platform.vercel.app/

### Backend API

**FastAPI Production API**

https://orbit-career-platform.onrender.com/

### API Documentation

https://orbit-career-platform.onrender.com/docs

---

# 🎯 Core Problem

Traditional resume screening systems primarily depend on:

- Self-reported skills
- Keyword matching
- Certifications
- Job-title similarity
- Static resume information

This creates a major problem:

> **A candidate can list a technology without having meaningful implementation evidence.**

ORBIT addresses this by connecting job requirements with technical proof.

For example:

```text
Job Requirement
      ↓
Python
      ↓
Candidate GitHub
      ↓
Public repositories inspected
      ↓
Python detected in repository telemetry
      ↓
Evidence State = VERIFIED
