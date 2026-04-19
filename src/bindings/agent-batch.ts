import type { AgentBatchDelegationRequest } from "../types/delegation";
import type {
	DelegationBinding,
	DelegationContext,
	DelegationManifest,
} from "./types";

export const agentBatchBinding: DelegationBinding<AgentBatchDelegationRequest> =
	{
		kind: "agent-batch",
		buildManifest(
			_request: AgentBatchDelegationRequest,
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
