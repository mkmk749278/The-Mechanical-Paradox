"""YouTube Data API v3 for this channel (owner, 2026-11-13: "YouTube Studio API connected, why can't you change").
Uses YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN_THEMECHANICALPARADOX (scope youtube.force-ssl): titles,
descriptions and thumbnails of our own uploads. Never the sister channels' tokens (also in the environment).
Usage from Python: sys.path.insert(0, 'scripts'); from yt_api import token, api
"""
import json, os, sys, urllib.request, urllib.parse
def token():
    d = urllib.parse.urlencode({"client_id": os.environ["YT_CLIENT_ID"], "client_secret": os.environ["YT_CLIENT_SECRET"],
        "refresh_token": os.environ["YT_REFRESH_TOKEN_THEMECHANICALPARADOX"], "grant_type": "refresh_token"}).encode()
    r = json.load(urllib.request.urlopen("https://oauth2.googleapis.com/token", d, timeout=30))
    return r["access_token"], r.get("scope", "")
def api(method, path, tok, body=None, ctype="application/json", raw=None):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request("https://www.googleapis.com" + path, data=data, method=method,
        headers={"Authorization": "Bearer " + tok, "Content-Type": ctype})
    try:
        return json.load(urllib.request.urlopen(req, timeout=60))
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:600]); sys.exit(1)
