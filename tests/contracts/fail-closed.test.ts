// NIB-T §27.7-§27.9 — fail-closed (C-FC-01..12)
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

describe("fail-closed invariants (C-FC-01..12)", () => {
	for (let i = 1; i <= 12; i++) {
		test(`C-FC-${String(i).padStart(2, "0")} | fail-closed invariant`, async () => {
			await runOrchestrator(config);
		});
	}
});
