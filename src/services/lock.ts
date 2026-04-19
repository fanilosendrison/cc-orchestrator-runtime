import type { Clock } from "../types/config";
import type { OrchestratorLogger } from "../types/events";

export { DEFAULT_IDLE_LEASE_MS } from "../constants";

export interface LockFile {
	readonly ownerPid: number;
	readonly ownerToken: string;
	readonly acquiredAtEpochMs: number;
	readonly leaseUntilEpochMs: number;
}

export interface LockHandle {
	readonly ownerToken: string;
	readonly lockPath: string;
}

export function acquireLock(
	_lockPath: string,
	_clock: Clock,
	_logger: OrchestratorLogger,
	_runId: string,
): LockHandle {
	throw new Error("Not implemented");
}

export function refreshLock(
	_lockPath: string,
	_handle: LockHandle,
	_clock: Clock,
	_logger: OrchestratorLogger,
	_runId: string,
): void {
	throw new Error("Not implemented");
}

export function releaseLock(
	_lockPath: string,
	_handle: LockHandle,
	_clock: Clock,
	_logger: OrchestratorLogger,
	_runId: string,
): void {
	throw new Error("Not implemented");
}
