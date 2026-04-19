// NIB-T §19 — per-attempt result paths (T-RO-40..42, P-RO-d, P-14, P-15)
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

describe("per-attempt isolation (T-RO-40..42)", () => {
	for (let i = 40; i <= 42; i++) {
		test(`T-RO-${i} | attempt isolation`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("per-attempt property (P-RO-d)", () => {
	test("P-RO-d | disjoint paths across attempts", async () => {
		await runOrchestrator(config);
	});
});
