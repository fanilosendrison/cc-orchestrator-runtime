import type { RetryPolicy, TimeoutPolicy } from "./policies";

export type DelegationRequest =
	| SkillDelegationRequest
	| AgentDelegationRequest
	| AgentBatchDelegationRequest;

export interface SkillDelegationRequest {
	readonly kind: "skill";
	readonly skill: string;
	readonly args?: Record<string, unknown>;
	readonly label: string;
	readonly retry?: RetryPolicy;
	readonly timeout?: TimeoutPolicy;
}

export interface AgentDelegationRequest {
	readonly kind: "agent";
	readonly agentType: string;
	readonly prompt: string;
	readonly label: string;
	readonly retry?: RetryPolicy;
	readonly timeout?: TimeoutPolicy;
}

export interface AgentBatchDelegationRequest {
	readonly kind: "agent-batch";
	readonly agentType: string;
	readonly jobs: ReadonlyArray<{
		readonly id: string;
		readonly prompt: string;
	}>;
	readonly label: string;
	readonly retry?: RetryPolicy;
	readonly timeout?: TimeoutPolicy;
}
