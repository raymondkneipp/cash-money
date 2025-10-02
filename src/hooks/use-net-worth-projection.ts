import { useMemo } from "react";
import { freqToPeriods } from "@/utils/constants";
import { useIncomes } from "./use-incomes";
import { useExpenses } from "./use-expenses";
import { useAssets } from "./use-assets";
import { MAX_AGE } from "@/constants";
import { useScenario } from "./use-scenario";
import { useDebts } from "./use-debts";

interface NetWorthData {
	age: number;
	netWorth: number;
	assets: number;
	debts: number;
	cashFlow: number;
}

// Calculate compound growth
function calculateCompoundGrowth(
	principal: number,
	rate: number,
	time: number,
	contribution: number,
	contributionFrequency: string,
): number {
	const periodsPerYear =
		freqToPeriods[contributionFrequency as keyof typeof freqToPeriods] || 12;
	const periods = time * periodsPerYear;
	const periodicRate = rate / 100 / periodsPerYear;

	if (periodicRate <= 0) {
		return principal + contribution * periods;
	}

	// Future value of principal + future value of annuity
	const fvPrincipal = principal * Math.pow(1 + periodicRate, periods);
	const fvAnnuity =
		contribution * ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate);

	return fvPrincipal + fvAnnuity;
}

// Calculate debt payoff time and remaining balance
function calculateDebtPayoff(
	principal: number,
	interestRate: number,
	payment: number,
	frequency: string,
): { payoffTime: number; totalPaid: number } {
	const periodsPerYear =
		freqToPeriods[frequency as keyof typeof freqToPeriods] || 12;
	const monthlyRate = interestRate / 100 / periodsPerYear;

	if (monthlyRate <= 0) {
		// No interest, simple calculation
		const payoffTime = Math.ceil(principal / payment);
		return { payoffTime, totalPaid: principal };
	}

	// Calculate using loan formula
	const payoffTime = Math.ceil(
		-Math.log(1 - (principal * monthlyRate) / payment) /
			Math.log(1 + monthlyRate),
	);

	const totalPaid = payment * payoffTime;
	return { payoffTime, totalPaid };
}

export function useNetWorthProjection() {
	const { currentScenario } = useScenario();
	const { totalAnnualIncome } = useIncomes();
	const { totalAnnualExpense } = useExpenses();
	const { debts } = useDebts();
	const { assets } = useAssets();

	const chartData = useMemo((): NetWorthData[] => {
		if (!currentScenario || !debts || !assets) return [];

		const startAge = currentScenario.age;
		const endAge = MAX_AGE;
		const data: NetWorthData[] = [];

		// Track debt payoff status for each debt
		const debtStatus = debts.map((debt) => ({
			...debt,
			remainingBalance: debt.principal,
			payoffTime: 0,
			isPaidOff: false,
		}));

		// Calculate payoff times for all debts
		debtStatus.forEach((debt) => {
			const { payoffTime } = calculateDebtPayoff(
				debt.remainingBalance,
				debt.interestRate,
				debt.minimumPayment,
				debt.frequency,
			);
			debt.payoffTime = payoffTime;
		});

		// Calculate annual cash flow
		const annualCashFlow = totalAnnualIncome - totalAnnualExpense;

		// Project year by year
		for (let age = startAge; age <= endAge; age++) {
			const year = age - startAge;

			// Update asset values with growth and contributions
			let totalAssetsValue = 0;
			assets.forEach((asset) => {
				const assetValue = calculateCompoundGrowth(
					asset.value,
					asset.growthRate,
					year,
					asset.contribution,
					asset.frequency,
				);
				totalAssetsValue += assetValue;
			});

			// Update debt balances
			let totalDebtValue = 0;
			let freedCashFlow = 0;

			debtStatus.forEach((debt) => {
				if (!debt.isPaidOff) {
					const periodsPerYear =
						freqToPeriods[debt.frequency as keyof typeof freqToPeriods] || 12;
					const yearsToPayoff = debt.payoffTime / periodsPerYear;

					if (year >= yearsToPayoff) {
						// Debt is paid off
						debt.isPaidOff = true;
						debt.remainingBalance = 0;
						// Add the debt payment to freed cash flow
						freedCashFlow += debt.minimumPayment * periodsPerYear;
					} else {
						// Calculate remaining balance
						const monthlyRate = debt.interestRate / 100 / periodsPerYear;
						const periods = year * periodsPerYear;

						if (monthlyRate > 0) {
							debt.remainingBalance =
								debt.principal * Math.pow(1 + monthlyRate, periods) -
								debt.minimumPayment *
									((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);
						} else {
							debt.remainingBalance = Math.max(
								0,
								debt.principal - debt.minimumPayment * periods,
							);
						}
					}

					totalDebtValue += Math.max(0, debt.remainingBalance);
				}
			});

			// Calculate net worth
			const netWorth = totalAssetsValue - totalDebtValue;

			// Calculate available cash flow (income - expenses - remaining debt payments + freed cash flow)
			const remainingDebtPayments = debtStatus
				.filter((debt) => !debt.isPaidOff)
				.reduce((sum, debt) => {
					const periods =
						freqToPeriods[debt.frequency as keyof typeof freqToPeriods] || 12;
					return sum + debt.minimumPayment * periods;
				}, 0);

			const availableCashFlow =
				annualCashFlow - remainingDebtPayments + freedCashFlow;

			data.push({
				age,
				netWorth,
				assets: totalAssetsValue,
				debts: totalDebtValue,
				cashFlow: availableCashFlow,
			});
		}

		return data;
	}, [currentScenario, totalAnnualIncome, totalAnnualExpense, debts, assets]);

	const finalNetWorth = chartData[chartData.length - 1]?.netWorth || 0;
	const initialNetWorth = chartData[0]?.netWorth || 0;
	const netWorthGrowth = finalNetWorth - initialNetWorth;
	const growthPercentage =
		initialNetWorth > 0 ? (netWorthGrowth / initialNetWorth) * 100 : 0;

	return {
		chartData,
		finalNetWorth,
		initialNetWorth,
		netWorthGrowth,
		growthPercentage,
	};
}
