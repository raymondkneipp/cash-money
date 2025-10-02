import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { formatCurrency } from "@/utils/fn";
import { useNetWorthProjection } from "@/hooks/use-net-worth-projection";
import { MAX_AGE } from "@/constants";
import { useScenario } from "@/hooks/use-scenario";

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

const chartConfig = {
	netWorth: {
		label: "Net Worth",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

export function NetWorthChart(props: { className?: string }) {
	const { chartData, netWorthGrowth, growthPercentage } =
		useNetWorthProjection();
	const { currentScenario } = useScenario();

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
