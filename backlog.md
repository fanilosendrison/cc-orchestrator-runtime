# Backlog

Items triaged by loop-clean. Resolved items archived in `backlog.archive.md`.

## 2026-04-20 external review

- [ ] [major] `tests/properties/properties.test.ts:19-23` — 30 tests P-01..P-30 all execute the same body (`await runOrchestrator(config)`) with zero assertion. Placeholders masquerading as property coverage, inflating the 490-tests count with ~30 no-signal tests. Each P-XX must assert the distinct property it claims from NIB-T-CCOR §26. (cheat-detection / tests)
- [ ] [major] `src/services/state-io.ts:168-169` — writeStateAtomic() uses writeFileSync + renameSync without fsync on the file fd before rename and without fsync on the parent directory after rename. Atomic rename protects logical atomicity but not durability under crash: on commit-reordering filesystems, rename may persist before tmp contents, leading to truncated/empty state.json on kernel panic. Critical for "snapshot-authoritative" guarantee (I-1). Fix: openSync(tmp, "wx") → writeSync → fsyncSync(fd) → closeSync → renameSync → openSync(dir) → fsyncSync(dirFd) → closeSync. (durability / correctness)
- [ ] [minor] `src/engine/dispatch-loop.ts:25-38` — deepFreeze() recurses without cycle protection. Stack overflow on user state with cyclic references (e.g., `const s = { self: null }; s.self = s`). `Object.isFrozen` short-circuit only protects on second pass, not within the first cycle. Fix: thread a WeakSet of visited objects. (adversarial-input / correctness)
- [ ] [nit] `src/services/lock.ts:12,37,74-84` — LockFile.ownerPid is stored and surfaced in the RunLockedError message but never used for a `process.kill(pid, 0)` liveness check. Field is semantically dead: carries no actionable signal beyond the error string. Either wire it to allow immediate override on dead process, or drop it and rely solely on lease expiry. (dead-code-semantic)

## 2026-04-20 loop-clean iter-0

- [ ] [minor] `src/services/error-classifier.ts` — classify() missing explicit exhaustive default return after switch. Fragile if OrchestratorErrorKind extended. (correctness)
- [ ] [minor] `src/services/state-io.ts:131` — readState() mutates parsedObj.data after Zod parse instead of reconstructing immutably. (correctness)
- [ ] [info] `src/services/run-dir.ts:42` — cleanupOldRuns() uses fs.rmSync instead of trash. Acceptable for ephemeral run dir cleanup. (hygiene)
- [ ] [info] `src/engine/context.ts:30` — IS_TEST module-level IIFE is immutable constant, not mutable singleton. Acceptable. (hygiene)
- [ ] [info] `src/services/logger.ts:36` — createLogger() silent catch in stderrEmit is intentional exception to I-4 for logger resilience. (correctness)
- [ ] [info] `src/services/lock.ts:62` — acquireLock() silent override on corrupted lock file lacks explanatory comment. (hygiene)
- [ ] [info] `src/engine/dispatch-loop.ts:685` — handleDone() JSON.stringify edge case for non-serializable values already handled per NIB-M-STATE-IO section 6. (correctness)
- [ ] [info] spec-drift: RetryDecision — code uses discriminated union (retry: true | false) vs spec boolean. Code is stricter than spec. Reconcile spec to match code. (spec-drift)
- [ ] [info] spec-drift: 11 generic type false positives from spec-drift tooling (DelegationBinding, Phase, PhaseIO, PhaseResult, StateFile, ValidationResult, DispatchContext). Tooling limitation, not real drift. (spec-drift-tooling)
