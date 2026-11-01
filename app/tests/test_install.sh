#!/usr/bin/env bash
# app/tests/test_install.sh — runs install/uninstall against a temp home with --no-app
set -euo pipefail
here=$(cd "$(dirname "$0")/.." && pwd); tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
fail() { echo "FAIL: $1"; exit 1; }
# 1. settings without a sounds key (Review Focus 2)
mkdir -p "$tmp/a"; printf '{\n  "zoom": 1,\n  "theme": "cyberpunk"\n}\n' > "$tmp/a/settings.json"
"$here/install.sh" --home "$tmp/a" --no-app >/dev/null || fail "install a"
python3 -I - "$tmp/a/settings.json" <<'EOF'
import json,sys; s=json.load(open(sys.argv[1]))
assert s["theme"]=="cyberpunk-2077" and s["zoom"]==1, s
assert s["sounds"]=={"done":"sounds/nc-done.mp3","blocked":"sounds/nc-blocked.mp3"}, s
EOF
for p in layouts/night-city.json layouts/night-city.svg themes/cyberpunk-2077.json mods/nc-chrome/main.js mods/nc-chrome/fonts/Rajdhani-Bold.ttf mods/nc-status/main.js sounds/nc-done.mp3 settings.json.bak-night-city; do [ -e "$tmp/a/$p" ] || fail "missing $p"; done
"$here/install.sh" --home "$tmp/a" --no-app >/dev/null 2>&1 && fail "second install without --force should refuse"
"$here/install.sh" --home "$tmp/a" --no-app --force >/dev/null || fail "force reinstall"
"$here/install.sh" --home "$tmp/a" --no-app --uninstall >/dev/null || fail "uninstall a"
cmp -s "$tmp/a/settings.json" "$tmp/a/settings.json.bak-night-city" || fail "settings not restored byte-identical"
[ -z "$(find "$tmp/a" -name 'nc-*' -o -name 'night-city*' -o -name 'cyberpunk-2077*' | grep -v bak)" ] || fail "files left behind"
# 2. no settings.json at all (Review Focus 2)
mkdir -p "$tmp/b"; "$here/install.sh" --home "$tmp/b" --no-app >/dev/null || fail "install b"
python3 -I -c 'import json,sys; s=json.load(open(sys.argv[1])); assert s["theme"]=="cyberpunk-2077" and "done" in s["sounds"]' "$tmp/b/settings.json"
"$here/install.sh" --home "$tmp/b" --no-app --uninstall >/dev/null || fail "uninstall b"
[ ! -e "$tmp/b/settings.json" ] || python3 -I -c 'import json,sys; s=json.load(open(sys.argv[1])); assert "theme" not in s and "sounds" not in s' "$tmp/b/settings.json" || fail "b not restored"
echo "install tests passed"
