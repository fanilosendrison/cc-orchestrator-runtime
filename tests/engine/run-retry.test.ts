// NIB-T §18 — retry post-delegation (T-RT-01..10, P-RT-a/b/c)
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

describe("retry (T-RT-01..10)", () => {
	for (let i = 1; i <= 10; i++) {
		test(`T-RT-${String(i).padStart(2, "0")} | retry scenario`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("retry properties (P-RT-a..c)", () => {
	for (const letter of ["a", "b", "c"]) {
		test(`P-RT-${letter} | retry property`, async () => {
			await runOrchestrator(config);
		});
	}
});
