# GIT development guideline

## Commandments

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
- [Explain the why, not the what, in your commit message](https://chris.beams.io/posts/git-commit/):

  ```gitcommit
  # Bad
  Updated index.js field
  # Good
  Remove debug statement from index.js
  ```

  - Keep in mind: [This](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) [has](https://www.git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines) [all](https://github.com/torvalds/subsurface-for-dirk/blob/master/README.md#contributing) [been](http://who-t.blogspot.co.at/2009/12/on-commit-messages.html) [said](https://github.com/erlang/otp/wiki/writing-good-commit-messages) [before.](https://github.com/spring-projects/spring-framework/blob/30bce7/CONTRIBUTING.md#format-commit-messages)

- Your commit message must also refer to issue number:

  ```gitcommit
  #9 Remove debug statement from index.js
  ```

- Rebase instead of merge to resolve conflicts. However, do not rebase or amend your branch/commit of your branch is already pulled down by someone else.

### PR / CHANGELOG

- Use pull requests. Get reviews.
- Do not commit or push directly to the master branch (you won't have permission to do this anyway).
- Before creating the PR, please make sure:
  - An entry is added to the [CHANGELOG.md](../README.md). Your changelog entry should also refer to the issue number.
  - Your branch is based on the latest change in the master branch. If not, rebase onto the latest changes of the `master` branch.
  - Your PR is free of merge conflict. If not, please rebase onto the latest changes of the `master` branch and resolve the conflicts.
