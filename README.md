# sanj-astro-agent

Describe what your agent does in one sentence.

## Quick start

```bash
# Install dependencies
bun install

# Start the agent locally
ast dev
```

## Project structure

```
sanj-astro-agent/
├── agent/
│   └── index.ts          # Agent entry point
├── astropods.yml             # Agent specification
├── Dockerfile            # Agent container
├── .env                  # Environment variables (set via ast configure; not committed)
└── package.json
```

## Configuration

The agent is configured in `astropods.yml`. Key sections:

### Integrations

| Integration | Type | Environment variable |
|------------|------|---------------------|
| Anthropic | Model API | `ANTHROPIC_API_KEY` |

### Interfaces
- **Web** — HTTP/SSE endpoint (playground available at `localhost:3100` during dev)

