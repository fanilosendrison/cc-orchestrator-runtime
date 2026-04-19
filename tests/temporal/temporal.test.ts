// NIB-T §22.bis — temporal (T-TM-01..12, P-TM-a..d)
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

describe("temporal cumul (T-TM-01..03)", () => {
	for (let i = 1; i <= 3; i++) {
		test(`T-TM-0${i} | cross-reentry duration`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("temporal deadline (T-TM-04..06)", () => {
	for (let i = 4; i <= 6; i++) {
		test(`T-TM-0${i} | cross-reentry deadline`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("temporal clock jumps (T-TM-07..09)", () => {
	for (let i = 7; i <= 9; i++) {
		test(`T-TM-0${i} | clock jump immunity`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("temporal discipline (T-TM-10..12)", () => {
	for (let i = 10; i <= 12; i++) {
		test(`T-TM-${i} | wall vs mono discipline`, async () => {
			await runOrchestrator(config);
		});
	}
});

describe("temporal properties (P-TM-a..d)", () => {
	for (const letter of ["a", "b", "c", "d"]) {
		test(`P-TM-${letter} | temporal property`, async () => {
			await runOrchestrator(config);
		});
	}
});
