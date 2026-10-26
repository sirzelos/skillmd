#!/usr/bin/env bash
# Install skills + vendor skills + global CLAUDE.md into ~/.claude (macOS / Linux / WSL / Git Bash)
set -euo pipefail
repo="$(cd "$(dirname "$0")" && pwd)"
dest="$HOME/.claude"
ts="$(date +%Y%m%d%H%M%S)"
mkdir -p "$dest/skills"

for dir in "$repo"/skills/*/ "$repo"/vendor/*/*/; do
  name="$(basename "$dir")"
  target="$dest/skills/$name"
  if [ -e "$target" ]; then mv "$target" "$target.bak-$ts"; echo "backup: $target.bak-$ts"; fi
  cp -R "$dir" "$target"
  echo "installed skill: $name"
done

if [ -f "$dest/CLAUDE.md" ]; then cp "$dest/CLAUDE.md" "$dest/CLAUDE.md.bak-$ts"; echo "backup: existing CLAUDE.md"; fi
cp "$repo/global/CLAUDE.md" "$dest/CLAUDE.md"
echo "installed: $dest/CLAUDE.md"

# thai-lease-contract needs the docx npm package
if command -v npm >/dev/null 2>&1; then
  (cd "$dest/skills/thai-lease-contract/scripts" && npm install --silent)
else
  echo "skip npm install (npm not found) - run 'npm install' in $dest/skills/thai-lease-contract/scripts later"
fi
echo "done. restart Claude Code to load the skills."
