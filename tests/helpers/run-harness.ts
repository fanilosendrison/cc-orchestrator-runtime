import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { OrchestratorConfig } from "../../src/types/config";
import { createMockClock, type MockClock } from "./mock-clock";
import { createMockFs, type MockFs } from "./mock-fs";
import { createMockLogger, type MockLogger } from "./mock-logger";
import { createMockStdio, type MockStdio } from "./mock-stdio";

export interface RunHarness {
	readonly config: OrchestratorConfig<any>;
	readonly fs: MockFs;
	readonly clock: MockClock;
	readonly stdio: MockStdio;
	readonly logger: MockLogger;
	invokeInitial(args: readonly string[]): Promise<void>;
	invokeResume(runId: string): Promise<void>;
	simulateAgentResult(path: string, result: unknown): void;
	simulateSkillResult(path: string, result: unknown): void;
	simulateBatchResults(dir: string, jobsResults: Record<string, unknown>): void;
}

/**
 * Harness skeleton for multi-invocation scenarios. Concrete wiring of
 * invokeInitial / invokeResume requires the GREEN engine (process mocking +
 * argv injection). In RED these methods throw "Not implemented" — the tests
 * can still rely on the fs/clock/stdio/logger handles for setup.
 */
export function createRunHarness(config: OrchestratorConfig<any>): RunHarness {
	const fs = createMockFs();
	const clock = createMockClock();
	const stdio = createMockStdio();
	const logger = createMockLogger();

	const writeJson = (path: string, value: unknown): void => {
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, JSON.stringify(value), { encoding: "utf-8" });
	};

	return {
		config,
		fs,
		clock,
		stdio,
		logger,
		async invokeInitial(_args: readonly string[]): Promise<void> {
			throw new Error("Not implemented");
		},
		async invokeResume(_runId: string): Promise<void> {
			throw new Error("Not implemented");
		},
		simulateAgentResult(path: string, result: unknown): void {
			writeJson(path, result);
		},
		simulateSkillResult(path: string, result: unknown): void {
			writeJson(path, result);
		},
		simulateBatchResults(
			dir: string,
			jobsResults: Record<string, unknown>,
		): void {
			for (const [jobId, result] of Object.entries(jobsResults)) {
				writeJson(join(dir, `${jobId}.json`), result);
			}
		},
	};
}
