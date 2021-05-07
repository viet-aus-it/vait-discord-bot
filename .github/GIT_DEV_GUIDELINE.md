# GIT development guideline
## Commandments:
### Branch
- Create a new branch for every task / small feature / bug fix from `master`
- Branch prefix:
  - Feature: `feature/`
  - Release: `release/`
  - Hotfix: `hotfix/`
  - Support: `support/`
- Branch name should refer to issue number: e.g `feature/#9_referral_link`
### Commit
- Make small/atomic commits.
- Do not commit vendor/compiled code.
- Do not commit commented-out code — just delete it.
- Explain the why, not the what, in your commit message:
  ```
  // Bad
  Updated index.js field
  // Good
  Remove debug statement from index.js
  ```
- Your commit message must also refer to issue number:
  ```
  #9 Remove debug statement from index.js
  ```
- Rebase instead of merge to resolve conflicts. However oo not rebase or ammend your branch/commit of your branch is already pull down by someone else
### PR / CHANGELOG
- Use pull requests. Get reviews.
- Do not commit or push directly to the master branch (you won't have permission to do this anyway)
- Before creating the PR, make sure you add a new entry to the [CHANGELOG.md](../README.md). Your changelog entry should also refer to the issue number
