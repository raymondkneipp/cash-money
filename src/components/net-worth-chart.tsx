import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useMemo } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { useScenarioManager } from "./header";
import { useIncomes } from "./incomes";
import { useExpenses } from "./expenses";
import { useDebts } from "./debts";
import { useAssets } from "./assets";
import { formatCurrency } from "@/utils/fn";
import { freqToPeriods } from "@/utils/constants";

// Format currency in shorter form (100K, 1M, etc.)
function formatCurrencyShort(value: number): string {
	const absValue = Math.abs(value);

	if (absValue >= 1_000_000) {
		return (value / 1_000_000).toFixed(1) + "M";
	} else if (absValue >= 1_000) {
		return (value / 1_000).toFixed(0) + "K";
	} else {
		return value.toFixed(0);
	}
}

export const description = "Net worth projection from current age to 100";

const MAX_AGE = 65;

interface NetWorthData {
	age: number;
	netWorth: number;
	assets: number;
	debts: number;
	cashFlow: number;
}

const chartConfig = {
	netWorth: {
		label: "Net Worth",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

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

export function useNetWorthProjection() {
	const { currentScenario } = useScenarioManager();
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

export function NetWorthChart(props: { className?: string }) {
	const { chartData, netWorthGrowth, growthPercentage } =
		useNetWorthProjection();
	const { currentScenario } = useScenarioManager();

	return (
		<Card className={props.className}>
			<CardHeader>
				<CardTitle>Net Worth Projection</CardTitle>
				<CardDescription>
					Projected net worth from age {currentScenario?.age || 0} to {MAX_AGE}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={chartData}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="age"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => value.toString()}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => formatCurrencyShort(value)}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									indicator="line"
									formatter={(value, name, props) => [
										formatCurrency(Number(value)),
										name === "netWorth"
											? ` Net Worth (Age ${props?.payload?.age})`
											: name,
									]}
									labelFormatter={(value) => `Age ${value}`}
								/>
							}
						/>
						<Area
							dataKey="netWorth"
							type="natural"
							fill="var(--color-netWorth)"
							fillOpacity={0.4}
							stroke="var(--color-netWorth)"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
			<CardFooter>
				<div className="flex w-full items-start gap-2 text-sm">
					<div className="grid gap-2">
						<div className="flex items-center gap-2 leading-none font-medium">
							{netWorthGrowth >= 0 ? (
								<>
									Net worth grows by {formatCurrency(netWorthGrowth)} (
									{growthPercentage.toFixed(1)}%)
									<TrendingUp className="h-4 w-4" />
								</>
							) : (
								<>
									Net worth decreases by{" "}
									{formatCurrency(Math.abs(netWorthGrowth))} (
									{Math.abs(growthPercentage).toFixed(1)}%)
									<TrendingUp className="h-4 w-4 rotate-180" />
								</>
							)}
						</div>
						<div className="text-muted-foreground flex items-center gap-2 leading-none">
							Age {currentScenario?.age || 0} - {MAX_AGE}
						</div>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}
