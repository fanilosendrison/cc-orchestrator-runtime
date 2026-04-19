// NIB-T §22 — composition récursive (T-CP-01..03, P-CP-a/b)
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

describe("composition recursive (T-CP-01..03)", () => {
	for (let i = 1; i <= 3; i++) {
		test(`T-CP-0${i} | composition`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("composition properties (P-CP-a/b)", () => {
	for (const letter of ["a", "b"]) {
		test(`P-CP-${letter} | composition property`, async () => {
			await runOrchestrator(config);
		});
	}
});
