# cc-orchestrator-runtime

Normalized execution engine for phase-structured orchestrators inside Claude Code sessions. Snapshot-authoritative state, in-band stdout protocol, POSIX-grade I/O discipline.

Currently at specification stage — see `specs/` for normative briefs (NIBs) and `docs/NX-CC-ORCHESTRATOR-RUNTIME.md` for the consolidated design.

## Getting Started

### Prerequisites

- Bun >= 1.1 (or Node >= 22)

### Install

```bash
git clone git@github.com:fanilosendrison/cc-orchestrator-runtime.git
cd cc-orchestrator-runtime
bun install
```

### Verify

```bash
bun test               # run tests
bun run typecheck      # strict tsc --noEmit
bun run lint           # biome check src/ tests/
```

### Build

```bash
bun run build          # emit ./dist from src/
```
