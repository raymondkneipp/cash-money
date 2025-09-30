import { frequencyOptions } from "../utils/constants";
import { addArrayObject, deleteById, updateById } from "../utils/fn";
import type { InterestBearing } from "../utils/types";
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

export function Debts({
	debts,
	setDebts,
}: {
	debts: InterestBearing[];
	setDebts: React.Dispatch<React.SetStateAction<InterestBearing[]>>;
}) {
	return (
		<Card className="divide-y">
			<CardHeader className="pb-4">
				<CardTitle>Debts</CardTitle>
				<CardDescription>
					Money you owe, such as loans, credit cards, or mortgages.
				</CardDescription>
			</CardHeader>

			{debts.map((i) => (
				<CardContent className="flex flex-col gap-4 pb-6" key={`debt-${i.id}`}>
					<div className="flex items-end gap-2">
						<div className="flex flex-col gap-1.5 flex-grow">
							<Label htmlFor={`debt-name-${i.id}`}>Name</Label>
							<Input
								id={`debt-name-${i.id}`}
								type="text"
								inputMode="text"
								value={i.name}
								onChange={(e) =>
									updateById(setDebts, i.id, "name", e.target.value)
								}
							/>
						</div>

						<Button
							size="icon"
							variant="destructive"
							onClick={(_) => deleteById(setDebts, i.id)}
						>
							<TrashIcon />
						</Button>
					</div>

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
								updateById(setDebts, i.id, "principal", Number(value ?? 0))
							}
						/>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`debt-rate-${i.id}`}>Rate</Label>
							<NumberInput
								id={`debt-rate-${i.id}`}
								inputMode="numeric"
								min={0}
								max={100}
								suffix="%"
								value={i.rate * 100}
								decimalScale={2}
								onValueChange={(value) =>
									updateById(setDebts, i.id, "rate", Number(value ?? 0) / 100)
								}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`debt-compound-${i.id}`}>Compound</Label>

							<Select
								value={i.compound}
								onValueChange={(value) =>
									updateById(setDebts, i.id, "compound", value)
								}
							>
								<SelectTrigger id={`debt-compound-${i.id}`} className="w-full">
									<SelectValue placeholder="Compound" />
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
								value={i.contribution}
								onValueChange={(value) =>
									updateById(setDebts, i.id, "contribution", Number(value ?? 0))
								}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`debt-contribution-frequency-${i.id}`}>
								Frequency
							</Label>

							<Select
								value={i.contributionFrequency}
								onValueChange={(value) =>
									updateById(setDebts, i.id, "contributionFrequency", value)
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
				<Button
					className="w-full"
					onClick={(_) =>
						addArrayObject(setDebts, {
							name: "New Debt",
							principal: 1_000,
							rate: 0.2,
							compound: "monthly",
							contribution: 30,
							contributionFrequency: "monthly",
						})
					}
				>
					<PlusIcon />
					Add Debt
				</Button>
			</CardFooter>
		</Card>
	);
}
