"""Assemble the static portfolio page from editable section files."""

from pathlib import Path
import hashlib
import re
import sys


ROOT = Path(__file__).resolve().parent.parent
PARTS = (
    "src/site/head.html",
    "src/sections/intro.html",
    "src/sections/about.html",
    "src/sections/work.html",
    "src/sections/archive.html",
    "src/sections/contact.html",
    "src/site/scripts.html",
)


def main() -> int:
    page = "".join((ROOT / part).read_text(encoding="utf-8") for part in PARTS)
    recent_work = (ROOT / "src/sections/andwise.html").read_text(encoding="utf-8")
    page = page.replace("<!-- ANDWISE_PROJECTS -->", recent_work)
    # A page must load one consistent set of styles/scripts after a local update.
    def version_asset(match: re.Match) -> str:
        asset = match.group("asset")
        version = hashlib.sha256((ROOT / asset).read_bytes()).hexdigest()[:12]
        return f'{match.group("attr")}{asset}?v={version}"'

    page = re.sub(
        r'(?P<attr>(?:href|src)=")(?P<asset>(?:css|js)/[^"?]+\.(?:css|js))"',
        version_asset,
        page,
    )
    output = ROOT / "index.html"
    if "--check" in sys.argv[1:]:
        if output.read_text(encoding="utf-8") != page:
            print("index.html is out of date. Run: python3 scripts/build.py")
            return 1
        print("index.html is up to date")
        return 0
    output.write_text(page, encoding="utf-8")
    print("Built index.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
