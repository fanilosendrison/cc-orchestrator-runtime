import type { ZodError, ZodSchema } from "zod";

export type ValidationResult<T> =
	| { readonly ok: true; readonly data: T }
	| { readonly ok: false; readonly error: ZodError };

export function validateResult<T>(
	_rawJson: unknown,
	_schema: ZodSchema<T>,
): ValidationResult<T> {
	throw new Error("Not implemented");
}

export function summarizeZodError(_err: ZodError): string {
	throw new Error("Not implemented");
}
