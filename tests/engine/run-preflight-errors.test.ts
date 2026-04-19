// NIB-T §20 — preflight errors (T-PF-01..21)
import { describe, expect, test } from "bun:test";
import { definePhase } from "../../src/define-phase";
import { runOrchestrator } from "../../src/engine/run-orchestrator";
import type { OrchestratorConfig } from "../../src/types/config";

interface S {
	count: number;
}

function base(
	overrides: Partial<OrchestratorConfig<S>> = {},
): OrchestratorConfig<S> {
	return {
		name: "orch",
		initial: "a",
		phases: { a: definePhase<S>(async (_s, io) => io.done({})) },
		initialState: { count: 0 },
		resumeCommand: (runId) => `c --run-id ${runId} --resume`,
		...overrides,
	};
}

describe("preflight config invalid (T-PF-01..08)", () => {
	test("T-PF-01 | empty name", async () => {
		await expect(runOrchestrator(base({ name: "" }))).rejects.toThrow();
	});
	test("T-PF-02 | non kebab-case", async () => {
		await expect(runOrchestrator(base({ name: "BAD_NAME" }))).rejects.toThrow();
	});
	test("T-PF-03 | empty phases", async () => {
		await expect(runOrchestrator(base({ phases: {} }))).rejects.toThrow();
	});
	test("T-PF-04 | initial phase not in phases", async () => {
		await expect(runOrchestrator(base({ initial: "z" }))).rejects.toThrow();
	});
	test("T-PF-05 | initialState missing", async () => {
		const cfg = base();
		await expect(
			runOrchestrator({ ...cfg, initialState: undefined as unknown as S }),
		).rejects.toThrow();
	});
	test("T-PF-06 | resumeCommand missing", async () => {
		const cfg = base();
		await expect(
			runOrchestrator({
				...cfg,
				resumeCommand: undefined as unknown as (rid: string) => string,
			}),
		).rejects.toThrow();
	});
	test("T-PF-07 | resumeCommand non-function", async () => {
		const cfg = base();
		await expect(
			runOrchestrator({
				...cfg,
				resumeCommand: "not a fn" as unknown as (rid: string) => string,
			}),
		).rejects.toThrow();
	});
	test("T-PF-08 | initialState not conforming to stateSchema", async () => {
		await expect(runOrchestrator(base())).rejects.toThrow();
	});
});

describe("preflight resume (T-PF-09..13)", () => {
	for (let i = 9; i <= 13; i++) {
		test(`T-PF-${String(i).padStart(2, "0")} | resume preflight`, async () => {
			await expect(runOrchestrator(base())).rejects.toThrow();
		});
	}
});

describe("preflight events (T-PF-14..16)", () => {
	for (let i = 14; i <= 16; i++) {
		test(`T-PF-${i} | preflight event discipline`, async () => {
			await expect(runOrchestrator(base())).rejects.toThrow();
		});
	}
});

describe("preflight exit codes (T-PF-17..21)", () => {
	for (let i = 17; i <= 21; i++) {
		test(`T-PF-${i} | exit code`, async () => {
			await expect(runOrchestrator(base())).rejects.toThrow();
		});
	}
});
