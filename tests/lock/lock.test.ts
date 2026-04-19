// NIB-T §11 — lock (T-LK-01..20, P-LK-a..d)
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { RunLockedError } from "../../src/errors/concrete";
import {
	acquireLock,
	DEFAULT_IDLE_LEASE_MS,
	refreshLock,
	releaseLock,
} from "../../src/services/lock";
import type { Clock } from "../../src/types/config";
import { createMockClock } from "../helpers/mock-clock";
import { createMockLogger } from "../helpers/mock-logger";
import { cleanupTempDir, makeTempDir } from "../helpers/temp-run-dir";

const RUN_ID = "01HX0000000000000000000001";

function lockPath(dir: string): string {
	return join(dir, ".lock");
}

function setupDir(): {
	dir: string;
	lp: string;
	clock: Clock;
	logger: ReturnType<typeof createMockLogger>;
	cleanup: () => void;
} {
	const dir = makeTempDir();
	const logger = createMockLogger();
	const clock = createMockClock("2026-04-19T12:00:00.000Z", 1_000_000, 0);
	return {
		dir,
		lp: lockPath(dir),
		clock,
		logger,
		cleanup: () => cleanupTempDir(dir),
	};
}

describe("acquireLock (T-LK-01..05)", () => {
	test("T-LK-01 | fresh acquire writes lock file", () => {
		const ctx = setupDir();
		try {
			const handle = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			expect(handle.ownerToken).toBeTruthy();
			expect(existsSync(ctx.lp)).toBe(true);
			const data = JSON.parse(readFileSync(ctx.lp, "utf-8"));
			expect(data.ownerPid).toBe(process.pid);
			expect(data.leaseUntilEpochMs).toBe(1_000_000 + DEFAULT_IDLE_LEASE_MS);
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-02 | active lock → RunLockedError", () => {
		const ctx = setupDir();
		try {
			writeFileSync(
				ctx.lp,
				JSON.stringify({
					ownerPid: 99,
					ownerToken: "01HXOWNER00000000000000000",
					acquiredAtEpochMs: 1_000_000,
					leaseUntilEpochMs: 1_000_000 + DEFAULT_IDLE_LEASE_MS,
				}),
			);
			expect(() => acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID)).toThrow(
				RunLockedError,
			);
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-03 | expired lock → override + lock_conflict event", () => {
		const ctx = setupDir();
		try {
			writeFileSync(
				ctx.lp,
				JSON.stringify({
					ownerPid: 99,
					ownerToken: "01HXEXPIRED0000000000000000",
					acquiredAtEpochMs: 0,
					leaseUntilEpochMs: 1,
				}),
			);
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			const ev = ctx.logger.find("lock_conflict");
			expect(ev).toBeDefined();
			if (ev !== undefined && ev.eventType === "lock_conflict") {
				expect(ev.reason).toBe("expired_override");
			}
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-04 | edge lease (now === leaseUntil) considered active", () => {
		const ctx = setupDir();
		try {
			writeFileSync(
				ctx.lp,
				JSON.stringify({
					ownerPid: 99,
					ownerToken: "01HXEDGE0000000000000000000",
					acquiredAtEpochMs: 500_000,
					leaseUntilEpochMs: 1_000_000,
				}),
			);
			expect(() => acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID)).toThrow(
				RunLockedError,
			);
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-05 | O_EXCL concurrency : second fails", () => {
		const ctx = setupDir();
		try {
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			expect(() => acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID)).toThrow(
				RunLockedError,
			);
		} finally {
			ctx.cleanup();
		}
	});
});

describe("refreshLock (T-LK-06..08)", () => {
	test("T-LK-06 | owned → update lease", () => {
		const ctx = setupDir();
		try {
			const h = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			(ctx.clock as ReturnType<typeof createMockClock>).advanceEpoch(1000);
			refreshLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
			const data = JSON.parse(readFileSync(ctx.lp, "utf-8"));
			expect(data.leaseUntilEpochMs).toBe(1_001_000 + DEFAULT_IDLE_LEASE_MS);
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-07 | token mismatch → event + no-op", () => {
		const ctx = setupDir();
		try {
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			ctx.logger.reset();
			refreshLock(
				ctx.lp,
				{ ownerToken: "WRONG", lockPath: ctx.lp },
				ctx.clock,
				ctx.logger,
				RUN_ID,
			);
			const ev = ctx.logger.find("lock_conflict");
			expect(ev).toBeDefined();
			if (ev !== undefined && ev.eventType === "lock_conflict") {
				expect(ev.reason).toBe("stolen_at_release");
			}
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-08 | multiple refresh idempotent", () => {
		const ctx = setupDir();
		try {
			const h = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			for (let i = 0; i < 10; i++) {
				refreshLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
			}
			const data = JSON.parse(readFileSync(ctx.lp, "utf-8"));
			expect(data.ownerToken).toBe(h.ownerToken);
		} finally {
			ctx.cleanup();
		}
	});
});

describe("releaseLock (T-LK-09..11)", () => {
	test("T-LK-09 | owned → unlink", () => {
		const ctx = setupDir();
		try {
			const h = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			releaseLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
			expect(existsSync(ctx.lp)).toBe(false);
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-10 | token mismatch → event + skip unlink", () => {
		const ctx = setupDir();
		try {
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			ctx.logger.reset();
			releaseLock(
				ctx.lp,
				{ ownerToken: "WRONG", lockPath: ctx.lp },
				ctx.clock,
				ctx.logger,
				RUN_ID,
			);
			expect(existsSync(ctx.lp)).toBe(true);
			expect(ctx.logger.find("lock_conflict")).toBeDefined();
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-11 | ENOENT silent no-op", () => {
		const ctx = setupDir();
		try {
			expect(() =>
				releaseLock(
					ctx.lp,
					{ ownerToken: "X", lockPath: ctx.lp },
					ctx.clock,
					ctx.logger,
					RUN_ID,
				),
			).not.toThrow();
		} finally {
			ctx.cleanup();
		}
	});
});

describe("lock events discipline (T-LK-12..16)", () => {
	test("T-LK-12 | fresh acquire emits no event", () => {
		const ctx = setupDir();
		try {
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			expect(ctx.logger.find("lock_conflict")).toBeUndefined();
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-13 | expired override → lock_conflict expired_override", () => {
		const ctx = setupDir();
		try {
			writeFileSync(
				ctx.lp,
				JSON.stringify({
					ownerPid: 99,
					ownerToken: "EXPIRED",
					acquiredAtEpochMs: 0,
					leaseUntilEpochMs: 1,
				}),
			);
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			const ev = ctx.logger.find("lock_conflict");
			expect(ev).toBeDefined();
			if (ev !== undefined && ev.eventType === "lock_conflict") {
				expect(ev.reason).toBe("expired_override");
			}
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-14 | refresh emits no event on success", () => {
		const ctx = setupDir();
		try {
			const h = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			ctx.logger.reset();
			refreshLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
			expect(ctx.logger.find("lock_conflict")).toBeUndefined();
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-15 | release emits no event on success", () => {
		const ctx = setupDir();
		try {
			const h = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			ctx.logger.reset();
			releaseLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
			expect(ctx.logger.find("lock_conflict")).toBeUndefined();
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-16 | release with mismatch → stolen_at_release", () => {
		const ctx = setupDir();
		try {
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			ctx.logger.reset();
			releaseLock(
				ctx.lp,
				{ ownerToken: "X", lockPath: ctx.lp },
				ctx.clock,
				ctx.logger,
				RUN_ID,
			);
			const ev = ctx.logger.find("lock_conflict");
			expect(ev).toBeDefined();
			if (ev !== undefined && ev.eventType === "lock_conflict") {
				expect(ev.reason).toBe("stolen_at_release");
			}
		} finally {
			ctx.cleanup();
		}
	});
});

describe("lock SIGKILL crash recovery (T-LK-17..18)", () => {
	test("T-LK-17 | after 31 min successor overrides", () => {
		const ctx = setupDir();
		try {
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			(ctx.clock as ReturnType<typeof createMockClock>).advanceEpoch(
				31 * 60 * 1000,
			);
			ctx.logger.reset();
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			expect(ctx.logger.find("lock_conflict")).toBeDefined();
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-18 | after 29 min active lease → RunLockedError", () => {
		const ctx = setupDir();
		try {
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			(ctx.clock as ReturnType<typeof createMockClock>).advanceEpoch(
				29 * 60 * 1000,
			);
			expect(() => acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID)).toThrow(
				RunLockedError,
			);
		} finally {
			ctx.cleanup();
		}
	});
});

describe("lock refresh from phase (T-LK-19..20)", () => {
	test("T-LK-19 | long phase refreshes lock over 40 min", () => {
		const ctx = setupDir();
		try {
			const h = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			for (let i = 0; i < 4; i++) {
				(ctx.clock as ReturnType<typeof createMockClock>).advanceEpoch(
					10 * 60 * 1000,
				);
				refreshLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
			}
			expect(existsSync(ctx.lp)).toBe(true);
		} finally {
			ctx.cleanup();
		}
	});
	test("T-LK-20 | 10 fast refreshes no cumulative effect", () => {
		const ctx = setupDir();
		try {
			const h = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			for (let i = 0; i < 10; i++) {
				refreshLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
			}
			const data = JSON.parse(readFileSync(ctx.lp, "utf-8"));
			expect(data.leaseUntilEpochMs).toBe(1_000_000 + DEFAULT_IDLE_LEASE_MS);
		} finally {
			ctx.cleanup();
		}
	});
});

describe("lock properties (P-LK-a..d)", () => {
	test("P-LK-a | acquire+release leaves FS clean", () => {
		const ctx = setupDir();
		try {
			const h = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			releaseLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
			expect(existsSync(ctx.lp)).toBe(false);
			expect(existsSync(`${ctx.lp}.tmp`)).toBe(false);
		} finally {
			ctx.cleanup();
		}
	});
	test("P-LK-b | refresh on non-owned never modifies", () => {
		const ctx = setupDir();
		try {
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			const before = readFileSync(ctx.lp, "utf-8");
			refreshLock(
				ctx.lp,
				{ ownerToken: "WRONG", lockPath: ctx.lp },
				ctx.clock,
				ctx.logger,
				RUN_ID,
			);
			const after = readFileSync(ctx.lp, "utf-8");
			expect(after).toBe(before);
		} finally {
			ctx.cleanup();
		}
	});
	test("P-LK-c | mutex: only one acquire succeeds among N", () => {
		const ctx = setupDir();
		try {
			let successes = 0;
			acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
			successes++;
			for (let i = 0; i < 9; i++) {
				try {
					acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
					successes++;
				} catch {
					// expected
				}
			}
			expect(successes).toBe(1);
		} finally {
			ctx.cleanup();
		}
	});
	test("P-LK-d | acquire → N refresh → release clean", () => {
		for (const n of [0, 1, 5, 100]) {
			const ctx = setupDir();
			try {
				const h = acquireLock(ctx.lp, ctx.clock, ctx.logger, RUN_ID);
				for (let i = 0; i < n; i++) {
					refreshLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
				}
				releaseLock(ctx.lp, h, ctx.clock, ctx.logger, RUN_ID);
				expect(existsSync(ctx.lp)).toBe(false);
			} finally {
				ctx.cleanup();
			}
		}
	});
});
