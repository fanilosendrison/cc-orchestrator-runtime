import type { SkillDelegationRequest } from "../types/delegation";
import type {
	DelegationBinding,
	DelegationContext,
	DelegationManifest,
} from "./types";

export const skillBinding: DelegationBinding<SkillDelegationRequest> = {
	kind: "skill",
	buildManifest(
		_request: SkillDelegationRequest,
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
