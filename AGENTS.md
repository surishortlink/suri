# AGENTS.md

This file provides guidance to agentic agents like Claude Code and other coding
agents when working with code in this repository.

## Project

Suri is an npm package (`@surishortlink/suri`) that builds a static site of
short link redirects from a `links.json` file. Users don't fork this repository:
they create a site from one of the `suri-deploy-*` template repositories listed
in the README, which depend on this package and run its `suri` executable in
their `build` script. Changes reach users through npm releases, so the
`links.json` format, the `suri.config.json` options, the `build` output, and the
CLI's behavior are a public contract. So is the programmatic API exported from
`src/main.js`: the default `main({ path })` (`path` defaults to the current
working directory; resolves to `true`) and the named `SuriError`.

Suri has zero runtime dependencies (only `devDependencies`). Keep it that way.

## Commands

There's no build or typecheck step. A change is verified by `npm run lint` and
`npm test`.

- `npm test`: the built-in Node.js test runner. Run a single file with
  `node --test src/main.test.js`, or a single test with
  `node --test --test-name-pattern="<test name>"`.
- `npm run lint`: runs `lint:format` (Prettier) and `lint:quality` (ESLint) in
  sequence. Each has a `:fix` variant (e.g. `npm run lint:format:fix`).
- `npm run docs`: generates JSDoc HTML into the git-ignored `docs` directory.
  JSDoc's default `excludePattern` skips any path segment starting with `_`, so
  the output is empty if the checkout lives under a directory like `_personal`.
- `npm run release`: release-it, run by the maintainer on a `release/x.x.x`
  branch cut from `development`. It bumps the version, commits, tags `vX.Y.Z`,
  pushes, publishes to npm, and creates the GitHub release. See "Releasing" in
  the README for the full process.

Node.js versions are set in three places: `engines.node` in `package.json` (the
minimum supported version), the CI matrix in `.github/workflows/ci.yml` (the
versions tested), and `.nvmrc` (the version used for development). When changing
supported versions, update all three. ESLint's
`n/no-unsupported-features/node-builtins` rule reads `engines`, so changing it
can require updating the rule's `ignores` in `eslint.config.js`.

`.npmrc` sets `ignore-scripts=true`, so dependency install scripts never run.
Don't remove it. If a dependency genuinely needs its install script, run
`npm rebuild <pkg> --ignore-scripts=false` for that package.

## Architecture

`bin/suri.js` is a thin CLI: it calls `main()` with the current working
directory, prints `Error: <message>` on failure (plus a `↳ <cause>` line when
the error has a cause), and sets the exit code to 1.

`src/main.js` is the whole build, orchestrated by `main()`:

1. Remove the `build` directory.
2. Load `suri.config.json`, if it exists, merged over the defaults. Its only
   option is `js` (default `false`), which redirects with
   `window.location.replace()` instead of a `<meta>` refresh. The config isn't
   validated.
3. Load and validate `src/links.json`.
4. Create `build/<link path>/index.html` for each link.
5. Copy Suri's own `public` directory (default `favicon.ico` and `robots.txt`),
   then the site's `public` directory. Both overwrite whatever's already in
   `build`, including generated link pages.

On any error, `main()` tries to remove the `build` directory, ignoring a failure
to do so, and rethrows the original error. Expected failures throw `SuriError`
(`src/error.js`) with a `Failed to …` message and the underlying error as
`cause`, or an `Invalid …` message for validation errors, which have no cause.
These messages are shown to users by the CLI, so keep them short and specific.

The `html` tag is `String.raw`, not a templating engine, so nothing is escaped
automatically. Any value interpolated into a page must go through
`escapeHTMLAttribute` (attribute values) or `serializeScriptString` (inside a
`<script>`). Prettier formats `html` tagged templates as embedded HTML, so a
Prettier update can change the whitespace of the generated pages.

Validation is deliberately minimal, since `links.json` is written by the site
owner. It rejects input that would crash the build, and any `..` path segment so
that nothing is written outside `build`. Targets can be any string that isn't
blank, including relative paths, which existing sites may rely on. Paths that
resolve to the same directory (like `gh` and `/gh/`) aren't caught, so the last
one silently wins. Tightening what `links.json` accepts, or dropping a Node.js
version, can break existing sites and must be called out in the release notes.

Every function in `src` has a JSDoc block, including private ones (marked
`@private`). Follow that convention.

What gets published is an allowlist (`files` in `package.json`), with
`!<dir>/**/*.test.js` patterns to exclude colocated tests. Adding a top-level
directory to `files` that contains tests needs another exclusion. Check the
result with `npm pack --dry-run`.

## Tests

`src/main.test.js` tests `main()` directly. `bin/suri.test.js` tests the CLI by
running it as a child process. Tests assert exact error messages, and compare
generated HTML with `readTemplatesHTML` (`test/utilities.js`), which collapses
whitespace so assertions don't depend on Prettier's indentation.

Fixtures are directories under `test/templates`, named `pass*` or `fail_*`, and
laid out like a user's site (`src/links.json`, `suri.config.json`, `public`)
with only the files their tests need. A test runs `main()` against a fixture and
inspects the `build` directory it creates, which is git-ignored.

- `node --test` runs test files in parallel processes, so a fixture must only be
  used by one test file. That's why the CLI tests have their own `pass_cli` and
  `fail_cli`. Tests within a file run sequentially and can share fixtures.
- Read and remove failures are simulated by creating a file or directory with
  mode `0o000` during the test and restoring it with `t.after()`. These tests
  fail when run as root.
- Fixtures that intentionally contain invalid JSON must be listed in
  `.prettierignore`.

## Branches

Branch off `development` and open pull requests against it. Releases go through
a `release/x.x.x` pull request into `main`, which should always reflect the
latest release. It's merged with a merge commit, after which `development` is
fast-forwarded to `main`.
