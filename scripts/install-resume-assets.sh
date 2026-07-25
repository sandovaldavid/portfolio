#!/usr/bin/env bash

set -euo pipefail

source_dir="${1:-.resume-assets/public/resume}"
target_dir="${2:-public/resume}"

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
