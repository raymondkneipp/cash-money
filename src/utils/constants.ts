import type { Frequency } from "./types";

export const frequencyOptions = [
	"daily",
	"weekly",
	"biweekly",
	"monthly",
	"quarterly",
	"semiannually",
	"annually",
] as const;

export const freqToPeriods: Record<Frequency, number> = {
	daily: 360,
	weekly: 52,
	biweekly: 26,
	monthly: 12,
	quarterly: 4,
	semiannually: 2,
	annually: 1,
};
