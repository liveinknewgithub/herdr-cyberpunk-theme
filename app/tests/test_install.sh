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
# 3. malformed settings.json: refuse before copying anything or writing a backup
for bad in '{not json' '{"sounds": 3}' '[1, 2]'; do
  rm -rf "$tmp/c"; mkdir -p "$tmp/c"; printf '%s\n' "$bad" > "$tmp/c/settings.json"
  "$here/install.sh" --home "$tmp/c" --no-app >/dev/null 2>&1 && fail "install over malformed settings ($bad) should refuse"
  [ "$(ls -A "$tmp/c")" = "settings.json" ] || fail "malformed settings ($bad) left files: $(ls -A "$tmp/c")"
  [ "$(cat "$tmp/c/settings.json")" = "$bad" ] || fail "malformed settings ($bad) was rewritten"
done
# a broken backup stops uninstall before anything is removed, naming the backup
mkdir -p "$tmp/d"; "$here/install.sh" --home "$tmp/d" --no-app >/dev/null || fail "install d"
printf '{oops\n' > "$tmp/d/settings.json.bak-night-city"
err=$("$here/install.sh" --home "$tmp/d" --no-app --uninstall 2>&1) && fail "uninstall with broken backup should fail"
case "$err" in *settings.json.bak-night-city*) ;; *) fail "error does not name the backup: $err" ;; esac
[ -d "$tmp/d/mods/nc-chrome" ] || fail "uninstall removed files despite failing"
# 4. the backup is single-use: a second install/uninstall cycle restores the newer theme
mkdir -p "$tmp/e"; printf '{\n  "zoom": 1,\n  "theme": "old"\n}\n' > "$tmp/e/settings.json"
"$here/install.sh" --home "$tmp/e" --no-app >/dev/null || fail "install e1"
"$here/install.sh" --home "$tmp/e" --no-app --uninstall >/dev/null || fail "uninstall e1"
printf '{"zoom":1,"theme":"paper"}\n' > "$tmp/e/settings.json"
"$here/install.sh" --home "$tmp/e" --no-app >/dev/null || fail "install e2"
"$here/install.sh" --home "$tmp/e" --no-app --uninstall >/dev/null || fail "uninstall e2"
python3 -I -c 'import json,sys; s=json.load(open(sys.argv[1])); assert s["theme"]=="paper" and "sounds" not in s, s' "$tmp/e/settings.json" || fail "second cycle did not restore theme paper"
n=$(find "$tmp/e" -maxdepth 1 -name 'settings.json.bak-night-city.*' | wc -l | tr -d ' ')
[ "$n" = 1 ] || fail "expected 1 archived backup after 2 cycles, found $n"
grep -q '"old"' "$tmp/e"/settings.json.bak-night-city.* || fail "archived backup is not the first cycle's"
cmp -s "$tmp/e/settings.json" "$tmp/e/settings.json.bak-night-city" || fail "active backup is not the second cycle's"
# a re-install over a live install keeps the original backup
"$here/install.sh" --home "$tmp/e" --no-app >/dev/null || fail "install e3"
"$here/install.sh" --home "$tmp/e" --no-app --force >/dev/null || fail "reinstall e3"
python3 -I -c 'import json,sys; assert json.load(open(sys.argv[1]))["theme"]=="paper"' "$tmp/e/settings.json.bak-night-city" || fail "re-install replaced the live backup"
# 5. Finder / app-generated files in a working copy are never shipped
cp -R "$here" "$tmp/src"
touch "$tmp/src/mods/nc-chrome/.DS_Store" "$tmp/src/mods/nc-chrome/gpui-kit.d.ts" "$tmp/src/mods/nc-chrome/jsconfig.json" "$tmp/src/mods/nc-chrome/fonts/.DS_Store"
mkdir -p "$tmp/f"; "$tmp/src/install.sh" --home "$tmp/f" --no-app >/dev/null || fail "install f"
[ -z "$(find "$tmp/f/mods" -name .DS_Store -o -name gpui-kit.d.ts -o -name jsconfig.json)" ] || fail "excluded files were copied"
[ -e "$tmp/f/mods/nc-chrome/main.js" ] || fail "excludes removed real files"
# 6. app path with a stub herdr-app: a failing `herdr-app status` after the switch is not fatal
mkdir -p "$tmp/bin" "$tmp/g"; export STUB_LOG="$tmp/stub.log"; : > "$STUB_LOG"
cat > "$tmp/bin/herdr-app" <<'EOF'
#!/bin/sh
echo "$*" >> "$STUB_LOG"
case "$1" in
  --version) echo "herdr-app stub" ;;
  status) [ "$(grep -c '^status' "$STUB_LOG")" -le 1 ] && { echo '{"layout":"main","errors":[]}'; exit 0; }; echo boom >&2; exit 3 ;;
  check) echo "check passed: $2" ;;
  do) echo '{"ok": true}' ;;
