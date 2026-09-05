import hashlib
import json
from datetime import datetime
from api.models import AuditLog

class AuditService:
    @staticmethod
    def create_event_hash(actor, action, entity, entity_id, metadata=None):
        payload = f"{actor}:{action}:{entity}:{entity_id}:{datetime.utcnow().isoformat()}:{json.dumps(metadata or {})}"
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    @classmethod
    def log_action(cls, actor, action, entity, entity_id, metadata=None):
        sha_hash = cls.create_event_hash(actor, action, entity, entity_id, metadata)
        return AuditLog.objects.create(
            actor=actor,
            action=action,
            entity=entity,
            entity_id=entity_id,
            sha256_root=sha_hash,
            metadata=metadata or {}
        )
