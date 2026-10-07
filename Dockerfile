# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# The platform sets a prerelease channel in preview; `latest` leaves the
# dependency versions below as written. @astropods/messaging is overridden
# because it sits outside the adapters workspace, so no adapter release pins it.
ARG ASTRO_SDK_CHANNEL=latest

COPY package.json ./
RUN if [ "$ASTRO_SDK_CHANNEL" != "latest" ]; then \
      bun -e 'const fs=require("fs");const c=process.env.ASTRO_SDK_CHANNEL;const p=JSON.parse(fs.readFileSync("package.json","utf8"));for(const d of Object.keys(p.dependencies||{}))if(d.startsWith("@astropods/"))p.dependencies[d]=c;p.overrides={...p.overrides,"@astropods/messaging":c};fs.writeFileSync("package.json",JSON.stringify(p,null,2)+"\n")'; \
    fi
RUN bun install

# Copy source
COPY . .

# --- runtime stage ---
FROM oven/bun:1 AS runtime
WORKDIR /app
COPY --from=builder /app /app

# Case data is stored in the Postgres knowledge store (see astropods.yml), not on the
# container's read-only filesystem — no local file to pre-create here.

ENV PORT=80
EXPOSE 80

# Do NOT drop to a non-root user here (no `USER bun` / chown steps) — binding port 80
# requires root.
CMD ["bun", "run", "agent/index.ts"]
