import type { OrchestratorConfig } from "../types/config";

export async function runOrchestrator<State extends object>(
	_config: OrchestratorConfig<State>,
): Promise<void> {
	throw new Error("Not implemented");
}
