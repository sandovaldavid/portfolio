#!/usr/bin/env bash

set -euo pipefail

source_dir="${1:-.resume-assets/public/resume}"
target_dir="${2:-public/resume}"

if [ ! -d "$source_dir" ] && [ -d "$target_dir" ]; then
	if node scripts/validate-resume-assets.mjs "$target_dir" >/dev/null 2>&1; then
		echo "Resume assets in ${target_dir} already present and valid."
		exit 0
	fi
fi

if [ ! -d "$source_dir" ] && command -v git >/dev/null 2>&1; then
	mkdir -p .resume-assets
	if git fetch --depth=1 origin resume-assets >/dev/null 2>&1; then
		git --work-tree=.resume-assets checkout FETCH_HEAD -- public/resume >/dev/null 2>&1 || true
	elif git rev-parse --verify origin/resume-assets >/dev/null 2>&1; then
		git --work-tree=.resume-assets checkout origin/resume-assets -- public/resume >/dev/null 2>&1 || true
	fi
fi

node scripts/validate-resume-assets.mjs "$source_dir"

rm -rf "$target_dir"
mkdir -p "$target_dir"

install -m 0644 \
  "$source_dir/david-sandoval-resume.pdf" \
  "$target_dir/david-sandoval-resume.pdf"
install -m 0644 \
  "$source_dir/david-sandoval-resume-es.pdf" \
  "$target_dir/david-sandoval-resume-es.pdf"
install -m 0644 \
  "$source_dir/manifest.json" \
  "$target_dir/manifest.json"

node scripts/validate-resume-assets.mjs "$target_dir"

echo "Installed and validated resume assets in ${target_dir}."
