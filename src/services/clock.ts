import type { Clock } from "../types/config";

export type { Clock };

export const clock: Clock = {
	nowWall: (): Date => {
		throw new Error("Not implemented");
	},
	nowWallIso: (): string => {
		throw new Error("Not implemented");
	},
	nowEpochMs: (): number => {
		throw new Error("Not implemented");
	},
	nowMono: (): number => {
		throw new Error("Not implemented");
	},
};
