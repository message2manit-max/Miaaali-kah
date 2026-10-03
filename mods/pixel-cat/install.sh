#!/usr/bin/env bash
# Installs pixel-cat for every session (macOS / Linux):
#   1. copies this folder to ~/.claude/mods/pixel-cat
#   2. adds to the env block of ~/.claude/settings.json, touching nothing else:
#        CLAUDE_CODE_PLUGIN_DIRS            (appended with ":" when it already exists)
#        CLAUDE_CODE_ENABLE_FUNCTION_HOOKS  "1"
#      (the old file is kept as settings.json.bak-pixel-cat)
#   3. checks it in a new headless session: claude -p "/meow"
#
# Usage: bash install.sh [--no-check]
set -euo pipefail

src="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dest="$HOME/.claude/mods/pixel-cat"
settings="$HOME/.claude/settings.json"

# 1. Copy the mod.
mkdir -p "$dest"
if [ "$src" != "$dest" ]; then
  rm -rf "$dest"
  mkdir -p "$dest"
  cp -R "$src/." "$dest/"
fi
echo "copied the mod to $dest"

# 2. Edit only the env block of settings.json.
mkdir -p "$(dirname "$settings")"
[ -f "$settings" ] || echo '{}' > "$settings"
cp "$settings" "$settings.bak-pixel-cat"

edit_with_node() {
  SETTINGS="$settings" DEST="$dest" node -e '
    const fs = require("fs"), f = process.env.SETTINGS, dir = process.env.DEST
    const s = JSON.parse(fs.readFileSync(f, "utf8") || "{}")
    s.env = s.env || {}
    const dirs = (s.env.CLAUDE_CODE_PLUGIN_DIRS || "").split(":").filter(Boolean)
    if (!dirs.includes(dir)) dirs.push(dir)
    s.env.CLAUDE_CODE_PLUGIN_DIRS = dirs.join(":")
    s.env.CLAUDE_CODE_ENABLE_FUNCTION_HOOKS = "1"
    fs.writeFileSync(f, JSON.stringify(s, null, 2) + "\n")'
}

edit_with_python() {
  SETTINGS="$settings" DEST="$dest" python3 -c '
import json, os
f, d = os.environ["SETTINGS"], os.environ["DEST"]
with open(f) as fh:
    text = fh.read().strip()
s = json.loads(text or "{}")
env = s.setdefault("env", {})
dirs = [p for p in env.get("CLAUDE_CODE_PLUGIN_DIRS", "").split(":") if p]
if d not in dirs:
    dirs.append(d)
env["CLAUDE_CODE_PLUGIN_DIRS"] = ":".join(dirs)
env["CLAUDE_CODE_ENABLE_FUNCTION_HOOKS"] = "1"
with open(f, "w") as fh:
    fh.write(json.dumps(s, indent=2) + "\n")'
}

edit_with_jxa() {
  SETTINGS="$settings" DEST="$dest" osascript -l JavaScript -e '
    ObjC.import("Foundation")
    const env = $.NSProcessInfo.processInfo.environment
    const f = ObjC.unwrap(env.objectForKey("SETTINGS")), dir = ObjC.unwrap(env.objectForKey("DEST"))
    const text = ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(f, $.NSUTF8StringEncoding, null)) || "{}"
    const s = JSON.parse(text.trim() || "{}")
    s.env = s.env || {}
    const dirs = (s.env.CLAUDE_CODE_PLUGIN_DIRS || "").split(":").filter(Boolean)
    if (!dirs.includes(dir)) dirs.push(dir)
    s.env.CLAUDE_CODE_PLUGIN_DIRS = dirs.join(":")
    s.env.CLAUDE_CODE_ENABLE_FUNCTION_HOOKS = "1"
    $(JSON.stringify(s, null, 2) + "\n").writeToFileAtomicallyEncodingError(f, true, $.NSUTF8StringEncoding, null)'
}

if command -v node >/dev/null 2>&1; then
  edit_with_node
elif command -v python3 >/dev/null 2>&1; then
  edit_with_python
elif command -v osascript >/dev/null 2>&1; then
  edit_with_jxa
else
  echo "No node, python3 or osascript to edit $settings. Add these to its \"env\" block by hand:" >&2
  echo "  \"CLAUDE_CODE_PLUGIN_DIRS\": \"$dest\"   (append with \":\" if the key exists)" >&2
  echo "  \"CLAUDE_CODE_ENABLE_FUNCTION_HOOKS\": \"1\"" >&2
  exit 1
fi
echo "updated the env block of $settings (backup: $settings.bak-pixel-cat)"

# 3. Check it loads from settings in a new headless session.
if [ "${1:-}" != "--no-check" ]; then
  if command -v claude >/dev/null 2>&1; then
    echo 'claude -p "/meow":'
    # Not from $HOME: there ~/.claude/settings.json also reads as project
    # settings, which cannot set CLAUDE_CODE_PLUGIN_DIRS (a warning, no harm).
    (cd "${TMPDIR:-/tmp}" && claude -p "/meow")
  else
    echo 'claude is not on PATH: run  claude -p "/meow"  to check.'
  fi
fi
