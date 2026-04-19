import type { AgentDelegationRequest } from "../types/delegation";
import type {
	DelegationBinding,
	DelegationContext,
	DelegationManifest,
} from "./types";

export const agentBinding: DelegationBinding<AgentDelegationRequest> = {
	kind: "agent",
	buildManifest(
		_request: AgentDelegationRequest,
		_context: DelegationContext,
	): DelegationManifest {
		throw new Error("Not implemented");
	},
	buildProtocolBlock(
		_manifest: DelegationManifest,
		_manifestPath: string,
		_resumeCmd: string,
	): string {
		throw new Error("Not implemented");
	},
};
