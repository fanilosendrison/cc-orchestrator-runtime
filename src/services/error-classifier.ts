export type ErrorCategory = "transient" | "permanent" | "abort" | "unknown";

export function classify(_err: unknown): ErrorCategory {
	throw new Error("Not implemented");
}
