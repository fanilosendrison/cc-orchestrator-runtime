export type ProtocolAction = "DELEGATE" | "DONE" | "ERROR" | "ABORTED";

export interface ParsedProtocolBlock {
	readonly version: number;
	readonly runId: string | null;
	readonly orchestrator: string;
	readonly action: ProtocolAction;
	readonly fields: Record<string, string | number | boolean | null>;
}

export interface DelegateFields {
	readonly runId: string;
	readonly orchestrator: string;
	readonly manifest: string;
	readonly kind: "skill" | "agent" | "agent-batch";
	readonly resumeCmd: string;
}

export interface DoneFields {
	readonly runId: string;
	readonly orchestrator: string;
	readonly output: string;
	readonly success: true;
	readonly phasesExecuted: number;
	readonly durationMs: number;
}

export interface ErrorFields {
	readonly runId: string | null;
	readonly orchestrator: string;
	readonly errorKind: string;
	readonly message: string;
	readonly phase: string | null;
	readonly phasesExecuted: number;
}

export interface AbortedFields {
	readonly runId: string;
	readonly orchestrator: string;
	readonly signal: "SIGINT" | "SIGTERM";
	readonly phase: string | null;
}

export function writeProtocolBlock(
	action: "DELEGATE",
	fields: DelegateFields,
): string;
export function writeProtocolBlock(action: "DONE", fields: DoneFields): string;
export function writeProtocolBlock(
	action: "ERROR",
	fields: ErrorFields,
): string;
export function writeProtocolBlock(
	action: "ABORTED",
	fields: AbortedFields,
): string;
export function writeProtocolBlock(
	_action: ProtocolAction,
	_fields: unknown,
): string {
	throw new Error("Not implemented");
}

export function parseProtocolBlock(
	_stdout: string,
): ParsedProtocolBlock | null {
	throw new Error("Not implemented");
}
