# See https://github.com/sablier-labs/devkit/blob/main/just/base.just
import "./node_modules/@sablier/devkit/just/base.just"

# ---------------------------------------------------------------------------- #
#                                 DEPENDENCIES                                 #
# ---------------------------------------------------------------------------- #

# Bun: https://github.com/oven-sh/bun
bun := require("bun")

# Ni: https://github.com/antfu-collective/ni
na := require("na")
ni := require("ni")
nlx := require("nlx")

# ---------------------------------------------------------------------------- #
#                                    RECIPES                                   #
# ---------------------------------------------------------------------------- #

# Default recipe
default:
    just --list

# Clean the .next directory
clean:
    bunx del-cli .next

# ---------------------------------------------------------------------------- #
#                                      APP                                     #
# ---------------------------------------------------------------------------- #

# Start the Next.js app
[group("app")]
@build:
    na next build

# Start the Next.js app in dev mode
[group("app")]
@dev:
    na next dev --turbopack

# Start the Next.js app
[group("app")]
start:
    #!/usr/bin/env sh
    if [ ! -d .next ]; then
        na next build
    fi
    na next start
    
# ---------------------------------------------------------------------------- #
#                                 UTILITIES                                  #
# ---------------------------------------------------------------------------- #

# Set up environment file
[group("util")]
env-setup:
    @echo "Setting up environment file..."
    cp .env.example .env.local 2>/dev/null || echo "⚠️  .env.example not found"
    @echo "✅ Configure .env.local with your environment variables"

# Show project information
[group("util")]
info:
    @echo "🚀 Sablier Airdrop Sandbox"
    @echo "📦 Next.js $(nlx next --version)"
    @echo "🟢 Node $(node --version)"
    @echo "📋 Dependencies: $(cat package.json | jq '.dependencies | length') packages"

