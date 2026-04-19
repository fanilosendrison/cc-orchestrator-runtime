import type { OrchestratorEvent, OrchestratorLogger } from "../types/events";
import type { LoggingPolicy } from "../types/policies";

export interface InternalLogger extends OrchestratorLogger {
	enableDiskEmit(eventsNdjsonPath: string): void;
	disableDiskEmit(): void;
}

export function createLogger(
	_policy: LoggingPolicy | undefined,
): InternalLogger {
	throw new Error("Not implemented");
}

export type { LoggingPolicy, OrchestratorEvent, OrchestratorLogger };
