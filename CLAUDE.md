# Development Instructions

When you generate new code or update existing code, run `just full-check` to verify the code is correctly formatted. If
there are any errors, use `just full-write` to fix them. If there are issues still, figure out why and fix them.

- To check the TypeScript code only, run `just tsc-check`.
- To install dependencies, run `bun add some-package` or `bun add --dev some-package` (for dev dependencies).
- To see all available dependencies, run `just --list`.
