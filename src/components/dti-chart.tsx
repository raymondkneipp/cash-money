import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { TooltipPopover } from "./ui/tooltip-popover";
import { TriangleAlert } from "lucide-react";

export const description = "A radial chart showing debt-to-income ratio";

interface DTIChartProps {
	dtiRatio: number;
}

export function DTIChart({ dtiRatio }: DTIChartProps) {
	// Create chart data where the filled portion represents the DTI ratio
	// and the remaining portion represents the available income ratio
	const chartData = [
		{
			dti: Math.min(dtiRatio, 100), // Cap at 100% for visualization
			available: Math.max(100 - dtiRatio, 0), // Remaining percentage
		},
	];

	const chartConfig = {
		dti: {
			label: "Debt",
			color: "var(--chart-4)",
		},
		available: {
			label: "Income",
			color: "var(--chart-5)",
		},
	} satisfies ChartConfig;

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Debt-to-Income</CardTitle>
				<CardDescription>Monthly debt payments vs income</CardDescription>
				{dtiRatio >= 36 && (
					<CardAction>
						<TooltipPopover content="Consider reducing debt">
							<TriangleAlert className="text-destructive" />
						</TooltipPopover>
					</CardAction>
				)}
			</CardHeader>
			<CardContent className="flex flex-1 items-center pb-0">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-2/1 w-full max-w-[250px]"
				>
					<RadialBarChart
						data={chartData}
						endAngle={180}
						innerRadius={80}
						outerRadius={130}
						cy="100%"
					>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
							<Label
								content={({ viewBox }) => {
									if (viewBox && "cx" in viewBox && "cy" in viewBox) {
										return (
											<text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) - 20}
													className="fill-foreground text-2xl font-bold"
												>
													{dtiRatio.toFixed(1)}%
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) - 4}
													className="fill-muted-foreground"
												>
													DTI Ratio
												</tspan>
											</text>
										);
									}
								}}
							/>
						</PolarRadiusAxis>
						<RadialBar
							dataKey="dti"
							stackId="a"
							cornerRadius={5}
							fill="var(--color-dti)"
							className="stroke-transparent stroke-2"
						/>
						<RadialBar
							dataKey="available"
							fill="var(--color-available)"
							stackId="a"
							cornerRadius={5}
							className="stroke-transparent stroke-2"
						/>
					</RadialBarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
