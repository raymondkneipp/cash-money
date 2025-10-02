import { frequencyOptions } from "../utils/constants";
import type { Frequency } from "../utils/types";
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
import { useIncomes } from "@/hooks/use-incomes";

export function Incomes() {
	const { incomes, add, drop, edit } = useIncomes();

	return (
		<Card className="divide-y">
			<CardHeader className="pb-4 sticky top-0 bg-card z-10">
				<CardTitle>Income</CardTitle>
				<CardDescription>
					Money you earn from work, investments, or other sources.
				</CardDescription>
			</CardHeader>

			{!incomes?.length && (
				<CardContent className="pb-6">
					<p className="text-center text-muted-foreground">No incomes</p>
				</CardContent>
			)}

			{incomes?.map((i) => (
				<CardContent
					className="flex flex-col gap-4 pb-6"
					key={`income-${i.id}`}
				>
					<div className="flex items-end gap-2">
						<div className="flex flex-col gap-1.5 flex-grow">
							<Label htmlFor={`income-name-${i.id}`}>Name</Label>
							<Input
								id={`income-name-${i.id}`}
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
							<Label htmlFor={`income-amount-${i.id}`}>Amount</Label>
							<NumberInput
								id={`income-amount-${i.id}`}
								decimalScale={2}
								prefix="$"
								inputMode="numeric"
								thousandSeparator={","}
								value={i.amount}
								min={1}
								max={500_000}
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
							<Label htmlFor={`income-frequency-${i.id}`}>Frequency</Label>
							<Select
								value={i.frequency}
								onValueChange={(value) =>
									edit({ id: i.id, frequency: value as Frequency })
								}
							>
								<SelectTrigger
									id={`income-frequency-${i.id}`}
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
					Add Income
				</Button>
			</CardFooter>
		</Card>
	);
}
