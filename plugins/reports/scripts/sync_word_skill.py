#!/usr/bin/env python3
"""Keep the files that the Word skills (skills/*-word) carry in step with the shared references.

The Word skills are self-contained (the add-in may not resolve ../../references), so each holds copies
of the shared rules. references/ is the source.

    python scripts/sync_word_skill.py          copy the shared files into the Word skill
    python scripts/sync_word_skill.py --check  exit 1 if a copy is out of date
"""
import argparse
import sys
from pathlib import Path

PLUGIN = Path(__file__).resolve().parent.parent
SHARED = ["regras-academicas.md", "checklist.md"]
TARGETS = sorted(p for p in (PLUGIN / "skills").glob("*-word") if p.is_dir())


def read(path: Path) -> bytes:
    return path.read_bytes().replace(b"\r\n", b"\n")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    stale = []
    for target in TARGETS:
        for name in SHARED:
            src, dst = PLUGIN / "references" / name, target / name
            if not dst.is_file() or read(src) != read(dst):
                stale.append(f"{target.name}/{name}")
                if not args.check:
                    dst.write_bytes(src.read_bytes())

    if args.check:
        if stale:
            print("Out of date: " + ", ".join(stale) + ". Run scripts/sync_word_skill.py.", file=sys.stderr)
            return 1
        print("OK: the Word skills' copies match references/.")
        return 0
    print("Copied: " + (", ".join(stale) if stale else "nothing, already in step"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
