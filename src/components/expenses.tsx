import { freqToPeriods, frequencyOptions } from "../utils/constants";
import type { Expense, Frequency } from "../utils/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { PlusIcon, TrashIcon } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useScenarioManager } from "./header";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";

export function useExpenses() {
	const { currentScenario } = useScenarioManager();

	const expenses = useLiveQuery(async () => {
		if (!currentScenario?.id) return [];
		return await db.expenses
			.where({ scenarioId: currentScenario.id })
			.toArray();
	}, [currentScenario?.id]);

	async function add() {
		if (!currentScenario) {
			throw Error("No scenarioId");
		}

		await db.expenses.add({
			name: "New expense",
			amount: 200,
			frequency: "monthly",
			scenarioId: currentScenario.id,
		});
	}

	async function drop(id: number) {
		await db.expenses.delete(id);
	}

	async function edit(
		i: { id: number } & Partial<Omit<Expense, "id" | "scenarioId">>,
	) {
		const { id, ...rest } = i;
		await db.expenses.update(id, rest);
	}

	const totalAnnualExpense =
		expenses?.reduce((sum, expense) => {
			const periods = freqToPeriods[expense.frequency] ?? 1;
			return sum + expense.amount * periods;
		}, 0) ?? 0;

	return { expenses, add, drop, edit, totalAnnualExpense };
}

export function Expenses() {
	const { expenses, edit, drop, add } = useExpenses();

	return (
		<Card className="divide-y">
			<CardHeader className="pb-4 sticky top-0 bg-card z-10">
				<CardTitle>Expenses</CardTitle>
				<CardDescription>
					Your regular spending on living costs, bills, and other needs.
				</CardDescription>
			</CardHeader>

			{!expenses?.length && (
				<CardContent className="pb-6">
					<p className="text-center text-muted-foreground">No expenses</p>
				</CardContent>
			)}

			{expenses?.map((i) => (
				<CardContent
					className="flex flex-col gap-4 pb-6"
					key={`expenses-${i.id}`}
				>
					<div className="flex items-end gap-2">
						<div className="flex flex-col gap-1.5 flex-grow">
							<Label htmlFor={`expense-name-${i.id}`}>Name</Label>
							<Input
								id={`expense-name-${i.id}`}
								type="text"
								inputMode="text"
								value={i.name}
								onChange={(e) => edit({ id: i.id, name: e.target.value })}
							/>
						</div>

						<Button
							size="icon"
							variant="destructive"
							onClick={(_) => drop(i.id)}
						>
							<TrashIcon />
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`expense-amount-${i.id}`}>Amount</Label>
							<NumberInput
								id={`expense-amount-${i.id}`}
								decimalScale={2}
								min={1}
								max={500_000}
								prefix="$"
								inputMode="numeric"
								thousandSeparator={","}
								value={i.amount}
								onValueChange={(value) =>
									edit({ id: i.id, amount: value ?? 0 })
								}
								stepper={
									i.frequency === "annually"
										? 5000
										: i.frequency === "semiannually"
											? 1000
											: i.frequency === "quarterly"
												? 500
												: i.frequency === "monthly"
													? 100
													: i.frequency === "biweekly"
														? 100
														: i.frequency === "weekly"
															? 50
															: 10
								}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`expense-frequency-${i.id}`}>Frequency</Label>
							<Select
								value={i.frequency}
								onValueChange={(value) =>
									edit({ id: i.id, frequency: value as Frequency })
								}
							>
								<SelectTrigger
									id={`expense-frequency-${i.id}`}
									className="w-full"
								>
									<SelectValue placeholder="Frequency" />
								</SelectTrigger>
								<SelectContent>
									{frequencyOptions.map((freq) => (
										<SelectItem value={freq} key={freq}>
											{freq}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			))}

			<CardFooter className="flex-col gap-2">
				<Button className="w-full" onClick={(_) => add()}>
					<PlusIcon />
					Add Expense
				</Button>
			</CardFooter>
		</Card>
	);
}
