#!/usr/bin/env python3
"""Accept, reject or check the review markup that report-review writes into a LaTeX copy.

The markup is the `changes` package's:

    \\added[id=C, comment={why}]{new text}
    \\deleted[id=C]{old text}
    \\replaced[id=C]{new text}{old text}
    \\highlight[id=C]{text}
    \\comment[id=C]{note}

Lines that contain the marker `% reports-review` (the package line added to the preamble) are removed
by accept and reject.

    python tex_changes.py accept FILE [-o OUT]    keep the new text, drop notes
    python tex_changes.py reject FILE [-o OUT]    give back the original text
    python tex_changes.py check ORIGINAL REVISED  exit 0 if rejecting REVISED gives ORIGINAL

Without -o, accept and reject print to stdout; they never overwrite FILE.
"""
import argparse
import re
import sys
from pathlib import Path

MARKER = "% reports-review"
NAMES = {"added": 1, "deleted": 1, "replaced": 2, "highlight": 1, "comment": 1}
START = re.compile(r"(?<!\\)\\(added|deleted|replaced|highlight|comment)(?![A-Za-z])")


def _balanced(text: str, i: int, open_c: str, close_c: str):
    """text[i] must be open_c. Returns (inner, index after the closing char)."""
    depth = 0
    j = i
    while j < len(text):
        c = text[j]
        if c == "\\":
            j += 2
            continue
        if c == open_c:
            depth += 1
        elif c == close_c:
            depth -= 1
            if depth == 0:
                return text[i + 1 : j], j + 1
        j += 1
    raise ValueError("unbalanced delimiter in review markup")


def _resolve(text: str, mode: str) -> str:
    out = []
    pos = 0
    while True:
        m = START.search(text, pos)
        if not m:
            out.append(text[pos:])
            break
        out.append(text[pos : m.start()])
        name = m.group(1)
        j = m.end()
        if j < len(text) and text[j] == "[":
            _, j = _balanced(text, j, "[", "]")
        args = []
        for _ in range(NAMES[name]):
            if j >= len(text) or text[j] != "{":
                raise ValueError(f"\\{name} is missing an argument near: {text[m.start():m.start()+40]!r}")
            inner, j = _balanced(text, j, "{", "}")
            args.append(inner)
        pos = j
        if name == "comment":
            continue
        if name == "highlight":
            keep = args[0]
        elif name == "added":
            keep = args[0] if mode == "accept" else ""
        elif name == "deleted":
            keep = "" if mode == "accept" else args[0]
        else:  # replaced
            keep = args[0] if mode == "accept" else args[1]
        out.append(_resolve(keep, mode))
    return "".join(out)


def resolve(text: str, mode: str) -> str:
    lines = [ln for ln in text.splitlines(keepends=True) if MARKER not in ln]
    return _resolve("".join(lines), mode)


def read(path: str) -> str:
    with open(path, encoding="utf-8", newline="") as f:
        return f.read()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("command", choices=["accept", "reject", "check"])
    ap.add_argument("file")
    ap.add_argument("other", nargs="?")
    ap.add_argument("-o", "--out")
    args = ap.parse_args()

    if args.command == "check":
        if not args.other:
            ap.error("check needs ORIGINAL and REVISED")
        original = read(args.file)
        revised = read(args.other)
        try:
            rejected = resolve(revised, "reject")
        except ValueError as e:
            print(f"DIFFERENT: {e}", file=sys.stderr)
            return 1
        if rejected == original:
            print("OK: rejecting every change gives back the original.")
            return 0
        print("DIFFERENT: rejecting every change does not give back the original.", file=sys.stderr)
        return 1

    try:
        result = resolve(read(args.file), args.command)
    except ValueError as e:
        print(f"Cannot {args.command} {args.file}: {e}", file=sys.stderr)
        return 1
    if args.out:
        Path(args.out).write_text(result, encoding="utf-8", newline="")
    else:
        sys.stdout.buffer.write(result.encode("utf-8"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
