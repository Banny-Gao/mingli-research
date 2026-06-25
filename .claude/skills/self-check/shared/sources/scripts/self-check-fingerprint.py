#!/usr/bin/env python3
"""
self-check 规范包指纹校验

计算 research-dispute/ 下 4 份 SPEC + general.md + bazi.md 的指纹：
  指纹 = "<行数>:<sha256(前 5 个 H2 标题拼接)[:16]>"

用法：
  python3 scripts/self-check-fingerprint.py                                  # 默认：项目根 + research-dispute/
  python3 scripts/self-check-fingerprint.py --project-root <path>            # 显式项目根
  python3 scripts/self-check-fingerprint.py --source-prefix <prefix>         # 自定义源前缀
                                                                                #   默认 'research-dispute'，隔离环境传 '' 指向 sources/ 副本
  python3 scripts/self-check-fingerprint.py --files <rel-path>               # 临时只检查 1 个文件（调试用）

项目根解析优先级：--project-root > 脚本所在目录的父级 > Path.cwd()
源前缀解析优先级：--source-prefix > 默认 'research-dispute'
注意：脚本位于 sources/scripts/ 时，"脚本所在目录的父级"即 sources/，并非仓库根；指到仓库根请显式传 --project-root。
"""

import argparse
import hashlib
import sys
from pathlib import Path

FILES = [
    "general.md",
    "SPEC-catalog.md",
    "SPEC-source.md",
    "SPEC-interpretation.md",
    "SPEC-skill.md",
    "bazi.md",
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
    parser = argparse.ArgumentParser(
        description="self-check 规范包指纹校验",
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=None,
        help="项目根（覆盖脚本位置推导）",
    )
    parser.add_argument(
        "--source-prefix",
        type=str,
        default="research-dispute",
        help="源文件所在目录前缀（默认 research-dispute；隔离环境传 '' 指向 sources/ 副本）",
    )
    parser.add_argument(
        "--files",
        nargs="*",
        default=None,
        help="只检查指定的相对路径列表（调试用）",
    )
    args = parser.parse_args()

    if args.project_root is not None:
        repo_root = args.project_root.resolve()
    else:
        # 默认：脚本所在目录的父级（脚本在 scripts/ 下，向上 1 步到项目根）
        repo_root = Path(__file__).resolve().parent.parent

    targets = args.files if args.files is not None else FILES
    source_prefix = args.source_prefix
    for rel in targets:
        # 若 rel 已是绝对路径（用 --files 调试时），直接用；否则拼 prefix
        if Path(rel).is_absolute():
            path = Path(rel)
            display = rel
        elif source_prefix:
            path = repo_root / source_prefix / rel
            display = f"{source_prefix}/{rel}"
        else:
            path = repo_root / rel
            display = rel
        fp = compute_fingerprint(path)
        marker = "✓" if path.exists() else "✗ MISSING"
        print(f"{display} 指纹: {fp}  {marker}")


if __name__ == "__main__":
    main()
