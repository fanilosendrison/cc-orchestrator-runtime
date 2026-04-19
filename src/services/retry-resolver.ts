import type { OrchestratorError } from "../errors/base";
import type { RetryPolicy } from "../types/policies";

export {
	DEFAULT_BACKOFF_BASE_MS,
	DEFAULT_MAX_ATTEMPTS,
	DEFAULT_MAX_BACKOFF_MS,
} from "../constants";

export type { RetryPolicy };

export type RetryDecisionReason =
	| "transient_timeout"
	| "transient_schema"
	| "retry_exhausted"
	| "fatal_invalid_config"
	| "fatal_state_corrupted"
	| "fatal_state_missing"
	| "fatal_state_version_mismatch"
	| "fatal_delegation_missing_result"
	| "fatal_phase_error"
	| "fatal_protocol"
	| "fatal_aborted"
	| "fatal_run_locked"
	| "fatal_unknown";

export type RetryDecision =
	| { readonly retry: false; readonly reason: RetryDecisionReason }
	| {
			readonly retry: true;
			readonly delayMs: number;
			readonly reason: RetryDecisionReason;
	  };

export function resolveRetryDecision(
	_error: OrchestratorError | Error,
	_attempt: number,
	_policy: RetryPolicy,
): RetryDecision {
	throw new Error("Not implemented");
}
