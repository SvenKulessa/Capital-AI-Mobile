# CAPITAL-AI-Mobile — root agent execution policy

Contract: `SOLO_MAINTAINER_FLOW@2` | Owner direction: 2026-11-18
Scope: this repository only. This root file is the sole repository-wide authorizing agent policy.

## Mobile-specific safeguards
Keep Android and web mobile source layouts, package identity, existing mobile-quality checks, Chromium test fixtures and signed artifact provenance intact. No unapproved production release, Play signing key, permissions expansion, backend credentials, cost activation or customer-data mutation. No Android Root/ADB or Accessibility automation. Preserve the actual mobile release rules and GitHub Ruleset 24424098.

## CI and merge
Use scoped feature/fix branches, current main and prior scope PRs. Test relevant mobile unit/browser/Gradle paths plus negative/permission/license cases. Record run IDs, APK hashes and exact commit SHA. A code merge is not an app release. Merge only with repository-allowed merge method and all real gates; verify post-merge results.


## Cross-repository execution — owner direction 2026-11-18

Adopt the execution pattern of [CAPITAL-AI Root AGENTS.md](https://github.com/SvenKulessa/Capital-AI/blob/main/AGENTS.md), contract `SOLO_MAINTAINER_FLOW@2`, **as repository-local practice**. This root file remains the only authorizing instruction here. No foreign workflow, rule, check, provider credential, deploy authorization or finance-specific regulation is imported.

- **One-pass convergence:** inspect current main, this root policy, open PRs/issues and the actual affected checks once; reuse existing evidence and prioritize a single smallest complete change. Prefer repairing an existing scoped PR to opening a competing PR. Classify old PRs as MERGE_READY, REPAIR, SUPERSEDED, BLOCKED or NOT_PROVEN against exact SHAs; close only verified duplicates/superseded work with a link.
- **Execution-first:** analyze → implement → relevant positive/negative tests → repair bounded failures → review actual CI/rulesets/reviews → merge when legitimately authorized and fully green → verify new main. Do not create empty milestone PRs or redundant evidence-only branches. Never claim a blocked gate is green.
- **Merge immediately when eligible:** this owner instruction delegates safe repository-local *code PR* merging within active protections, using the merge method actually permitted by that repository. Check current base/head SHA, mergeability, all relevant CI/security/license checks, review threads and requested reviewers; use an expected-head-SHA guard. For critical auth, secrets, data, signing, release/publishing, paid actions and missing human approvals: stop the particular protected action and report BLOCKED instead of weakening gates. No standalone approval loop for routine code when checks and existing authorization suffice.
- **Domain orchestration:** select one accountable primary domain among PRODUCT, MARKET, PLATFORM, TRUST, GROWTH. Invoke fit-for-purpose specialists (Android/mobile, accessibility, AI/data, app security, compliance, release) from the advisory [CAPITAL-AI skill registry](https://github.com/SvenKulessa/Capital-AI/blob/main/.agents/skills/registry.json) and this repository's actual local tools. Specialists exchange evidence only, not new permissions or independent policies.
- **Backlog hygiene:** reconcile issues to code/PRs on each scoped run; deduplicate and link cause to fix. Close confirmed finished/superseded issues only after code and checks prove resolution. Keep release and deployment approval boundaries intact.

This addendum does not change branch protection, required checks, action permissions or production/release gates.
