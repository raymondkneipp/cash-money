import type { frequencyOptions } from "./constants";

export type Frequency = (typeof frequencyOptions)[number];

export type Income = {
	id: number;
	name: string;
	amount: number;
	frequency: Frequency;
};

export type Expense = Income;

export type InterestBearing = {
	id: number;
	name: string;
	principal: number;
	rate: number;
	compound: Frequency;
	contribution: number;
	contributionFrequency: Frequency;
};
