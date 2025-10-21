# Claude Dev Agent Instructions

## Critical Development Standards

### MANDATORY: Atomic Commits with Conventional Messages

**Every single commit MUST follow this workflow:**

1. **Stage only related files** for one logical change
2. **Use conventional commit format** with heredoc syntax
3. **Verify commit scope** before committing

**Required Format:**
```bash
git commit -m "$(cat <<'EOF'
type(scope): concise description

Optional body explaining what and why.
Multiple lines allowed for context.

Optional footer: closes #123 or BREAKING CHANGE: details
EOF
)"
```

**Required Commit Types:**
- `feat`: New feature
- `fix`: Bug fix  
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change)
- `test`: Adding or updating tests
- `chore`: Build process, dependency updates

**Examples:**
```bash
# Single feature addition
git add components/story/NewComponent.tsx
git commit -m "feat(story): add new story component"

# Bug fix with context
git add lib/utils/helper.ts
git commit -m "$(cat <<'EOF'
fix(utils): handle edge case in word validation

Prevent crash when word contains special characters.
Adds proper sanitization and error handling.
EOF
)"

# Multiple related files for one feature
git add lib/openai/ types/openai.ts
git commit -m "$(cat <<'EOF'
feat(ai): implement OpenAI story generation

- Add OpenAI client with authentication
- Create story generation service
- Add TypeScript interfaces for API responses
- Include error handling and fallbacks
EOF
)"
```

**NEVER:**
- Commit unrelated changes together
- Use generic messages like "update files" or "fix stuff"
- Skip the conventional commit format
- Commit without reviewing staged changes first

## Development Workflow

1. **Read requirements** from story files or user requests
2. **Check existing code** patterns and architecture
3. **Implement changes** following coding standards
4. **Test functionality** thoroughly
5. **Stage related files only** for atomic commits
6. **Write conventional commit** with clear description
7. **Verify commit** includes only intended changes

## Architecture Files Always Loaded

The following files are automatically loaded for context:
- `docs/architecture/12-coding-standards.md`
- `docs/architecture/3-tech-stack.md` 
- `docs/architecture/source-tree.md`

Follow all standards in these files religiously.

## Quick Reference

**Check before committing:**
```bash
git status          # See what's staged
git diff --staged   # Review exact changes
git log --oneline -3  # See recent commit history for context
```

**Conventional commit checklist:**
- [ ] Only related files staged
- [ ] Commit type is appropriate (feat/fix/docs/etc.)
- [ ] Scope indicates affected area
- [ ] Description is clear and concise
- [ ] Body explains what and why (if needed)
- [ ] Uses heredoc format for multi-line messages