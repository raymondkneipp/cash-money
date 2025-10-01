import { freqToPeriods, frequencyOptions } from "../utils/constants";
import type { Frequency } from "../utils/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { db, type Debt } from "@/db";
import { useIncomes } from "./incomes";

export function useDebts() {
	const { currentScenario } = useScenarioManager();
	const { totalAnnualIncome } = useIncomes();

	const debts = useLiveQuery(async () => {
		if (!currentScenario?.id) return [];
		return await db.debts.where({ scenarioId: currentScenario.id }).toArray();
	}, [currentScenario?.id]);

	async function add() {
		if (!currentScenario) {
			throw Error("No scenarioId");
		}

		await db.debts.add({
			scenarioId: currentScenario.id,
			name: "New Debt",
			principal: 1_000,
			interestRate: 15,
			minimumPayment: 30,
			frequency: "monthly",
		});
	}

	async function drop(id: number) {
		await db.debts.delete(id);
	}

	async function edit(
		i: { id: number } & Partial<Omit<Debt, "id" | "scenarioId">>,
	) {
		const { id, ...rest } = i;
		await db.debts.update(id, rest);
	}

	const totalOutstanding = debts?.reduce((sum, d) => sum + d.principal, 0) ?? 0;

	const totalAnnualDebtPayments =
		debts?.reduce((sum, d) => {
			const periods = freqToPeriods[d.frequency];
			return sum + d.minimumPayment * periods;
		}, 0) ?? 0;

	const monthlyIncome = totalAnnualIncome / 12;
	const monthlyDebtPayments = totalAnnualDebtPayments / 12;

	const dtiRatio =
		monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;

	const averageInterestRate =
		debts && debts.length > 0
			? debts.reduce((sum, d) => sum + d.interestRate, 0) / debts.length
			: 0;

	return {
		debts,
		add,
		drop,
		edit,
		totalOutstanding,
		totalAnnualDebtPayments,
		dtiRatio,
		averageInterestRate,
	};
}

export function Debts() {
	const { debts, edit, add, drop } = useDebts();

	return (
		<Card className="divide-y">
			<CardHeader className="pb-4 sticky top-0 bg-card z-10">
				<CardTitle>Debts</CardTitle>
				<CardDescription>
					Money you owe, such as loans, credit cards, or mortgages.
				</CardDescription>
			</CardHeader>

			{!debts?.length && (
				<CardContent className="pb-6">
					<p className="text-center text-muted-foreground">No debts</p>
				</CardContent>
			)}

			{debts?.map((i) => (
				<CardContent className="flex flex-col gap-4 pb-6" key={`debt-${i.id}`}>
					<div className="flex items-end gap-2">
						<div className="flex flex-col gap-1.5 flex-grow">
							<Label htmlFor={`debt-name-${i.id}`}>Name</Label>
							<Input
								id={`debt-name-${i.id}`}
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
							<Label htmlFor={`debt-principal-${i.id}`}>Principal</Label>
							<NumberInput
								id={`debt-principal-${i.id}`}
								inputMode="numeric"
								thousandSeparator=","
								decimalScale={2}
								min={1}
								max={5_000_000}
								prefix="$"
								value={i.principal}
								onValueChange={(value) =>
									edit({ id: i.id, principal: value ?? 0 })
								}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`debt-rate-${i.id}`}>Rate</Label>
							<NumberInput
								id={`debt-rate-${i.id}`}
								inputMode="numeric"
								min={0}
								max={100}
								suffix="%"
								value={i.interestRate}
								decimalScale={2}
								onValueChange={(value) =>
									edit({ id: i.id, interestRate: value ?? 0 })
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`debt-contribution-${i.id}`}>Payment</Label>
							<NumberInput
								id={`debt-contribution-${i.id}`}
								inputMode="numeric"
								min={1}
								max={500_000}
								decimalScale={2}
								thousandSeparator=","
								prefix="$"
								value={i.minimumPayment}
								onValueChange={(value) =>
									edit({ id: i.id, minimumPayment: value ?? 0 })
								}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`debt-contribution-frequency-${i.id}`}>
								Frequency
							</Label>

							<Select
								value={i.frequency}
								onValueChange={(value) =>
									edit({ id: i.id, frequency: value as Frequency })
								}
							>
								<SelectTrigger
									id={`debt-contribution-frequency-${i.id}`}
									className="w-full"
								>
									<SelectValue placeholder="Contribution Frequency" />
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
					Add Debt
				</Button>
			</CardFooter>
		</Card>
	);
}
