import type { Phase } from "./types/phase";

export function definePhase<
	State extends object = object,
	Input = void,
	Output = void,
>(fn: Phase<State, Input, Output>): Phase<State, Input, Output> {
	return fn;
}
