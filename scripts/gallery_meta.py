#!/usr/bin/env python3
"""gallery_meta.py — scaffold/refresh a gallery album's meta.yaml.

For each image in a page bundle (content/gallery/<album>/), ensures meta.yaml
has a top-level entry. New images get an entry with empty fields:

    "06.jpg":
      title: ""
      caption: ""
      tags: []

Empty fields fall back (the gallery partial reads EXIF ImageDescription /
filename for title, hides caption/tags when empty). Filled values win.

Idempotent and non-destructive: existing entries are NEVER touched — your
filled-in values are preserved byte-for-byte. Re-running only adds entries for
images that don't have one yet. Stale entries (image deleted) are warned
about, not auto-removed (so you never lose data on a rename).

Usage:
  python3 scripts/gallery_meta.py                         # all albums
  python3 scripts/gallery_meta.py content/gallery/demo-trip  # one album

Run from the repo root. No dependencies (stdlib only).
"""
import os
import re
import sys

IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

HEADER = """# Per-photo overrides (optional). Leave a field empty to fall back:
#   title   -> EXIF ImageDescription -> filename
#   caption -> hidden if empty
#   tags    -> excluded from the filter if empty
# Filled values win over EXIF. Auto-scaffolded by scripts/gallery_meta.py;
# re-running only appends entries for new images, never rewrites existing ones.
"""

# One image's empty entry. Keep the three fields so they're ready to fill.
ENTRY = '''"{name}":
  title: ""
  caption: ""
  tags: []
'''


def list_images(album_dir):
    """Sorted image filenames (jpg/jpeg/png/webp) in the bundle root."""
    out = []
    for f in sorted(os.listdir(album_dir)):
        if os.path.splitext(f)[1].lower() in IMG_EXTS:
            out.append(f)
    return out


def existing_top_keys(text):
    """Top-level mapping keys already present in meta.yaml text.

    Matches `key:` or `"key":` only at column 0 (no leading indent), so nested
    fields like `  title:` are not mistaken for image entries.
    """
    return {m.group(1) for m in re.finditer(r'^[\'"]?([^ \t\'":#]+)[\'"]?[ \t]*:', text, re.M)}


def process_album(album_dir):
    images = list_images(album_dir)
    if not images:
        return f"skip {album_dir}: no images"
    meta_path = os.path.join(album_dir, "meta.yaml")
    text = ""
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            text = f.read()

    have = existing_top_keys(text) if text.strip() else set()
    missing = [img for img in images if img not in have]
    stale = [k for k in have if k not in images]

    if not missing:
        msg = f"up to date: {album_dir}"
    else:
        chunk = (HEADER if not text.strip() else "")
        if text and not text.endswith("\n"):
            text += "\n"
        chunk += "".join(ENTRY.format(name=img) for img in missing)
        with open(meta_path, "w", encoding="utf-8") as f:
            f.write(text + chunk)
        msg = f"added {len(missing)} entr{'y' if len(missing) == 1 else 'ies'} -> {meta_path}"
    if stale:
        msg += f"  (stale, image gone: {', '.join(sorted(stale))})"
    return msg


def main(argv):
    if len(argv) > 1:
        paths = [argv[1]]
    else:
        base = "content/gallery"
        if not os.path.isdir(base):
            print("no content/gallery/ dir (run from repo root)")
            return 1
        paths = [os.path.join(base, d) for d in sorted(os.listdir(base))
                 if os.path.isdir(os.path.join(base, d))]
    for p in paths:
        if not os.path.isdir(p):
            print(f"not a dir: {p}")
            continue
        print(process_album(p))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
