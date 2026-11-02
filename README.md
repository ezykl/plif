# Plif

Free, open-source flipbook creator and reader. Turn PDFs and images into realistic
page-turning books (single page, double-page spread, hard covers) and embed them anywhere,
with no coding required.

> Status: early scaffolding. Built on [StPageFlip](https://github.com/Nodlik/StPageFlip) (MIT).

## Development

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
```

## Layout

- `packages/core`: shared types and logic
- `packages/reader` and `apps/web`: coming in later milestones

See [CONTRIBUTING.md](CONTRIBUTING.md) for the commit and branching rules.

## License

[MIT](LICENSE)
