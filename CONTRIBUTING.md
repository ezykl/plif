# Contributing

## Workflow

- `main` is always deployable. Work on short-lived branches: `feat/...`, `fix/...`, `docs/...`.
- Open a pull request; it is squash-merged once CI passes.
- Keep commits small and focused.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint:

```
feat(reader): add pinch zoom
fix(pdf): handle encrypted files
docs: update embed guide
chore: bump dependencies
```

## Before pushing

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Never commit secrets or `.env` files.
