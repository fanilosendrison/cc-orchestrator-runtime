import type { ZodSchema } from "zod";

export interface PendingDelegationRecord {
	readonly label: string;
	readonly kind: "skill" | "agent" | "agent-batch";
	readonly resumeAt: string;
	readonly manifestPath: string;
	readonly emittedAtEpochMs: number;
	readonly deadlineAtEpochMs: number;
	readonly attempt: number;
	readonly effectiveRetryPolicy: {
		readonly maxAttempts: number;
		readonly backoffBaseMs: number;
		readonly maxBackoffMs: number;
	};
	readonly jobIds?: readonly string[];
}

export interface StateFile<State> {
	readonly schemaVersion: 1;
	readonly runId: string;
	readonly orchestratorName: string;
	readonly startedAt: string;
	readonly startedAtEpochMs: number;
	readonly lastTransitionAt: string;
	readonly lastTransitionAtEpochMs: number;
	readonly currentPhase: string;
	readonly phasesExecuted: number;
	readonly accumulatedDurationMs: number;
	readonly data: State;
	readonly pendingDelegation?: PendingDelegationRecord;
	readonly usedLabels: readonly string[];
}

export function readState<S>(
	_runDir: string,
	_schema?: ZodSchema<S>,
): StateFile<S> | null {
	throw new Error("Not implemented");
}

export function writeStateAtomic<S>(
	_runDir: string,
	_state: StateFile<S>,
	_schema?: ZodSchema<S>,
): void {
	throw new Error("Not implemented");
}
