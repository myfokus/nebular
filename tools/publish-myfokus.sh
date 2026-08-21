#!/usr/bin/env bash

# Publishes the three packages this fork maintains. Upstream's tools/publish.sh iterates over
# everything in dist/, which would also push the packages we do not maintain (auth, moment,
# security, firebase-auth) under a scope we own but never build.
#
# Theme is published first on purpose: the other two declare it as a peer dependency, so a
# consumer installing them before the matching theme version exists gets an unresolvable range.

set -euo pipefail

for package in theme date-fns eva-icons; do
  if [ ! -d "dist/${package}" ]; then
    echo "dist/${package} is missing - run 'npm run build:myfokus' first" >&2
    exit 1
  fi
done

for package in theme date-fns eva-icons; do
  echo "Publishing dist/${package}"
  npm publish --access=public "dist/${package}/"
done
