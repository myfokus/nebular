/**
 * Publishes the three packages this fork maintains. Upstream's tools/publish.sh iterates over
 * everything in dist/, which would also push the packages we do not maintain (auth, moment,
 * security, firebase-auth) under a scope we own but never build.
 *
 * Node rather than a shell script: npm runs scripts through cmd.exe on Windows, which cannot
 * execute a .sh file, so the shell version only ever worked on macOS and Linux.
 *
 * Theme is published first on purpose: the other two declare it as a peer dependency, so a
 * consumer installing them before the matching theme version exists gets an unresolvable range.
 *
 * Extra arguments are forwarded to npm publish, so `npm run publish:myfokus -- --dry-run`
 * validates the whole run without touching the registry.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PACKAGES = ['theme', 'date-fns', 'eva-icons'];
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const forwarded = process.argv.slice(2);

// Node refuses to spawn a .cmd directly without a shell, so Windows needs shell: true. Every
// argument below is a literal flag, never a path, so nothing needs quoting.
const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';

const missing = PACKAGES.filter((pkg) => !existsSync(path.join(root, 'dist', pkg, 'package.json')));

if (missing.length > 0) {
  console.error(
    `Missing ${missing.map((pkg) => `dist/${pkg}`).join(', ')} - run "npm run build:myfokus" first`,
  );
  process.exit(1);
}

for (const pkg of PACKAGES) {
  console.log(`\nPublishing dist/${pkg}`);
  execFileSync(npm, ['publish', '--access=public', ...forwarded], {
    cwd: path.join(root, 'dist', pkg),
    stdio: 'inherit',
    shell: isWindows,
  });
}
