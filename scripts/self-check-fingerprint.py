#!/usr/bin/env python3
"""
self-check 规范包指纹校验

计算 research-dispute/ 下 4 份 SPEC + general.md + bazi.md 的指纹：
  指纹 = "<行数>:<sha256(前 5 个 H2 标题拼接)[:16]>"

用法：
  python3 scripts/self-check-fingerprint.py
"""

import hashlib
import sys
from pathlib import Path

FILES = [
    "research-dispute/general.md",
    "research-dispute/SPEC-catalog.md",
    "research-dispute/SPEC-source.md",
    "research-dispute/SPEC-interpretation.md",
    "research-dispute/SPEC-skill.md",
    "research-dispute/bazi.md",
]


def compute_fingerprint(path: Path) -> str:
    """返回 '<行数>:<sha256_hex[:16]>' 格式指纹"""
    if not path.exists():
        return "0:0"
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    h2_headers = []
    for line in lines:
        if line.startswith("## "):
            h2_headers.append(line.strip())
            if len(h2_headers) == 5:
                break
    headers_blob = "".join(h2_headers).encode("utf-8")
    sha = hashlib.sha256(headers_blob).hexdigest()[:16]
    return f"{len(lines)}:{sha}"


def main():
    repo_root = Path(__file__).parent.parent

    for rel in FILES:
        path = repo_root / rel
        fp = compute_fingerprint(path)
        marker = "✓" if path.exists() else "✗ MISSING"
        print(f"{rel} 指纹: {fp}  {marker}")


if __name__ == "__main__":
    main()
