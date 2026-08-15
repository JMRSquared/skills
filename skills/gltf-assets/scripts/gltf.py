#!/usr/bin/env python3
"""Search/download glTF from Poly Haven (CC0) and Sketchfab (CC, token for download). Stdlib only."""

from __future__ import annotations

import argparse
import json
import os
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

PH_API = "https://api.polyhaven.com"
PH_SITE = "https://polyhaven.com"
SF_API = "https://api.sketchfab.com/v3"
UA = "jmrsquared-skills/gltf-assets (https://github.com/jmrsquared/skills)"
CTX = ssl.create_default_context()
MAX_GLB = 40 * 1024 * 1024

SF_OK = (
    "CC0 Public Domain",
    "CC Attribution",
    "CC Attribution-ShareAlike",
)
SF_BLOCK_SUB = ("noncommercial", "noderivs", "no-deriv")
LOWPOLY_TAGS = ("lowpoly", "low-poly", "low poly", "voxel", "lego", "pixelart")


def die(msg: str) -> None:
    print(f"gltf: {msg}", file=sys.stderr)
    sys.exit(1)


def headers(auth: bool = False) -> dict[str, str]:
    out = {"User-Agent": UA, "Accept": "application/json,*/*"}
    if auth:
        token = os.environ.get("SKETCHFAB_TOKEN")
        if not token:
            die("SKETCHFAB_TOKEN is not set")
        out["Authorization"] = f"Token {token}"
    return out


def http_get(url: str, auth: bool = False, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers=headers(auth=auth))
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=CTX) as res:
            return res.read()
    except urllib.error.HTTPError as exc:
        die(f"HTTP {exc.code} for {url.split('?')[0]}")
    except urllib.error.URLError as exc:
        die(f"request failed: {exc.reason}")
    return b""


def http_json(url: str, auth: bool = False) -> Any:
    raw = http_get(url, auth=auth)
    try:
        return json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError:
        die(f"not JSON: {url.split('?')[0]}")


def download_url(url: str, dest: str, auth: bool = False) -> None:
    parent = os.path.dirname(dest)
    if parent:
        os.makedirs(parent, exist_ok=True)
    req = urllib.request.Request(url, headers=headers(auth=auth))
    try:
        with urllib.request.urlopen(req, timeout=180, context=CTX) as res, open(dest, "wb") as out:
            while True:
                chunk = res.read(1024 * 256)
                if not chunk:
                    break
                out.write(chunk)
    except (urllib.error.HTTPError, urllib.error.URLError) as exc:
        if os.path.exists(dest):
            os.remove(dest)
        die(f"download failed: {exc}")


def validate_gltf(path: str) -> None:
    with open(path, "rb") as handle:
        head = handle.read(64).lstrip()
    if not (head.startswith(b"{") or head.startswith(b"glTF")):
        os.remove(path)
        die(f"not a glTF: {path}")


def validate_hdr(path: str) -> None:
    with open(path, "rb") as handle:
        head = handle.read(32)
    if not (head.startswith(b"#?RADIANCE") or head.startswith(b"#?RGBE")):
        os.remove(path)
        die(f"not an HDR: {path}")


def slugify(text: str) -> str:
    out = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return (out or "model")[:60]


def word_match(hay: str, query: str) -> bool:
    for token in query.lower().split():
        if not re.search(r"(?<![a-z0-9])" + re.escape(token) + r"(?![a-z0-9])", hay):
            return False
    return True


def pick_resolution(bucket: dict[str, Any], wanted: str) -> str:
    if wanted in bucket:
        return wanted
    for res in ("1k", "2k", "4k", "8k"):
        if res in bucket:
            return res
    keys = list(bucket.keys())
    if not keys:
        die("no resolutions available")
    return keys[0]


# --- Poly Haven ---

def ph_hay(asset_id: str, meta: dict[str, Any]) -> str:
    return " ".join(
        [
            asset_id,
            str(meta.get("name") or ""),
            str(meta.get("category") or ""),
            str(meta.get("description") or ""),
            " ".join(meta.get("categories") or []),
            " ".join(meta.get("tags") or []),
            " ".join((meta.get("authors") or {}).keys()),
        ]
    ).lower()


def ph_fetch(kind: str) -> dict[str, Any]:
    data = http_json(f"{PH_API}/assets?type={kind}")
    if not isinstance(data, dict):
        die("unexpected Poly Haven payload")
    return data


def ph_search(query: str, kind: str, limit: int) -> list[dict[str, Any]]:
    hits: list[tuple[int, dict[str, Any]]] = []
    for aid, meta in ph_fetch(kind).items():
        if not isinstance(meta, dict) or not word_match(ph_hay(aid, meta), query):
            continue
        authors = ", ".join((meta.get("authors") or {}).keys()) or "unknown"
        faces = int(meta.get("polycount") or 0)
        hits.append(
            (
                -int(meta.get("download_count") or 0),
                {
                    "source": "polyhaven",
                    "id": aid,
                    "name": meta.get("name") or aid,
                    "license": "CC0",
                    "author": authors,
                    "url": f"{PH_SITE}/a/{urllib.parse.quote(aid)}",
                    "faces": faces,
                    "kind": kind,
                    "detail": " / ".join(meta.get("categories") or []) or "uncategorised",
                },
            )
        )
    hits.sort(key=lambda item: (item[0], item[1]["id"].lower()))
    return [row[1] for row in hits[:limit]]


