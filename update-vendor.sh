#!/usr/bin/env bash
# Re-pull vendor/ skills from upstream (only permissively licensed ones)
set -euo pipefail
repo="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

clone() { git clone -q --depth 1 "https://github.com/$1.git" "$tmp/$2"; }
clone obra/superpowers sp
clone anthropics/skills an
clone forrestchang/andrej-karpathy-skills kp
clone ComposioHQ/awesome-claude-skills cp

rm -rf "$repo/vendor" && mkdir -p "$repo/vendor"/{superpowers,anthropic,karpathy,composio}
cp -R "$tmp/sp/skills/." "$repo/vendor/superpowers/" && cp "$tmp/sp/LICENSE" "$repo/vendor/superpowers/LICENSE"
# docx/pdf/pptx/xlsx are "All rights reserved" - not redistributable, skipped
for s in "$tmp"/an/skills/*/; do
  grep -qi apache "$s/LICENSE.txt" 2>/dev/null && cp -R "$s" "$repo/vendor/anthropic/$(basename "$s")"
done
cp -R "$tmp/kp/skills/karpathy-guidelines" "$repo/vendor/karpathy/"
cp -R "$tmp/cp/changelog-generator" "$repo/vendor/composio/"
find "$repo/vendor" \( -name node_modules -o -name __pycache__ \) -prune -exec rm -rf {} +
echo "vendor updated - review with: git status vendor/"
