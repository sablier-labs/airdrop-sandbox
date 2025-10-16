# See https://github.com/sablier-labs/devkit/blob/main/just/base.just
import "./node_modules/@sablier/devkit/just/base.just"

# ---------------------------------------------------------------------------- #
#                                    SCRIPTS                                   #
# ---------------------------------------------------------------------------- #

# Default recipe
default:
    just --list

# Clean the .next directory
clean:
    bunx del-cli .next

# Deploy website to Vercel
deploy environment="production":
    bun vercel pull --environment={{ environment }} --token=$VERCEL_TOKEN --yes
    bun vercel build --prod --token=$VERCEL_TOKEN
    bun vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
alias d := deploy

# ---------------------------------------------------------------------------- #
#                                      APP                                     #
# ---------------------------------------------------------------------------- #

# Start the Next.js app
[group("app")]
@build:
    bun next build

# Start the Next.js app in dev mode
[group("app")]
@dev:
    bun next dev --turbopack

# Build and start the Next.js app
[group("app")]
start: build
    bun next start

