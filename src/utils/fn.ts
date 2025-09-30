import { freqToPeriods } from "./constants";
import type { Frequency, Income, InterestBearing } from "./types";

export function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
}

export function updateById<T extends { id: string | number }>(
	setState: React.Dispatch<React.SetStateAction<T[]>>,
	id: string | number,
	field: keyof T,
	value: T[keyof T],
) {
	setState((prev) =>
		prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
	);
}

export function deleteById<T extends { id: string | number }>(
	setState: React.Dispatch<React.SetStateAction<T[]>>,
	id: string | number,
) {
	setState((prev) => prev.filter((item) => item.id !== id));
}

export function addArrayObject<T extends { id: number }>(
	setState: React.Dispatch<React.SetStateAction<T[]>>,
	newItem: Omit<T, "id">, // everything except id; we'll add it
) {
	setState((prev) => {
		// find max id
		const maxId =
			prev.length > 0 ? Math.max(...prev.map((item) => item.id)) : 0;
		const nextId = maxId + 1;

		// build full item with id
		const itemWithId = { ...newItem, id: nextId } as T;

		return [...prev, itemWithId];
	});
}

export function calculateTotalAnnual<
	T extends { amount: number; frequency: Frequency },
>(data: T[]): number {
	return data.reduce((prev, curr) => {
		switch (curr.frequency) {
			case "daily":
				return prev + curr.amount * 360;
			case "weekly":
				return prev + curr.amount * 52;
			case "biweekly":
				return prev + curr.amount * 26;
			case "monthly":
				return prev + curr.amount * 12;
			case "quarterly":
				return prev + curr.amount * 4;
			case "semiannually":
				return prev + curr.amount * 2;
			case "annually":
				return prev + curr.amount;
		}
	}, 0);
}

export function calculateTotalPrinciple(items: InterestBearing[]): number {
	return items.reduce((total, item) => total + item.principal, 0);
}

export function calculateTotalAnnualPayments(items: InterestBearing[]): number {
	return items.reduce((total, item) => {
		const periods = freqToPeriods[item.contributionFrequency];
		const annualPayment = item.contribution * periods;
		// Cap this debt’s payment at its remaining principal
		return total + Math.min(annualPayment, item.principal);
	}, 0);
}

export function calculateDebtToIncomeRatio(
	debts: InterestBearing[],
	incomes: Income[],
): number {
	const annualDebtPayments = calculateTotalAnnualPayments(debts);
	const annualIncome = incomes.reduce((total, income) => {
		const periods = freqToPeriods[income.frequency];
		return total + income.amount * periods;
	}, 0);

	return annualIncome > 0 ? annualDebtPayments / annualIncome : 0;
}