def ph_download_model(asset_id: str, res: str, out_dir: str) -> None:
    files = http_json(f"{PH_API}/files/{urllib.parse.quote(asset_id)}")
    gltf = files.get("gltf")
    if not isinstance(gltf, dict):
        die(f"no glTF for {asset_id}")
    chosen = pick_resolution(gltf, res)
    entry = (gltf[chosen] or {}).get("gltf") or {}
    url = entry.get("url")
    if not url:
        die(f"no glTF url for {asset_id} @ {chosen}")
    dest_dir = os.path.join(out_dir, asset_id)
    os.makedirs(dest_dir, exist_ok=True)
    main_name = os.path.basename(urllib.parse.urlparse(url).path) or f"{asset_id}_{chosen}.gltf"
    main_path = os.path.join(dest_dir, main_name)
    download_url(url, main_path)
    validate_gltf(main_path)
    print(main_path)
    for rel, info in (entry.get("include") or {}).items():
        include_url = (info or {}).get("url")
        if not include_url:
            continue
        dest = os.path.join(dest_dir, rel)
        download_url(include_url, dest)
        print(dest)


def ph_download_hdri(asset_id: str, res: str, out_dir: str) -> None:
    files = http_json(f"{PH_API}/files/{urllib.parse.quote(asset_id)}")
    hdri = files.get("hdri")
    if not isinstance(hdri, dict):
        die(f"no HDRI for {asset_id}")
    chosen = pick_resolution(hdri, res)
    entry = (hdri[chosen] or {}).get("hdr") or {}
    url = entry.get("url")
    if not url:
        die(f"no .hdr url for {asset_id} @ {chosen}")
    os.makedirs(out_dir, exist_ok=True)
    name = os.path.basename(urllib.parse.urlparse(url).path) or f"{asset_id}_{chosen}.hdr"
    dest = os.path.join(out_dir, name)
    download_url(url, dest)
    validate_hdr(dest)
    print(dest)


# --- Sketchfab ---

def sf_license_ok(label: str, allow_nc: bool) -> bool:
    lower = label.lower()
    if any(part in lower for part in SF_BLOCK_SUB) and not allow_nc:
        return False
    if allow_nc:
        return "cc" in lower or label in SF_OK
    return label in SF_OK


def sf_is_lowpoly(model: dict[str, Any]) -> bool:
    tags = " ".join(t.get("name") or "" for t in (model.get("tags") or []) if isinstance(t, dict)).lower()
    name = (model.get("name") or "").lower()
    hay = f"{name} {tags}"
    return any(tag in hay for tag in LOWPOLY_TAGS)


def sf_search(query: str, limit: int, allow_nc: bool, skip_lowpoly: bool) -> list[dict[str, Any]]:
    q = urllib.parse.urlencode({"type": "models", "q": query, "downloadable": "true", "count": min(max(limit * 3, 24), 24)})
    data = http_json(f"{SF_API}/search?{q}")
    hits: list[dict[str, Any]] = []
    for model in data.get("results") or []:
        if not model.get("isDownloadable"):
            continue
        label = ((model.get("license") or {}).get("label") or "").strip()
        if not sf_license_ok(label, allow_nc):
            continue
        faces = int(model.get("faceCount") or 0)
        if skip_lowpoly and (sf_is_lowpoly(model) or faces < 1500):
            continue
        user = model.get("user") or {}
        author = user.get("displayName") or user.get("username") or "unknown"
        uid = model.get("uid") or ""
        hits.append(
            {
                "source": "sketchfab",
                "id": uid,
                "name": model.get("name") or uid,
                "license": label,
                "author": author,
                "url": model.get("viewerUrl") or f"https://sketchfab.com/3d-models/{uid}",
                "faces": faces,
                "kind": "models",
                "detail": " / ".join(c.get("name") or "" for c in (model.get("categories") or []) if isinstance(c, dict)),
            }
        )
        if len(hits) >= limit:
            break
    return hits


def sf_download(uid: str, name: str, out_dir: str, force: bool) -> None:
    payload = http_json(f"{SF_API}/models/{urllib.parse.quote(uid)}/download", auth=True)
    glb = payload.get("glb") or {}
    url = glb.get("url")
    size = int(glb.get("size") or 0)
    if not url:
        die(f"no GLB for Sketchfab {uid} (model may lack a glb archive)")
    if size > MAX_GLB and not force:
        die(f"GLB is {size} bytes (> {MAX_GLB}). Pass --force if you really want it")
    os.makedirs(out_dir, exist_ok=True)
    dest = os.path.join(out_dir, f"{slugify(name)}-{uid[:8]}.glb")
    download_url(url, dest)
    validate_gltf(dest)
    print(dest)


