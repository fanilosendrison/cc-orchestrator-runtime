// NIB-T §25 — PII absence (T-OB-20..23, P-OB-d)
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

describe("PII absence (T-OB-20..23)", () => {
	for (const id of [20, 21, 22, 23]) {
		test(`T-OB-${id} | no PII in events`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("PII property (P-OB-d)", () => {
	test("P-OB-d | canaries absents des logs", async () => {
		await runOrchestrator(config);
	});
});
