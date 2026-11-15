<!-- fallow:setup-hooks:start -->

## Fallow checks

Use fallow for code-quality, cleanup, and setup tasks in this repository. Fallow checks the changed code before each `git commit` and `git push`. In Claude Code and Codex, a PreToolUse hook from `fallow agent install` runs this check and blocks the command when the verdict is `fail`. Other agents run the check themselves: `fallow audit --format json --quiet --explain --gate-marker agent`. If the verdict is `fail`, fix the reported findings before you try again. A JSON runtime error such as `{ "error": true, ... }` does not block.

Audit defaults to `gate=new-only`: only findings introduced by the current changeset affect the verdict. Inherited findings on touched files are reported under `attribution` and annotated with `introduced: false`, but do not block the commit. Set `[audit] gate = "all"` in `fallow.toml` to gate every finding in changed files.

For non-skill agents, treat the task map below as the local onboarding source: run the listed fallow command before destructive edits, before commits, and before pull request handoff.

## Fallow task map

| When the agent is about to...                                        | Run                                                                                                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| delete an "unused" export or file                                    | `fallow dead-code --trace <file>:<export>`                                                                                                                    |
| prove a TypeScript symbol's exact consumers before refactoring       | `fallow dead-code --type-aware --symbol-impact <file>:<export-or-class.method>`                                                                               |
| find how one module reaches another                                  | `fallow trace --path <from> <to>` (Reports `reachable: false` instead of failing when no import path exists; type-only hops are reported, not skipped.)       |
| delete an "unused" dependency                                        | `fallow dead-code --trace-dependency <name>`                                                                                                                  |
| migrate a dependency                                                 | `fallow trace --dependency <name> --sites` (Counts each imported name, follows one hop through project wrappers, and counts each use that it cannot resolve.) |
| commit or open a PR                                                  | `fallow audit --base <ref>`                                                                                                                                   |
| read a diff before approving it                                      | `fallow review --base <ref> --brief` (orientation, never gates: deterministic and always exit 0, unlike the audit row)                                        |
| prioritize refactoring                                               | `fallow health --hotspots --targets`                                                                                                                          |
| ask who owns code                                                    | `fallow health --ownership`                                                                                                                                   |
| check untested-but-reachable code                                    | `fallow health --coverage-gaps`                                                                                                                               |
| consolidate duplication                                              | `fallow dupes --trace dup:<fingerprint>`                                                                                                                      |
| find feature flags                                                   | `fallow flags`                                                                                                                                                |
| check which architecture rules apply to a file before changing it    | `fallow guard <files>`                                                                                                                                        |
| check import cycles, boundaries and policy rules after changing code | `fallow architecture`                                                                                                                                         |
| surface security candidates                                          | `fallow security`                                                                                                                                             |
| understand a finding                                                 | `fallow explain <issue-type>`                                                                                                                                 |
| scope a monorepo                                                     | `--workspace <glob> / --changed-workspaces <ref>` (global flags, prefix any command)                                                                          |

<!-- fallow:setup-hooks:end -->

## Domain language

Use the terms in `GLOSSARY.md` (haystack, query, term, range, segment,
normalization, score) in code, tests and docs. Decisions live in `docs/adr/`.

## The gate

`pnpm verify` is the whole gate: typecheck, `vp check` (format and lint),
tests with 100% coverage, fallow (`dead-code`, `health --coverage-gaps`,
`dupes`, all with `--ci`), the library build and the docs build. It runs in CI
on every push and pull request. Fallow's audit gates every finding in changed
files (`"audit": { "gate": "all" }` in `.fallowrc.jsonc`).

## The layers

Declared in `.fallowrc.jsonc`; a violation fails the build.

| Zone         | Files      | May import                                |
| ------------ | ---------- | ----------------------------------------- |
| `public-api` | `index.ts` | `core`                                    |
| `core`       | `src/**`   | `core`                                    |
| `tests`      | `tests/**` | `public-api` (and `core` only through it) |
| `docs`       | `docs/**`  | `public-api` (and `core` only through it) |

Tests and docs import from `index.ts` only. A test that imports `src/`
directly leaves the public export untested, which `coverage-gaps` reports.

## Releasing

A release is a pull request that bumps the version in `package.json` and
updates `CHANGELOG.md`. Merging it into `master` triggers
`.github/workflows/release.yml`, which stages the new version on npm (only when
the version is not on npm yet) and creates the `vX.Y.Z` GitHub release. The
version goes live once a maintainer approves it with 2FA. Never run
`npm publish`, `npm stage approve` or push a version tag by hand.
