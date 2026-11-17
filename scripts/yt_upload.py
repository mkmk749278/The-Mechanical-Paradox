"""Upload a finished film to this channel through the YouTube Data API (owner, 2026-11-17: "upload to YouTube").
Resumable upload of the master, then the thumbnail and our English SRT. Uses scripts/yt_api.py's token (this
channel's refresh token only, never the sister channels').

Usage: python3 scripts/yt_upload.py --video FILE --meta films/<slug>/youtube/upload.json [--thumb JPG] [--srt SRT]
       python3 scripts/yt_upload.py --id VIDEO_ID --thumb JPG          (thumbnail only)
       python3 scripts/yt_upload.py --id VIDEO_ID --srt SRT            (captions only)
       python3 scripts/yt_upload.py --id VIDEO_ID --privacy public     (change visibility)
upload.json: {"title", "description", "tags": [...], "categoryId": "28", "defaultLanguage": "en",
              "defaultAudioLanguage": "en", "privacyStatus", "containsSyntheticMedia": bool}
Prints the video id. Resumes from the server's offset after a dropped connection (up to 8 retries per chunk).
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yt_api import api, token  # noqa: E402

CHUNK = 32 * 1024 * 1024


def start_session(tok: str, meta: dict, size: int) -> str:
    body = {
        "snippet": {k: meta[k] for k in ("title", "description", "tags", "categoryId", "defaultLanguage",
                                          "defaultAudioLanguage") if k in meta},
        "status": {"privacyStatus": meta.get("privacyStatus", "private"), "selfDeclaredMadeForKids": False,
                   "embeddable": True, "license": "youtube",
                   "containsSyntheticMedia": bool(meta.get("containsSyntheticMedia", False))},
    }
    req = urllib.request.Request(
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status"
        "&notifySubscribers=true", data=json.dumps(body).encode(), method="POST",
        headers={"Authorization": "Bearer " + tok, "Content-Type": "application/json; charset=UTF-8",
                 "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(size)})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.headers["Location"]


def offset(url: str, tok: str, size: int) -> int:
    req = urllib.request.Request(url, data=b"", method="PUT",
                                 headers={"Authorization": "Bearer " + tok, "Content-Range": f"bytes */{size}"})
    try:
        urllib.request.urlopen(req, timeout=60)
        return size
    except urllib.error.HTTPError as e:
        if e.code == 308:
            rng = e.headers.get("Range")
            return int(rng.split("-")[1]) + 1 if rng else 0
        raise


def upload(path: str, meta: dict) -> str:
    size = os.path.getsize(path)
    tok, _ = token()
    url = start_session(tok, meta, size)
    pos, tries = 0, 0
    with open(path, "rb") as f:
        while pos < size:
            f.seek(pos)
            data = f.read(CHUNK)
            end = pos + len(data) - 1
            req = urllib.request.Request(url, data=data, method="PUT", headers={
                "Authorization": "Bearer " + tok, "Content-Length": str(len(data)),
                "Content-Range": f"bytes {pos}-{end}/{size}"})
            try:
                with urllib.request.urlopen(req, timeout=600) as r:
                    res = json.load(r)
                    print(f"UPLOAD done {size} bytes", flush=True)
                    return res["id"]
            except urllib.error.HTTPError as e:
                if e.code == 308:
                    rng = e.headers.get("Range")
                    pos = int(rng.split("-")[1]) + 1 if rng else 0
                    tries = 0
                    print(f"UPLOAD {pos / size:6.1%}", flush=True)
                    continue
                if e.code == 401:
                    tok, _ = token()
                elif e.code < 500:
                    print("HTTP", e.code, e.read().decode()[:600]); sys.exit(1)
            except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
                print("retry:", e, flush=True)
            tries += 1
            if tries > 8:
                sys.exit("upload failed after 8 retries")
            time.sleep(min(60, 2 ** tries))
            tok, _ = token()
            pos = offset(url, tok, size)
    sys.exit("upload ended without a video id")


def set_thumb(vid: str, jpg: str) -> None:
    tok, _ = token()
    r = api("POST", f"/upload/youtube/v3/thumbnails/set?videoId={vid}&uploadType=media", tok,
            raw=open(jpg, "rb").read(), ctype="image/jpeg")
    print("THUMB", r["items"][0]["default"]["url"])


def set_srt(vid: str, srt: str) -> None:
    tok, _ = token()
    meta = json.dumps({"snippet": {"videoId": vid, "language": "en", "name": "English", "isDraft": False}})
    b = "srtboundary7f3a"
    body = (f"--{b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{meta}\r\n"
            f"--{b}\r\nContent-Type: application/octet-stream\r\n\r\n").encode() + open(srt, "rb").read() + \
        f"\r\n--{b}--\r\n".encode()
    r = api("POST", "/upload/youtube/v3/captions?uploadType=multipart&part=snippet", tok, raw=body,
            ctype=f"multipart/related; boundary={b}")
    print("CAPTIONS", r["id"])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--video"); ap.add_argument("--meta"); ap.add_argument("--id")
    ap.add_argument("--thumb"); ap.add_argument("--srt"); ap.add_argument("--privacy")
    a = ap.parse_args()
    vid = a.id
    if a.video:
        vid = upload(a.video, json.load(open(a.meta)))
        print("VIDEO_ID", vid, flush=True)
    if not vid:
        sys.exit("need --video or --id")
    if a.thumb:
        set_thumb(vid, a.thumb)
    if a.srt:
        set_srt(vid, a.srt)
    if a.privacy:
        tok, _ = token()
        cur = api("GET", f"/youtube/v3/videos?part=status&id={vid}", tok)["items"][0]["status"]
        st = {"privacyStatus": a.privacy, "selfDeclaredMadeForKids": False,
              "embeddable": cur.get("embeddable", True), "license": cur.get("license", "youtube"),
              "containsSyntheticMedia": cur.get("containsSyntheticMedia", False)}
        r = api("PUT", "/youtube/v3/videos?part=status", tok, body={"id": vid, "status": st})
        print("PRIVACY", r["status"]["privacyStatus"])


if __name__ == "__main__":
    main()
