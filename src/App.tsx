import { useEffect } from "react";
import { formatCurrency } from "@/utils/fn";
import { Incomes, useIncomes } from "@/components/incomes";
import { Expenses, useExpenses } from "@/components/expenses";
import { Debts, useDebts } from "@/components/debts";
import { Assets, useAssets } from "@/components/assets";
import { Header } from "./components/header";
import { initSettings } from "./db/settings";
import {
	AlertCircleIcon,
	BanknoteArrowUpIcon,
	CreditCardIcon,
	DollarSignIcon,
	PercentIcon,
	PieChartIcon,
	RefreshCwIcon,
	ShoppingCartIcon,
	TrendingUpIcon,
	TriangleAlert,
} from "lucide-react";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TooltipPopover } from "./components/ui/tooltip-popover";
import { cn } from "./lib/utils";

function Stat(props: {
	icon: React.JSX.ElementType;
	title: string;
	value: string;
	action?: React.ReactNode;
	bg: `bg-${string}-${number} dark:bg-${string}-${number}/50`;
}) {
	return (
		<Card>
			<CardHeader>
				<div
					className={cn(
						"size-12 rounded-md flex items-center justify-center mb-2",
						props.bg,
					)}
				>
					<props.icon />
				</div>
				<CardTitle className="font-mono text-2xl">{props.value}</CardTitle>
				<CardDescription>{props.title}</CardDescription>
				{props.action && <CardAction>{props.action}</CardAction>}
			</CardHeader>
		</Card>
	);
}

function App() {
	const { totalAnnualIncome } = useIncomes();
	const { totalAnnualExpense } = useExpenses();
	const {
		totalAnnualDebtPayments,
		totalOutstanding,
		averageInterestRate,
		dtiRatio,
	} = useDebts();
	const { totalAssets, totalAnnualContributions } = useAssets();

	useEffect(() => {
		initSettings().catch((err) => {
			console.error("Failed to init settings", err);
		});
	}, []);

	return (
		<div className="flex flex-col gap-4">
			<Header />

			<div className="bg-grey-200 grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mx-4">
				<Stat
					title="Annual Income"
					icon={BanknoteArrowUpIcon}
					value={formatCurrency(totalAnnualIncome)}
					bg="bg-blue-300 dark:bg-blue-400/50"
				/>

				<Stat
					title="Annual Expenses"
					icon={ShoppingCartIcon}
					value={formatCurrency(totalAnnualExpense)}
					action={
						totalAnnualExpense > totalAnnualIncome && (
							<TooltipPopover content="Expenses exceed income">
								<TriangleAlert className="text-destructive" />
							</TooltipPopover>
						)
					}
					bg="bg-yellow-300 dark:bg-yellow-400/50"
				/>

				<Stat
					title="Annual Debt Payments"
					icon={CreditCardIcon}
					value={formatCurrency(totalAnnualDebtPayments)}
					action={
						totalAnnualExpense + totalAnnualDebtPayments >
							totalAnnualIncome && (
							<TooltipPopover content="Expenses and debt exceeds income">
								<TriangleAlert className="text-destructive" />
							</TooltipPopover>
						)
					}
					bg="bg-red-300 dark:bg-red-400/50"
				/>

				<Stat
					title="Annual Contributions"
					icon={TrendingUpIcon}
					value={formatCurrency(totalAnnualContributions)}
					bg="bg-green-300 dark:bg-green-400/50"
				/>

				<Stat
					title="Net Worth"
					icon={DollarSignIcon}
					value={formatCurrency(totalAssets)}
					bg="bg-green-300 dark:bg-green-400/50"
				/>

				<Stat
					title="Outstanding Debt"
					icon={AlertCircleIcon}
					value={formatCurrency(totalOutstanding)}
					bg="bg-red-300 dark:bg-red-400/50"
				/>

				<Stat
					title="Annual Net Cash Flow"
					icon={RefreshCwIcon}
					value={formatCurrency(
						totalAnnualIncome -
							totalAnnualExpense -
							totalAnnualDebtPayments -
							totalAnnualContributions,
					)}
					action={
						totalAnnualIncome -
							totalAnnualExpense -
							totalAnnualDebtPayments -
							totalAnnualContributions <
							0 && (
							<TooltipPopover content="Negative cash flow">
								<TriangleAlert className="text-destructive" />
							</TooltipPopover>
						)
					}
					bg="bg-green-300 dark:bg-green-400/50"
				/>

				<Stat
					title="Debt-to-Income"
					icon={PieChartIcon}
					value={`${dtiRatio.toFixed(2)}%`}
					bg="bg-red-300 dark:bg-red-400/50"
					action={
						dtiRatio >= 36 && (
							<TooltipPopover content="Consider reducing debt">
								<TriangleAlert className="text-destructive" />
							</TooltipPopover>
						)
					}
				/>

				<Stat
					title="Average Interest Rate"
					icon={PercentIcon}
					value={`${averageInterestRate.toFixed(2)}%`}
					bg="bg-red-300 dark:bg-red-400/50"
					action={
						averageInterestRate > 15 && (
							<TooltipPopover content="Average interest rate is high. Consider refinancing.">
								<TriangleAlert className="text-destructive" />
							</TooltipPopover>
						)
					}
				/>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-4 items-start gap-4 px-4 pb-4">
				<Incomes />
				<Expenses />
				<Debts />
				<Assets />
			</div>
		</div>
	);
}

export default App;
