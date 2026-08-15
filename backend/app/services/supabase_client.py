"""Supabase PostgreSQL Client Service for ORBIT.

Handles database interactions, data persistence, and provides in-memory fallback
for testing when live Supabase credentials are not configured.
"""
import uuid
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from app.config import settings

# In-memory store fallback for development/testing when Supabase is not connected
_in_memory_db = {
    "candidates": {},
    "candidate_repositories": {},
    "job_descriptions": {},
    "readiness_evaluations": {},
    "interview_records": {}
}


class SupabaseService:
    def __init__(self):
        self.is_connected = False
        self.client = None

        if settings.SUPABASE_URL and settings.SUPABASE_KEY and "placeholder" not in settings.SUPABASE_URL:
            try:
                from supabase import create_client, Client
                self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                self.is_connected = True
            except Exception as e:
                print(f"[SupabaseService] Warning: Could not connect to Supabase: {e}. Falling back to storage mode.")
                self.is_connected = False
        else:
            self.is_connected = False

    # ====================================================================
    # Candidate Operations
    # ====================================================================
    async def create_candidate(self, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        candidate_id = candidate_data.get("id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        
        record = {
            **candidate_data,
            "id": candidate_id,
            "created_at": candidate_data.get("created_at") or now,
            "updated_at": now
        }

        if self.is_connected and self.client:
            try:
                res = self.client.table("candidates").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[SupabaseService] Insert error on candidates: {e}")

        _in_memory_db["candidates"][candidate_id] = record
        return record

    async def get_candidate(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("candidates").select("*").eq("id", candidate_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[SupabaseService] Get candidate error: {e}")

        return _in_memory_db["candidates"].get(candidate_id)

    async def update_candidate(self, candidate_id: str, update_payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        now = datetime.now(timezone.utc).isoformat()
        if self.is_connected and self.client:
            try:
                res = self.client.table("candidates").update({**update_payload, "updated_at": now}).eq("id", candidate_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[SupabaseService] Update candidate error: {e}")

        existing = _in_memory_db["candidates"].get(candidate_id)
        if existing:
            existing.update({**update_payload, "updated_at": now})
            return existing
        return None

    async def list_candidates(self) -> List[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("candidates").select("*").order("created_at", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[SupabaseService] List candidates error: {e}")

        return list(_in_memory_db["candidates"].values())

    # ====================================================================
    # Repository Operations
    # ====================================================================
    async def create_repository(self, repo_data: Dict[str, Any]) -> Dict[str, Any]:
        repo_id = repo_data.get("id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        record = {
            **repo_data,
            "id": repo_id,
            "created_at": repo_data.get("created_at") or now,
            "updated_at": now
        }

        if self.is_connected and self.client:
            try:
                res = self.client.table("candidate_repositories").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[SupabaseService] Insert error on repositories: {e}")

        _in_memory_db["candidate_repositories"][repo_id] = record
        return record

    async def list_repositories_by_candidate(self, candidate_id: str) -> List[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("candidate_repositories").select("*").eq("candidate_id", candidate_id).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[SupabaseService] List repos error: {e}")

        return [r for r in _in_memory_db["candidate_repositories"].values() if r.get("candidate_id") == candidate_id]

    # ====================================================================
    # Job Description Operations
    # ====================================================================
    async def create_job_description(self, job_data: Dict[str, Any]) -> Dict[str, Any]:
        job_id = job_data.get("id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        record = {
            **job_data,
            "id": job_id,
            "created_at": job_data.get("created_at") or now,
            "updated_at": now
        }

        if self.is_connected and self.client:
            try:
                res = self.client.table("job_descriptions").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[SupabaseService] Insert error on job_descriptions: {e}")

        _in_memory_db["job_descriptions"][job_id] = record
        return record

    async def get_job_description(self, job_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("job_descriptions").select("*").eq("id", job_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[SupabaseService] Get job error: {e}")

        return _in_memory_db["job_descriptions"].get(job_id)

    async def list_job_descriptions(self) -> List[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = self.client.table("job_descriptions").select("*").order("created_at", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"[SupabaseService] List jobs error: {e}")

        return list(_in_memory_db["job_descriptions"].values())

    # ====================================================================
    # Readiness Evaluation Operations
    # ====================================================================
    async def create_readiness_evaluation(self, eval_data: Dict[str, Any]) -> Dict[str, Any]:
        eval_id = eval_data.get("id") or str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        record = {
            **eval_data,
            "id": eval_id,
            "created_at": eval_data.get("created_at") or now,
            "updated_at": now
        }

        if self.is_connected and self.client:
            try:
                res = self.client.table("readiness_evaluations").insert(record).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[SupabaseService] Insert error on evaluations: {e}")

        _in_memory_db["readiness_evaluations"][eval_id] = record
        return record

    async def get_latest_evaluation(self, candidate_id: str, job_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.client:
            try:
                res = (
                    self.client.table("readiness_evaluations")
                    .select("*")
                    .eq("candidate_id", candidate_id)
                    .eq("job_id", job_id)
                    .order("created_at", desc=True)
                    .limit(1)
                    .execute()
                )
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[SupabaseService] Get eval error: {e}")

        matched = [
            e for e in _in_memory_db["readiness_evaluations"].values()
            if e.get("candidate_id") == candidate_id and e.get("job_id") == job_id
        ]
        return matched[-1] if matched else None


supabase_service = SupabaseService()
