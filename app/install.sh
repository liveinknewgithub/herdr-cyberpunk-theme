#!/usr/bin/env bash
# app/install.sh — install the Night City layout, the cyberpunk-2077 theme,
# the nc-* mods and the nc-* sounds into the Herdr desktop app's home.
#
#   app/install.sh [--force] [--uninstall] [--home <dir>] [--no-app]
#
# Only files named night-city*, cyberpunk-2077*, nc-* (and sounds/nc-*) are
# ever copied or removed. In settings.json only three keys are written:
# theme, sounds.done and sounds.blocked. Everything else is the person's.
set -euo pipefail

SRC=$(cd "$(dirname "$0")" && pwd)
BACKUP_NAME=settings.json.bak-night-city
THEME=cyberpunk-2077
LAYOUT=night-city

FORCE=0
UNINSTALL=0
NO_APP=0
HOME_DIR=""
HERDR=""

die() { echo "install.sh: $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage: app/install.sh [--force] [--uninstall] [--home <dir>] [--no-app]

  --force       replace night-city*, cyberpunk-2077*, nc-* files already in the home
  --uninstall   remove them again and restore settings.json from the backup
  --home <dir>  the Herdr app home (default: $HERDR_APP_HOME or ~/.config/herdr-app)
  --no-app      don't look for, check with, or drive the herdr-app binary
EOF
}

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --force) FORCE=1 ;;
      --uninstall) UNINSTALL=1 ;;
      --no-app) NO_APP=1 ;;
      --home)
        [ $# -ge 2 ] && [ -n "$2" ] || die "--home needs a directory"
        HOME_DIR=$2; shift ;;
      --home=*) HOME_DIR=${1#--home=}; [ -n "$HOME_DIR" ] || die "--home needs a directory" ;;
      -h|--help) usage; exit 0 ;;
      *) usage >&2; die "unknown argument: $1" ;;
    esac
    shift
  done
  if [ -z "$HOME_DIR" ]; then
    HOME_DIR=${HERDR_APP_HOME:-$HOME/.config/herdr-app}
  fi
}

# Every path this script installs, relative to the home, one per line.
list_targets() {
  local f
  for f in "$SRC"/layouts/"$LAYOUT".*; do [ -f "$f" ] && echo "layouts/${f##*/}"; done
  [ -f "$SRC/themes/$THEME.json" ] && echo "themes/$THEME.json"
  for f in "$SRC"/mods/nc-*; do [ -d "$f" ] && echo "mods/${f##*/}"; done
  for f in "$SRC"/sounds/nc-*.mp3; do [ -f "$f" ] && echo "sounds/${f##*/}"; done
  return 0
}

load_targets() {
  TARGETS=()
  local t
  while IFS= read -r t; do TARGETS+=("$t"); done < <(list_targets)
  [ ${#TARGETS[@]} -gt 0 ] || die "nothing to install under $SRC"
  local need
  for need in "layouts/$LAYOUT.json" "themes/$THEME.json" mods/nc-chrome sounds/nc-done.mp3 sounds/nc-blocked.mp3; do
    case " ${TARGETS[*]} " in *" $need "*) ;; *) die "repo is missing app/$need" ;; esac
  done
}

find_app() {
  if command -v herdr-app >/dev/null 2>&1; then
    HERDR=$(command -v herdr-app)
  elif [ -x "$HOME/.local/bin/herdr-app" ]; then
    HERDR=$HOME/.local/bin/herdr-app
  else
    HERDR=""
  fi
}

app_running() {
  [ -n "$HERDR" ] && "$HERDR" status >/dev/null 2>&1
}

app_do() {
  "$HERDR" do "$@" >/dev/null || die "herdr-app do $* failed"
}

# Prints the layout the window shows (empty if unknown).
shown_layout() {
  { "$HERDR" status 2>/dev/null || true; } | python3 -I -c 'import json,sys
try: print(json.load(sys.stdin).get("layout") or "")
except Exception: print("")'
}

