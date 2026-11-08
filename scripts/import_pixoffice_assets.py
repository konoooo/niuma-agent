#!/usr/bin/env python3
"""校验并导入使用者自行取得授权的 PixOffice 兼容素材包。"""

import argparse
import hashlib
import json
import shutil
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--from", dest="source", type=Path, help="含 assets/ 与 characters/ 的授权素材目录")
    mode.add_argument("--check", action="store_true", help="仅检查已导入的本机素材")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    destination = root / "web/public/pixoffice"
    source = destination.resolve() if args.check else args.source.expanduser().resolve()
    manifest = json.loads((root / "resources/pixoffice-assets.json").read_text(encoding="utf-8"))
    errors = []
    files = []
    for entry in manifest["files"]:
        relative = Path(entry["path"])
        original = (source / relative).resolve()
        target = (destination / relative).resolve()
        if not original.is_relative_to(source) or not target.is_relative_to(destination.resolve()):
            errors.append(f"路径超出素材目录：{relative}")
            continue
        if not original.is_file():
            errors.append(f"缺少文件：{relative}")
            continue
        if hashlib.sha256(original.read_bytes()).hexdigest() != entry["sha256"]:
            errors.append(f"校验和不匹配：{relative}")
            continue
        files.append((original, target))
    if errors:
        print("素材检查失败，未复制任何文件：")
        print("\n".join(errors[:12]))
        if len(errors) > 12:
            print(f"另有 {len(errors) - 12} 项未通过。")
        return 1
    if args.check:
        print(f"素材校验通过：{len(files)} 个文件。")
        return 0
    for original, target in files:
        target.parent.mkdir(parents=True, exist_ok=True)
        if original != target:
            shutil.copy2(original, target)
    print(f"已导入并校验 {len(files)} 个素材文件。素材目录默认不会提交到 Git。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
