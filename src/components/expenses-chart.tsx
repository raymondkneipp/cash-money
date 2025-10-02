import { Pie, PieChart } from "recharts";
import { useLiveQuery } from "dexie-react-hooks";

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
import { db } from "@/db";
import { freqToPeriods } from "@/utils/constants";
import { useScenario } from "@/hooks/use-scenario";

export const description = "Expense breakdown pie chart";

// Color palette for expenses
const expenseColors = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

interface ExpensesPieChartProps {
	className?: string;
}

export function ExpensesPieChart({ className }: ExpensesPieChartProps) {
	const { currentScenario } = useScenario();

	const expenses = useLiveQuery(async () => {
		if (!currentScenario?.id) return [];
		return await db.expenses
			.where({ scenarioId: currentScenario.id })
			.toArray();
	}, [currentScenario?.id]);

	// Convert expenses to monthly amounts for pie chart
	const chartData =
		expenses
			?.map((expense, index) => {
				const periods = freqToPeriods[expense.frequency] ?? 1;
				const monthlyAmount = (expense.amount * periods) / 12;

				return {
					name: expense.name,
					amount: monthlyAmount,
					fill: expenseColors[index % expenseColors.length],
				};
			})
			.filter((item) => item.amount > 0) ?? [];

	// Create chart configuration dynamically
	const chartConfig = chartData.reduce((config, item) => {
		config[item.name] = {
			label: item.name,
			color: item.fill,
		};
		return config;
	}, {} as ChartConfig);

	const totalMonthlyExpenses = chartData.reduce(
		(sum, item) => sum + item.amount,
		0,
	);

	if (!expenses?.length || chartData.length === 0) {
		return (
			<Card className={`flex flex-col ${className || ""}`}>
				<CardHeader className="items-center pb-0">
					<CardTitle>Expense Breakdown</CardTitle>
					<CardDescription>Monthly expense distribution</CardDescription>
				</CardHeader>
				<CardContent className="flex-1 pb-0">
					<div className="flex items-center justify-center h-[250px] text-muted-foreground">
						No expenses to display
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={`flex flex-col ${className || ""}`}>
			<CardHeader className="items-center pb-0">
				<CardTitle>Expense Breakdown</CardTitle>
				<CardDescription>Monthly expense distribution</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer config={chartConfig} className="mx-auto max-h-[250px]">
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									hideLabel
									formatter={(value, name) => [
										`$${Number(value).toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})} / month: `,
										name,
									]}
								/>
							}
						/>
						<Pie
							data={chartData}
							dataKey="amount"
							nameKey="name"
							cx="50%"
							cy="50%"
							outerRadius={80}
							fill="#8884d8"
							label={({ name, percent }) =>
								`${name} (${(percent * 100).toFixed(0)}%)`
							}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col gap-2 text-sm">
				<div className="flex items-center gap-2 leading-none font-medium">
					Total Monthly Expenses: $
					{totalMonthlyExpenses.toLocaleString("en-US", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}
				</div>
				<div className="text-muted-foreground leading-none">
					Showing breakdown of {chartData.length} expense
					{chartData.length !== 1 ? "s" : ""}
				</div>
			</CardFooter>
		</Card>
	);
}
