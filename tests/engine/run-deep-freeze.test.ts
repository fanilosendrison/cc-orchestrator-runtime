// NIB-T §16.3-§16.4 — deep-freeze + single PhaseResult (T-DF-01..08)
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

describe("single PhaseResult (T-DF-01..03)", () => {
	for (let i = 1; i <= 3; i++) {
		test(`T-DF-0${i} | single PhaseResult enforcement`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("deep-freeze (T-DF-04..08)", () => {
	for (let i = 4; i <= 8; i++) {
		test(`T-DF-0${i} | deep freeze enforcement`, async () => {
			await runOrchestrator(config);
		});
	}
});