esac
EOF
chmod +x "$tmp/bin/herdr-app"
out=$(PATH="$tmp/bin:$PATH" "$here/install.sh" --home "$tmp/g" 2>&1) || fail "install with failing status exited non-zero: $out"
case "$out" in *"Uninstall:"*) ;; *) fail "hints not printed after failing status" ;; esac
[ "$(grep '^do ' "$STUB_LOG" | tr '\n' '|')" = "do layout.switch --name main|do app.theme --name cyberpunk-2077|do layout.switch --name night-city|" ] || fail "unexpected app calls: $(cat "$STUB_LOG")"
# 7. a running stub app that always answers status (it shows night-city)
mkdir -p "$tmp/bin2"; export STUB2_LOG="$tmp/stub2.log"
cat > "$tmp/bin2/herdr-app" <<'EOF'
#!/bin/sh
echo "$*" >> "$STUB2_LOG"
case "$1" in
  --version) echo "herdr-app stub" ;;
  status) echo '{"layout":"night-city","errors":[]}' ;;
  check) echo "check passed: $2" ;;
  do) echo '{"ok": true}' ;;
esac
EOF
chmod +x "$tmp/bin2/herdr-app"
# what the app writes when app.theme runs on main
set_pick() { mkdir -p "$1/layouts/.state"; printf '{"theme":{"light":"paper","dark":"%s"}}\n' "$2" > "$1/layouts/.state/main.json"; }
# 7a. uninstall replays the recorded pick (graphite), not the backup's theme (paper)
mkdir -p "$tmp/h"; printf '{"theme":"paper"}\n' > "$tmp/h/settings.json"
"$here/install.sh" --home "$tmp/h" --no-app >/dev/null || fail "install h"
printf '{"main_dark_pick": "graphite"}\n' > "$tmp/h/night-city.uninstall.json"; set_pick "$tmp/h" cyberpunk-2077
: > "$STUB2_LOG"; PATH="$tmp/bin2:$PATH" "$here/install.sh" --home "$tmp/h" --uninstall >/dev/null || fail "uninstall h"
grep -qx 'do app.theme --name graphite' "$STUB2_LOG" || fail "uninstall did not replay graphite: $(cat "$STUB2_LOG")"
grep -q 'app.theme --name paper' "$STUB2_LOG" && fail "uninstall used the backup theme over the recorded pick"
[ ! -e "$tmp/h/night-city.uninstall.json" ] || fail "sidecar left behind"
cmp -s "$tmp/h/settings.json" "$tmp/h/settings.json.bak-night-city" || fail "h settings not restored"
# 7b. install records main's pick (atom-one-dark); uninstall replays it
mkdir -p "$tmp/i"; set_pick "$tmp/i" atom-one-dark
: > "$STUB2_LOG"; PATH="$tmp/bin2:$PATH" "$here/install.sh" --home "$tmp/i" >/dev/null || fail "install i"
python3 -I -c 'import json,sys; assert json.load(open(sys.argv[1])) == {"main_dark_pick": "atom-one-dark"}' "$tmp/i/night-city.uninstall.json" || fail "sidecar did not record atom-one-dark"
grep -qx 'do app.theme --name cyberpunk-2077' "$STUB2_LOG" || fail "install did not set the theme"
set_pick "$tmp/i" cyberpunk-2077
# a --force re-install over the live install keeps the recorded pick
PATH="$tmp/bin2:$PATH" "$here/install.sh" --home "$tmp/i" --force >/dev/null || fail "reinstall i"
grep -q '"atom-one-dark"' "$tmp/i/night-city.uninstall.json" || fail "re-install lost the recorded pick"
: > "$STUB2_LOG"; PATH="$tmp/bin2:$PATH" "$here/install.sh" --home "$tmp/i" --uninstall >/dev/null || fail "uninstall i"
[ "$(grep '^do ' "$STUB2_LOG" | tr '\n' '|')" = "do layout.switch --name main|do app.theme --name atom-one-dark|" ] || fail "unexpected uninstall calls: $(cat "$STUB2_LOG")"
[ ! -e "$tmp/i/night-city.uninstall.json" ] || fail "sidecar left behind (i)"
# no pick recorded and a plain theme name: graphite, never atom-one-dark
mkdir -p "$tmp/j"; printf '{"theme":"paper"}\n' > "$tmp/j/settings.json"
PATH="$tmp/bin2:$PATH" "$here/install.sh" --home "$tmp/j" >/dev/null || fail "install j"
python3 -I -c 'import json,sys; assert json.load(open(sys.argv[1])) == {"main_dark_pick": None}' "$tmp/j/night-city.uninstall.json" || fail "sidecar should record null"
: > "$STUB2_LOG"; PATH="$tmp/bin2:$PATH" "$here/install.sh" --home "$tmp/j" --uninstall >/dev/null || fail "uninstall j"
grep -qx 'do app.theme --name graphite' "$STUB2_LOG" || fail "null pick did not fall back to graphite: $(cat "$STUB2_LOG")"
# 7c. an object theme keeps its light half; uninstall restores byte-identically,
# and with the app closed prints the hint with the object's dark half
mkdir -p "$tmp/k"; printf '{\n  "theme": {"light": "paper", "dark": "graphite"},\n  "zoom": 1\n}\n' > "$tmp/k/settings.json"; cp "$tmp/k/settings.json" "$tmp/k.orig"
"$here/install.sh" --home "$tmp/k" --no-app >/dev/null || fail "install k"
python3 -I -c 'import json,sys; t=json.load(open(sys.argv[1]))["theme"]; assert t=={"light":"paper","dark":"cyberpunk-2077"}, t' "$tmp/k/settings.json" || fail "object theme not merged"
out=$("$here/install.sh" --home "$tmp/k" --no-app --uninstall 2>&1) || fail "uninstall k"
cmp -s "$tmp/k/settings.json" "$tmp/k.orig" || fail "object theme not restored byte-identical"
case "$out" in *"open Herdr, show the main layout, then run: herdr-app do app.theme --name graphite"*) ;; *) fail "closed-app hint missing: $out" ;; esac
# 7d. no backup but settings already hold our values: the fresh backup leaves them out
mkdir -p "$tmp/l"; printf '{"zoom":2,"theme":"cyberpunk-2077","sounds":{"done":"sounds/nc-done.mp3","blocked":"sounds/nc-blocked.mp3","bell":"x.mp3"}}\n' > "$tmp/l/settings.json"
"$here/install.sh" --home "$tmp/l" --no-app >/dev/null || fail "install l"
python3 -I -c 'import json,sys; b=json.load(open(sys.argv[1])); assert b=={"zoom":2,"sounds":{"bell":"x.mp3"}}, b' "$tmp/l/settings.json.bak-night-city" || fail "managed-state backup kept managed keys"
"$here/install.sh" --home "$tmp/l" --no-app --uninstall >/dev/null || fail "uninstall l"
python3 -I -c 'import json,sys; s=json.load(open(sys.argv[1])); assert "theme" not in s and s["sounds"]=={"bell":"x.mp3"}, s' "$tmp/l/settings.json" || fail "l restored our values"
# 7e. a home path with spaces: the printed uninstall hint pastes as one argument
mkdir -p "$tmp/m n"; out=$("$here/install.sh" --home "$tmp/m n" --no-app 2>&1) || fail "install m n"
case "$out" in *"--home $(printf %q "$tmp/m n")"*) ;; *) fail "home path not quoted in hint: $out" ;; esac
echo "install tests passed"
