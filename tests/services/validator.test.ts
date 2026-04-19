// NIB-T §5 — validator (T-VA-01..10, P-VA-a/b/c)
import { describe, expect, test } from "bun:test";
import { z } from "zod";
import {
	summarizeZodError,
	validateResult,
} from "../../src/services/validator";

const schema = z.object({ foo: z.string(), bar: z.number() });

describe("validateResult success (T-VA-01..02)", () => {
	test("T-VA-01 | valid object", () => {
		const r = validateResult({ foo: "a", bar: 1 }, schema);
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.data).toEqual({ foo: "a", bar: 1 });
	});
	test("T-VA-02 | valid edge values", () => {
		const r = validateResult({ foo: "", bar: 0 }, schema);
		expect(r.ok).toBe(true);
	});
});

describe("validateResult failures (T-VA-03..07)", () => {
	test("T-VA-03 | wrong type foo", () => {
		const r = validateResult({ foo: 1, bar: 1 }, schema);
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.error.issues.some((i) => i.path.includes("foo"))).toBe(true);
		}
	});
	test("T-VA-04 | missing bar", () => {
		const r = validateResult({ foo: "a" }, schema);
		expect(r.ok).toBe(false);
	});
	test("T-VA-05 | null input", () => {
		const r = validateResult(null, schema);
		expect(r.ok).toBe(false);
	});
	test("T-VA-06 | plain string", () => {
		const r = validateResult("plain string", schema);
		expect(r.ok).toBe(false);
	});
	test("T-VA-07 | array input", () => {
		const r = validateResult([], schema);
		expect(r.ok).toBe(false);
	});
});

describe("summarizeZodError (T-VA-08..10)", () => {
	test("T-VA-08 | single field path+code ≤ 200", () => {
		const r = validateResult({ foo: 1, bar: 1 }, schema);
		if (!r.ok) {
			const summary = summarizeZodError(r.error);
			expect(summary.length).toBeLessThanOrEqual(200);
			expect(summary).toContain("foo");
		}
	});
	test("T-VA-09 | many fields truncated with ellipsis", () => {
		const bigSchema = z.object(
			Object.fromEntries(
				Array.from({ length: 50 }, (_, i) => [`f${i}`, z.string()]),
			),
		);
		const r = validateResult({}, bigSchema);
		if (!r.ok) {
			const summary = summarizeZodError(r.error);
			expect(summary.length).toBeLessThanOrEqual(200);
			expect(summary).toContain("…");
		}
	});
	test("T-VA-10 | root issue starts with 'root: '", () => {
		const r = validateResult(null, schema);
		if (!r.ok) {
			const summary = summarizeZodError(r.error);
			expect(summary.startsWith("root: ")).toBe(true);
		}
	});
});

describe("validator properties (P-VA-a..c)", () => {
	test("P-VA-a | validateResult pure", () => {
		const input = { foo: "x", bar: 2 };
		const a = validateResult(input, schema);
		const b = validateResult(input, schema);
		expect(a).toEqual(b);
	});
	test("P-VA-b | summary ≤ 200 chars (fuzz 50 errors)", () => {
		for (let i = 0; i < 50; i++) {
			const fakeSchema = z.object(
				Object.fromEntries(
					Array.from({ length: i + 1 }, (_, j) => [`k${j}`, z.string()]),
				),
			);
			const r = validateResult({}, fakeSchema);
			if (!r.ok) {
				expect(summarizeZodError(r.error).length).toBeLessThanOrEqual(200);
			}
		}
	});
	test("P-VA-c | ok ⇒ data re-validates", () => {
		const r = validateResult({ foo: "a", bar: 1 }, schema);
		if (r.ok) {
			const again = schema.safeParse(r.data);
			expect(again.success).toBe(true);
		}
	});
});