copy_files() {
  local t existing=()
  for t in "${TARGETS[@]}"; do
    if [ -e "$HOME_DIR/$t" ] || [ -L "$HOME_DIR/$t" ]; then existing+=("$t"); fi
  done
  if [ ${#existing[@]} -gt 0 ] && [ "$FORCE" -ne 1 ]; then
    die "already in $HOME_DIR: ${existing[*]} (re-run with --force to replace)"
  fi
  for t in "${TARGETS[@]}"; do
    mkdir -p "$(dirname "$HOME_DIR/$t")"
    rm -rf "${HOME_DIR:?}/$t"
    cp -R "$SRC/$t" "$HOME_DIR/$t"
    # Never ship Finder or app-generated files from a working copy.
    if [ -d "$HOME_DIR/$t" ]; then
      find "$HOME_DIR/$t" \( -name .DS_Store -o -name gpui-kit.d.ts -o -name jsconfig.json \) -delete
    fi
  done
  echo "copied ${#TARGETS[@]} items into $HOME_DIR"
}

# Validates settings.json (and a backup that would be kept) before anything
# is written. Sets SETTINGS_STATE to "managed" when settings.json already
# holds one of our values (a re-install over a live install), else "clean".
check_settings() {
  local settings="$HOME_DIR/settings.json" backup="$HOME_DIR/$BACKUP_NAME"
  SETTINGS_STATE=$(python3 -I - "$settings" "$backup" "$THEME" <<'PY'
import json, os, sys
path, backup_path, theme = sys.argv[1], sys.argv[2], sys.argv[3]

def load(p):
    name = os.path.basename(p)
    try:
        with open(p, encoding="utf-8") as f:
            d = json.load(f)
    except Exception as e:
        sys.exit("install.sh: %s is not valid JSON (%s); fix or move it, then re-run" % (name, e))
    if not isinstance(d, dict):
        sys.exit("install.sh: %s: top level is not an object" % name)
    if "sounds" in d and not isinstance(d["sounds"], dict):
        sys.exit('install.sh: %s: "sounds" is not an object' % name)
    return d

s = load(path) if os.path.exists(path) else {}
snd = s.get("sounds") or {}
managed = s.get("theme") == theme or any(
    isinstance(snd.get(k), str) and snd[k].startswith("sounds/nc-") for k in ("done", "blocked"))
if managed and os.path.exists(backup_path):
    load(backup_path)
print("managed" if managed else "clean")
PY
)
}

# Moves the active backup aside as <name>.<unix seconds> (kept, not used).
archive_backup() {
  local backup="$HOME_DIR/$BACKUP_NAME" ts dst n=1
  ts=$(date +%s)
  dst="$backup.$ts"
  while [ -e "$dst" ]; do dst="$backup.$ts-$n"; n=$((n + 1)); done
  mv "$backup" "$dst"
  echo "moved the previous backup aside to ${dst##*/}"
}

merge_settings() {
  local settings="$HOME_DIR/settings.json" backup="$HOME_DIR/$BACKUP_NAME"
  # The backup is single-use: one left from an earlier install/uninstall
  # cycle would restore a theme the person has since changed.
  if [ -e "$backup" ] && [ "$SETTINGS_STATE" = clean ]; then
    archive_backup
  fi
  if [ ! -e "$backup" ]; then
    if [ -e "$settings" ]; then
      cp "$settings" "$backup"
    else
      printf '{}\n' > "$backup"
    fi
    echo "backed up settings.json to $BACKUP_NAME"
  fi
  python3 -I - "$settings" "$THEME" <<'PY'
import json, os, sys
path, theme = sys.argv[1], sys.argv[2]
try:
    s = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            s = json.load(f)
    if not isinstance(s, dict):
        raise ValueError("top level is not an object")
    sounds = s.get("sounds")
    if sounds is None:
        sounds = {}
    if not isinstance(sounds, dict):
        raise ValueError('"sounds" is not an object')
    s["theme"] = theme
    sounds["done"] = "sounds/nc-done.mp3"
    sounds["blocked"] = "sounds/nc-blocked.mp3"
    s["sounds"] = sounds
    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps(s, indent=2, ensure_ascii=False) + "\n")
except Exception as e:
    sys.exit("install.sh: settings.json: %s" % e)
print("settings.json: theme=%s, sounds.done, sounds.blocked set" % theme)
PY
}

# Puts theme / sounds.done / sounds.blocked back the way the backup had them.
restore_settings() {
  local settings="$HOME_DIR/settings.json" backup="$HOME_DIR/$BACKUP_NAME"
  python3 -I - "$settings" "$backup" "$THEME" <<'PY'
import copy, json, os, shutil, sys
path, backup_path, theme = sys.argv[1], sys.argv[2], sys.argv[3]
OURS = {"done": "sounds/nc-done.mp3", "blocked": "sounds/nc-blocked.mp3"}

def load(p):
    name = os.path.basename(p)
    try:
        with open(p, encoding="utf-8") as f:
            d = json.load(f)
    except Exception as e:
        raise ValueError("%s is not valid JSON (%s)" % (name, e))
    if not isinstance(d, dict):
        raise ValueError("%s: top level is not an object" % name)
    return d

def strip(d):
    d = copy.deepcopy(d)
    d.pop("theme", None)
    if isinstance(d.get("sounds"), dict):
        for k in OURS:
            d["sounds"].pop(k, None)
        if not d["sounds"]:
            del d["sounds"]
    return d

def write(d):
    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")

try:
    have = os.path.exists(path)
    cur = load(path) if have else {}
    if not os.path.exists(backup_path):
        # Never installed by this script (or the backup was deleted): only
        # take out values that point at what we are about to remove.
        if not have:
            sys.exit(0)
        if cur.get("theme") == theme:
            del cur["theme"]
        snd = cur.get("sounds")
        if isinstance(snd, dict):
            for k, v in OURS.items():
                if snd.get(k) == v:
                    del snd[k]
            if not snd:
                del cur["sounds"]
        write(cur)
        print("settings.json: no backup; removed night-city values")
        sys.exit(0)
    bak = load(backup_path)
    if not bak:
        # {} marker: there was no settings.json before the install.
        if not have:
            sys.exit(0)
        rest = strip(cur)
        if not rest:
            os.remove(path)
            print("settings.json: removed (it did not exist before install)")
        else:
            write(rest)
            print("settings.json: removed theme, sounds.done, sounds.blocked")
        sys.exit(0)
    if strip(cur) == strip(bak):
        shutil.copyfile(backup_path, path)
        print("settings.json: restored from %s" % os.path.basename(backup_path))
        sys.exit(0)
    # Changed since install: keep the current file, put back only our keys.
    if "theme" in bak:
        cur["theme"] = bak["theme"]
    else:
        cur.pop("theme", None)
    bsnd = bak.get("sounds") if isinstance(bak.get("sounds"), dict) else {}
    if not isinstance(cur.get("sounds"), dict):
        cur.pop("sounds", None)
    for k in OURS:
        if k in bsnd:
            cur.setdefault("sounds", {})[k] = bsnd[k]
        elif "sounds" in cur:
            cur["sounds"].pop(k, None)
    if "sounds" in cur and not cur["sounds"] and "sounds" not in bak:
        del cur["sounds"]
    write(cur)
    print("settings.json: theme, sounds.done, sounds.blocked put back from backup")
except SystemExit:
    raise
except Exception as e:
    sys.exit("install.sh: uninstall stopped, nothing removed: %s" % e)
PY
}

check_mods() {
  local t out
  for t in "${TARGETS[@]}"; do
    case "$t" in mods/*) ;; *) continue ;; esac
    if ! out=$("$HERDR" check "$HOME_DIR/$t" 2>&1); then
      echo "$out" >&2
      die "herdr-app check failed for $t"
    fi
  done
  echo "herdr-app check passed for every nc-* mod"
}

print_status_errors() {
  sleep 1
  { "$HERDR" status 2>/dev/null || true; } | python3 -I -c 'import json,sys
try: errs = json.load(sys.stdin).get("errors") or []
except Exception: errs = ["could not read herdr-app status"]
for e in errs: print("herdr-app status error: %s" % (e if isinstance(e, str) else json.dumps(e)))
if not errs: print("herdr-app status: no errors")'
}

apply_app() {
  if ! app_running; then
    echo "Herdr isn't running: open it and press ⌘⇧L until night-city shows."
    echo "If main keeps its old colors, show main and run: herdr-app do app.theme --name $THEME"
    return 0
  fi
  app_do layout.switch --name main
  app_do app.theme --name "$THEME"
  app_do layout.switch --name "$LAYOUT"
  echo "Herdr now shows $LAYOUT; main uses $THEME"
  print_status_errors
}

# main's dark theme pick, from the app's click state (read only).
main_dark_pick() {
  local state="$HOME_DIR/layouts/.state/main.json"
  [ -f "$state" ] || return 0
  python3 -I - "$state" <<'PY'
import json, sys
try:
    t = json.load(open(sys.argv[1], encoding="utf-8")).get("theme") or {}
    print(t.get("dark", "") if isinstance(t, dict) else "")
except Exception:
    print("")
PY
}

backup_theme() {
  local backup="$HOME_DIR/$BACKUP_NAME"
  [ -f "$backup" ] || return 0
  python3 -I - "$backup" <<'PY'
import json, sys
try:
    t = json.load(open(sys.argv[1], encoding="utf-8")).get("theme")
    print(t if isinstance(t, str) else "")
except Exception:
    print("")
PY
}

uninstall() {
  if [ "$NO_APP" -ne 1 ]; then
    find_app
    if app_running; then
      local shown back
      shown=$(shown_layout)
      if [ "$shown" = "$LAYOUT" ]; then
        app_do layout.switch --name main
        shown=main
      fi
      if [ "$(main_dark_pick)" = "$THEME" ]; then
        back=$(backup_theme)
        if [ -z "$back" ] || [ "$back" = "$THEME" ]; then back=atom-one-dark; fi
        # app.theme sets the shown layout's pick, so it has to be main.
        [ "$shown" = main ] || app_do layout.switch --name main
        app_do app.theme --name "$back"
        if [ -n "$shown" ] && [ "$shown" != main ]; then app_do layout.switch --name "$shown"; fi
        echo "main's theme set back to $back"
      fi
    fi
  fi
  restore_settings
  local t removed=0
  for t in "${TARGETS[@]}"; do
    if [ -e "$HOME_DIR/$t" ] || [ -L "$HOME_DIR/$t" ]; then
      rm -rf "${HOME_DIR:?}/$t"
      removed=$((removed + 1))
    fi
  done
  echo "removed $removed items from $HOME_DIR (kept $BACKUP_NAME)"
}

install() {
  if [ "$NO_APP" -ne 1 ]; then
    find_app
    [ -n "$HERDR" ] || die "herdr-app not found on PATH or at ~/.local/bin/herdr-app (use --no-app to install files only)"
    echo "using $("$HERDR" --version 2>/dev/null || echo "herdr-app (version unknown)") at $HERDR"
  fi
  local home_flag=""
  [ "$HOME_DIR" = "$HOME/.config/herdr-app" ] || home_flag=" --home $HOME_DIR"
  check_settings
  copy_files
  merge_settings
  if [ "$NO_APP" -ne 1 ]; then
    check_mods
    apply_app
  fi
  cat <<EOF

Night City is installed in $HOME_DIR.
  Go back:   ⌘⇧L cycles layouts, or: herdr-app do layout.switch --name main
  Uninstall: $SRC/install.sh --uninstall$home_flag
EOF
}

main() {
  parse_args "$@"
  if [ "$UNINSTALL" -ne 1 ]; then mkdir -p "$HOME_DIR"; fi
  [ -d "$HOME_DIR" ] || die "no Herdr app home at $HOME_DIR"
  HOME_DIR=$(cd "$HOME_DIR" && pwd)
  export HERDR_APP_HOME="$HOME_DIR"
  load_targets
  if [ "$UNINSTALL" -eq 1 ]; then
    uninstall
  else
    install
  fi
}

main "$@"
