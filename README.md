# cc-orchestrator-runtime

**A durable finite-state-machine runtime for TypeScript.** Runs a typed phase machine whose every stable transition is atomically snapshotted to disk. Suspends by **terminating its own process** with a structured stdout block, and resumes when re-invoked with `--resume --run-id <id>` — the state lives on disk between runs, not in memory.

The core is **host-agnostic**: it emits opaque delegation requests (`kind: "skill" | "agent" | "agent-batch"`) and trusts a parent process to perform the work and relaunch the binary. The first consumer is a Claude Code integration (see [`docs/consumers/claude-code/`](docs/consumers/claude-code/)), but the runtime itself knows nothing about Claude, skills, or agents — it is reusable by any parent that can read stdout and write result files.

See [`docs/SEPARATION.md`](docs/SEPARATION.md) for the ongoing work to cleanly separate the generic runtime from its Claude Code integration.

Snapshot-authoritative state, in-band stdout protocol, POSIX-grade I/O discipline. Currently at specification stage — see `specs/` for normative briefs (NIBs) and `docs/NX-CC-ORCHESTRATOR-RUNTIME.md` for the consolidated design.

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