# --- CLI ---

def format_hit(index: int, hit: dict[str, Any]) -> str:
    faces = f"{hit['faces']:,} tris" if hit.get("faces") else ""
    bits = [hit["source"], hit.get("license") or "", faces, hit.get("author") or ""]
    meta = " · ".join(bit for bit in bits if bit)
    detail = hit.get("detail") or ""
    lines = [
        f"{index:2d}  {hit['name']}  [{hit['id']}]",
        f"    {meta}" + (f" · {detail}" if detail else ""),
        f"    {hit['url']}",
    ]
    return "\n".join(lines)


def collect(args: argparse.Namespace) -> list[dict[str, Any]]:
    source = args.source
    kind = args.type
    if kind == "hdris" and source == "sketchfab":
        die("HDRIs are Poly Haven only — use --source polyhaven --type hdris")
    if kind == "hdris":
        return ph_search(args.query, "hdris", args.limit)
    skip_lowpoly = not args.allow_lowpoly
    if source == "polyhaven":
        return ph_search(args.query, "models", args.limit)
    if source == "sketchfab":
        return sf_search(args.query, args.limit, args.allow_nc, skip_lowpoly)
    ph = ph_search(args.query, "models", args.limit)
    sf = sf_search(args.query, args.limit, args.allow_nc, skip_lowpoly)
    if not ph:
        return sf[: args.limit]
    if not sf:
        return ph[: args.limit]
    half = max(args.limit // 2, 1)
    picked = ph[:half] + sf[: args.limit - min(len(ph), half)]
    if len(picked) < args.limit:
        picked.extend(ph[half : half + (args.limit - len(picked))])
    return picked[: args.limit]


def cmd_search(args: argparse.Namespace) -> None:
    hits = collect(args)
    if not hits:
        die(f"no results for: {args.query} (try one noun, or --source sketchfab)")
    print("\n".join(format_hit(i, hit) for i, hit in enumerate(hits, 1)))


def selected_hits(args: argparse.Namespace) -> list[dict[str, Any]]:
    hits = collect(args)
    if not hits:
        die(f"no results for: {args.query}")
    if args.all:
        return hits
    if args.index is None:
        die(f'pass --index N (see: gltf.py search "{args.query}") or --all')
    if args.index < 1 or args.index > len(hits):
        die(f"no result at index {args.index}")
    return [hits[args.index - 1]]


def save_hit(hit: dict[str, Any], args: argparse.Namespace) -> None:
    if hit["source"] == "polyhaven" and hit.get("kind") == "hdris":
        ph_download_hdri(hit["id"], args.res, args.out)
        return
    if hit["source"] == "polyhaven":
        ph_download_model(hit["id"], args.res, args.out)
        return
    sf_download(hit["id"], hit["name"], args.out, args.force)


def cmd_download(args: argparse.Namespace) -> None:
    for hit in selected_hits(args):
        save_hit(hit, args)


def looks_like_uid(value: str) -> bool:
    return bool(re.fullmatch(r"[0-9a-fA-F]{32}", value))


def cmd_get(args: argparse.Namespace) -> None:
    source = args.source
    if source == "auto":
        source = "sketchfab" if looks_like_uid(args.slug) else "polyhaven"
    if args.type == "hdris":
        ph_download_hdri(args.slug, args.res, args.out)
        return
    if source == "sketchfab":
        info = http_json(f"{SF_API}/models/{urllib.parse.quote(args.slug)}")
        name = info.get("name") or args.slug
        sf_download(args.slug, name, args.out, args.force)
        return
    ph_download_model(args.slug, args.res, args.out)


def add_flags(parser: argparse.ArgumentParser, query: bool = True) -> None:
    if query:
        parser.add_argument("query")
    parser.add_argument("--source", choices=("auto", "polyhaven", "sketchfab"), default="auto")
    parser.add_argument("--type", choices=("models", "hdris"), default="models")
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--res", default="1k")
    parser.add_argument("--out", default=".")
    parser.add_argument("--allow-nc", action="store_true")
    parser.add_argument("--allow-lowpoly", action="store_true")
    parser.add_argument("--force", action="store_true")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="gltf.py")
    sub = parser.add_subparsers(dest="cmd", required=True)

    search = sub.add_parser("search")
    add_flags(search)
    search.set_defaults(func=cmd_search)

    download = sub.add_parser("download")
    add_flags(download)
    download.add_argument("--index", type=int)
    download.add_argument("--all", action="store_true")
    download.set_defaults(func=cmd_download)

    getp = sub.add_parser("get")
    getp.add_argument("slug")
    getp.add_argument("--source", choices=("auto", "polyhaven", "sketchfab"), default="auto")
    getp.add_argument("--type", choices=("models", "hdris"), default="models")
    getp.add_argument("--res", default="1k")
    getp.add_argument("--out", default=".")
    getp.add_argument("--force", action="store_true")
    getp.set_defaults(func=cmd_get)
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if getattr(args, "limit", 1) < 1:
        die("--limit must be >= 1")
    args.func(args)


if __name__ == "__main__":
    main()
