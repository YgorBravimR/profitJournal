---
description: Commit current changes, push them, and create a PR towards staging
allowed-tools: Bash(git status:*), Bash(git add:*), Bash(git diff:*), Bash(git commit:*), Bash(git push:*), Bash(git log:*), Bash(gh pr:*)
---

# Commit, Push, and Create Pull Request to Staging

Follow these steps to commit current changes and create a PR towards the `staging` branch:

1. **Check current status**: Run `git status` to see all staged and unstaged changes
2. **Review changes**: Run `git diff` to see the changes that will be committed
3. **Stage changes if needed**: If there are unstaged changes, use `git add` to stage them
4. **Create commit**: Create a descriptive commit with an appropriate message based on the changes
5. **Push to remote**: Push the current branch to origin using `git push -u origin <branch-name>`
6. **Create PR**: Use `gh pr create` to create a pull request targeting the `staging` branch

When creating the PR:
- Use a clear, descriptive title summarizing the changes
- Include a summary of what was changed in the PR body
- Target the `staging` branch as the base branch

Commit message: $ARGUMENTS
