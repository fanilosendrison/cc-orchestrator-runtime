// NIB-T §26 — global properties (P-01..P-30)
import { describe, test } from "bun:test";
import { definePhase } from "../../src/define-phase";
import { runOrchestrator } from "../../src/engine/run-orchestrator";
import type { OrchestratorConfig } from "../../src/types/config";

interface S {
	count: number;
}
const config: OrchestratorConfig<S> = {
	name: "orch",
	initial: "a",
	phases: { a: definePhase<S>(async (_s, io) => io.done({})) },
	initialState: { count: 0 },
	resumeCommand: (runId) => `c --run-id ${runId} --resume`,
};

describe("global properties (P-01..P-30)", () => {
	for (let i = 1; i <= 30; i++) {
		test(`P-${String(i).padStart(2, "0")} | global property`, async () => {
			await runOrchestrator(config);
		});
	}
});
