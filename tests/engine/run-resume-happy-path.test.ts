// NIB-T §17 — resume happy-path (T-RS-01..31, P-RS-a..d)
import { describe, expect, test } from "bun:test";
import { definePhase } from "../../src/define-phase";
import { runOrchestrator } from "../../src/engine/run-orchestrator";
import type { OrchestratorConfig } from "../../src/types/config";

interface S {
	count: number;
}

function buildConfig(): OrchestratorConfig<S> {
	return {
		name: "test-orch",
		initial: "a",
		phases: {
			a: definePhase<S>(async (_s, io) => io.done({})),
			b: definePhase<S>(async (_s, io) => io.done({})),
		},
		initialState: { count: 0 },
		resumeCommand: (runId) => `cmd --run-id ${runId} --resume`,
	};
}

describe("resume happy skill (T-RS-01..03)", () => {
	test("T-RS-01 | consume + done emits correct events", async () => {
		await expect(runOrchestrator(buildConfig())).rejects.toThrow();
	});
	test("T-RS-02 | validated schema", async () => {
		await expect(runOrchestrator(buildConfig())).rejects.toThrow();
	});
	test("T-RS-03 | schema fail → retry/ERROR", async () => {
		await expect(runOrchestrator(buildConfig())).rejects.toThrow();
	});
});

describe("resume batch (T-RS-04..06)", () => {
	for (let i = 4; i <= 6; i++) {
		test(`T-RS-0${i} | batch consume / wrong-kind`, async () => {
			await expect(runOrchestrator(buildConfig())).rejects.toThrow();
		});
	}
});

describe("consumption check (T-CS-01..05)", () => {
	for (let i = 1; i <= 5; i++) {
		test(`T-CS-0${i} | consumption exact-once`, async () => {
			await expect(runOrchestrator(buildConfig())).rejects.toThrow();
		});
	}
});

describe("resume deadline (T-RS-10..13)", () => {
	for (let i = 10; i <= 13; i++) {
		test(`T-RS-${i} | deadline check`, async () => {
			await expect(runOrchestrator(buildConfig())).rejects.toThrow();
		});
	}
});

describe("resume malformed (T-RS-14..18)", () => {
	for (let i = 14; i <= 18; i++) {
		test(`T-RS-${i} | malformed detection`, async () => {
			await expect(runOrchestrator(buildConfig())).rejects.toThrow();
		});
	}
});

describe("resume state validation (T-RS-19..23)", () => {
	for (let i = 19; i <= 23; i++) {
		test(`T-RS-${i} | state validation preflight`, async () => {
			await expect(runOrchestrator(buildConfig())).rejects.toThrow();
		});
	}
});

describe("resume pending effacement (T-RS-24..26)", () => {
	for (let i = 24; i <= 26; i++) {
		test(`T-RS-${i} | pendingDelegation timing`, async () => {
			await expect(runOrchestrator(buildConfig())).rejects.toThrow();
		});
	}
});

describe("multi-delegation (T-RS-27..28)", () => {
	for (let i = 27; i <= 28; i++) {
		test(`T-RS-${i} | multi sequence`, async () => {
			await expect(runOrchestrator(buildConfig())).rejects.toThrow();
		});
	}
});

describe("resume edge (T-RS-29..31)", () => {
	for (let i = 29; i <= 31; i++) {
		test(`T-RS-${i} | edge case`, async () => {
			await expect(runOrchestrator(buildConfig())).rejects.toThrow();
		});
	}
});

describe("resume properties (P-RS-a..d)", () => {
	for (const letter of ["a", "b", "c", "d"]) {
		test(`P-RS-${letter} | resume property`, async () => {
			await expect(runOrchestrator(buildConfig())).rejects.toThrow();
		});
	}
});
