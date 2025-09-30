import { frequencyOptions } from "../utils/constants";
import { addArrayObject, deleteById, updateById } from "../utils/fn";
import type { Expense } from "../utils/types";
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

export function Expenses({
	expenses,
	setExpenses,
}: {
	expenses: Expense[];
	setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}) {
	return (
		<Card className="divide-y">
			<CardHeader className="pb-4">
				<CardTitle>Expenses</CardTitle>
				<CardDescription>
					Your regular spending on living costs, bills, and other needs.
				</CardDescription>
			</CardHeader>
			{expenses.map((i) => (
				<CardContent
					className="flex flex-col gap-4 pb-6"
					key={`expenses-${i.id}`}
				>
					<div className="flex flex-col gap-2">
						<div className="flex items-end gap-2">
							<div className="flex flex-col gap-1.5 flex-grow">
								<Label htmlFor={`expense-name-${i.id}`}>Name</Label>
								<Input
									id={`expense-name-${i.id}`}
									type="text"
									inputMode="text"
									value={i.name}
									onChange={(e) =>
										updateById(setExpenses, i.id, "name", e.target.value)
									}
								/>
							</div>

							<Button
								size="icon"
								variant="destructive"
								onClick={(_) => deleteById(setExpenses, i.id)}
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
										updateById(setExpenses, i.id, "amount", Number(value ?? 0))
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
										updateById(setExpenses, i.id, "frequency", value)
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
					</div>
				</CardContent>
			))}

			<CardFooter className="flex-col gap-2">
				<Button
					className="w-full"
					onClick={(_) =>
						addArrayObject(setExpenses, {
							name: "New Expense",
							amount: 1_000,
							frequency: "monthly",
						})
					}
				>
					<PlusIcon />
					Add Expense
				</Button>
			</CardFooter>
		</Card>
	);
}
