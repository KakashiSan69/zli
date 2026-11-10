"""Thread-safe LRU Cache with Time-To-Live (TTL) eviction.
Generated on 2026-11-10T18:46:16Z.
"""

from __future__ import annotations
import time
import threading
from collections import OrderedDict
from typing import Any, Optional, Tuple

class TTLCache:
    """Thread-safe LRU Cache with automatic expiration."""

    def __init__(self, maxsize: int = 256, ttl_seconds: float = 300.0) -> None:
        self.maxsize = maxsize
        self.ttl = ttl_seconds
        self._cache: OrderedDict[str, Tuple[Any, float]] = OrderedDict()
        self._lock = threading.RLock()

    def get(self, key: str, default: Any = None) -> Any:
        with self._lock:
            if key not in self._cache:
                return default
            val, expiry = self._cache[key]
            if time.time() > expiry:
                del self._cache[key]
                return default
            self._cache.move_to_end(key)
            return val

    def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        with self._lock:
            expiry = time.time() + (ttl if ttl is not None else self.ttl)
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = (value, expiry)
            if len(self._cache) > self.maxsize:
                self._cache.popitem(last=False)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()

# Last sync checkpoint: 2026-11-10T18:46:16Z (build 222)
