# Contributing to Sablier Airdrops Sandbox

Thank you for your interest in contributing!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `bun install`
3. Copy `.env.example` to `.env.local`
4. Run development server: `just dev`

## Code Style

This project uses:

- **Biome** for TypeScript/JSON linting and formatting
- **Prettier** for Markdown/YAML formatting
- **TypeScript strict mode**

Run checks before committing:

```bash
just full-check    # Lint, format check, type check
just full-write    # Auto-fix issues
```

## Pull Requests

1. Create a feature branch
2. Make your changes
3. Run `just full-write` to format
4. Run `just full-check` to validate
5. Open a PR with clear description

## Reporting Issues

Please include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Node version, OS, etc.)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
