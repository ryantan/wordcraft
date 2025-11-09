
Your task is to help the user to generate a commit message and commit the changes using git.


## Guidelines

- Look through what's in `git status` and `git diff` to see what files have been modified
- Order the commits in a intelligent manner so it's easy to understand the changes
- Fix up if there are any additional changes to existing files in the current branch, when unsure ask the user
- DO NOT add any ads such as "Generated with [Claude Code](https://claude.ai/code)"
- Generate commits with only titles so they are all one line commits
- Follow the rules below for the commit message. Make sure to adhere to Conventional Commits specification when generating commit messages.
- Write the `git add` and `git commit` in the same line so it's easier to approve them


## Format

```
<type>(<scope>):<space><message title>
```

## Example Titles

```
feat(auth): add JWT login flow
fix(ui): handle null pointer in sidebar
refactor(api): split user controller logic
docs(readme): add usage section
```

## Rules

* title is lowercase, no period at the end.
* Title should be a clear summary, max 50 characters.

Avoid

* Vague titles like: "update", "fix stuff"
* Overly long or unfocused titles
* Excessive detail in bullet points

## Allowed Types

| Type     | Description                           |
| -------- | ------------------------------------- |
| feat     | New feature                           |
| fix      | Bug fix                               |
| chore    | Maintenance (e.g., tooling, deps)     |
| docs     | Documentation changes                 |
| refactor | Code restructure (no behavior change) |
| test     | Adding or refactoring tests           |
| style    | Code formatting (no logic change)     |
| perf     | Performance improvements              |