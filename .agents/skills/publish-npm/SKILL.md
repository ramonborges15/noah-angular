---
name: publish-npm
description: Publish the `shared-components` Angular library (@ramonbsales/noah-angular) to npm using GitHub Actions with semantic versioning. Includes prerequisites, step-by-step release process, example commands, and helpful recommendations.
---

Purpose
- **Goal:** Automate publishing the `projects/shared-components` library to npm when a semantic tag (e.g., `v1.2.3`) is pushed.

Prerequisites
- **NPM token:** Add `NPM_TOKEN` to GitHub repository secrets (type: Automation). See https://www.npmjs.com/settings for token creation.
- **Workflow file:** Ensure a workflow exists at `.github/workflows/publish.yml` that builds `shared-components` and publishes on pushed tags (recommended `on: push: tags: 'v*.*.*'`).

Expected project paths
- **Library package.json:** `projects/shared-components/package.json`
- **Workflow:** `.github/workflows/publish.yml`

Publish process (manual steps)
- 1) Update version: edit `projects/shared-components/package.json` → set `version` to the next semantic version (MAJOR.MINOR.PATCH).
- 1.5) Update `CHANGELOG.md` with release notes (required before tagging).
- 2) Commit changes: `git add projects/shared-components/package.json CHANGELOG.md` then `git commit -m "chore: bump version to X.Y.Z"`.
- 3) Create annotated tag: `git tag -a vX.Y.Z -m "chore: release vX.Y.Z"`.
- 4) Push tag: `git push origin vX.Y.Z`.

Example commands
```bash
# Bump version and commit
git add projects/shared-components/package.json CHANGELOG.md
git commit -m "chore: bump version to 1.1.0"
# Create annotated tag and push
git tag -a v1.1.0 -m "chore: release v1.1.0"
git push origin v1.1.0
```

What the workflow should do
- Build: `ng build shared-components --configuration=production` (or equivalent build step)
- Authenticate to npm using `NPM_TOKEN` and publish the package scope `@ramonbsales/noah-angular`

Checklist
- **Version updated:** projects/shared-components/package.json
- **CHANGELOG:** updated and committed
- **Tag created:** vX.Y.Z (annotated recommended)
- **Tag pushed:** `git push origin vX.Y.Z`
- **GitHub Actions:** triggered and completed successfully
- **Published:** package visible on npmjs.com

Recommendations & optional improvements
- Use `v*.*.*` tag trigger to enforce semver tagging.
- Prefer annotated tags (`git tag -a ...`) for clearer history.
- Push only the created tag (`git push origin vX.Y.Z`) rather than `--tags` to avoid pushing unintended tags.
- Add build/publish dry-run (`npm publish --dry-run`) to the workflow for extra safety.
- Add CI and npm status badges to `README.md`.

Agent usage example (instructions for automation)
"""
Inputs expected by this skill:
- workspace: /root/Pessoal/noah-angular
- library path: projects/shared-components
- next version: X.Y.Z

Task the agent should perform:
1. Update `projects/shared-components/package.json` → set `version` to X.Y.Z
2. Update `CHANGELOG.md` and commit both files
3. Create annotated tag `vX.Y.Z` and push it (`git push origin vX.Y.Z`)
4. Confirm GitHub Actions run and package published on npm
"""

Notes
- This skill documents the manual release workflow and the expectations for an automated GitHub Action. Actual publish permissions depend on the `NPM_TOKEN` used in GitHub Secrets.

References
- `PUBLISH_SKILL.md` in repo root for a human-friendly checklist and examples.