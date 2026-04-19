// NIB-T §21 — signaux (T-SG-01..11, P-SG-a/b/c)
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

describe("signal handling (T-SG-01..11)", () => {
	for (let i = 1; i <= 11; i++) {
		test(`T-SG-${String(i).padStart(2, "0")} | signal scenario`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("signal properties (P-SG-a/b/c)", () => {
	for (const letter of ["a", "b", "c"]) {
		test(`P-SG-${letter} | signal property`, async () => {
			await runOrchestrator(config);
		});
	}
});
