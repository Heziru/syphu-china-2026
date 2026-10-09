#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
ROOT="$PWD"
TOOL="$ROOT/outputs/dry-lab-atomistic/hdocklite"
export LD_LIBRARY_PATH="$TOOL/runtime/usr/lib/x86_64-linux-gnu:${LD_LIBRARY_PATH:-}"
for CASE in 1fle-redocking human-ne-elafin; do
  cd "$ROOT/public/assets/dry-lab/atomistic/docking/$CASE"
  if [ ! -s docking.out ]; then
    echo "Starting $CASE $(date -Is)"
    "$TOOL/hdock" receptor.pdb ligand-independent.pdb -out docking.out > hdock.log 2>&1
  fi
  "$TOOL/createpl" docking.out top100.pdb -nmax 100 -complex -models > createpl.log 2>&1
  echo "Completed $CASE $(date -Is)"
done
