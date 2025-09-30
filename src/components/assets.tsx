import { frequencyOptions } from "../utils/constants";
import { addArrayObject, deleteById, updateById } from "../utils/fn";
import type { InterestBearing } from "../utils/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "./ui/number-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PlusIcon, TrashIcon } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function Assets({
	assets,
	setAssets,
}: {
	assets: InterestBearing[];
	setAssets: React.Dispatch<React.SetStateAction<InterestBearing[]>>;
}) {
	return (
		<Card className="divide-y">
			<CardHeader className="pb-4">
				<CardTitle>Assets</CardTitle>
				<CardDescription>
					Things you own that have value, like savings, investments, or
					property.
				</CardDescription>
			</CardHeader>
			{assets.map((i) => (
				<CardContent className="flex flex-col gap-4 pb-6" key={`asset-${i.id}`}>
					<div className="flex items-end gap-2">
						<div className="flex flex-col gap-1.5 flex-grow">
							<Label htmlFor={`asset-name-${i.id}`}>Name</Label>
							<Input
								id={`asset-name-${i.id}`}
								type="text"
								inputMode="text"
								value={i.name}
								onChange={(e) =>
									updateById(setAssets, i.id, "name", e.target.value)
								}
							/>
						</div>

						<Button
							size="icon"
							variant="destructive"
							onClick={(_) => deleteById(setAssets, i.id)}
						>
							<TrashIcon />
						</Button>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor={`asset-principal-${i.id}`}>Principal</Label>
						<NumberInput
							id={`asset-principal-${i.id}`}
							inputMode="numeric"
							decimalScale={2}
							thousandSeparator=","
							min={0}
							max={5_000_000}
							prefix="$"
							value={i.principal}
							onValueChange={(value) =>
								updateById(setAssets, i.id, "principal", Number(value))
							}
						/>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`asset-rate-${i.id}`}>Rate</Label>
							<NumberInput
								id={`asset-rate-${i.id}`}
								inputMode="numeric"
								decimalScale={2}
								min={0}
								max={100}
								suffix="%"
								value={i.rate * 100}
								onValueChange={(value) =>
									updateById(setAssets, i.id, "rate", Number(value ?? 0) / 100)
								}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`asset-compound-${i.id}`}>Compound</Label>

							<Select
								value={i.compound}
								onValueChange={(value) =>
									updateById(setAssets, i.id, "compound", value)
								}
							>
								<SelectTrigger id={`asset-compound-${i.id}`} className="w-full">
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
							<Label htmlFor={`asset-contribution-${i.id}`}>Contribution</Label>
							<NumberInput
								id={`asset-contribution-${i.id}`}
								inputMode="numeric"
								min={1}
								max={500_000}
								decimalScale={2}
								thousandSeparator=","
								prefix="$"
								value={i.contribution}
								onValueChange={(value) =>
									updateById(
										setAssets,
										i.id,
										"contribution",
										Number(value ?? 0),
									)
								}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`asset-contribution-frequency-${i.id}`}>
								Frequency
							</Label>

							<Select
								value={i.contributionFrequency}
								onValueChange={(value) =>
									updateById(setAssets, i.id, "contributionFrequency", value)
								}
							>
								<SelectTrigger
									id={`asset-contribution-frequency-${i.id}`}
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
						addArrayObject(setAssets, {
							name: "New Asset",
							principal: 1_000,
							rate: 0.02,
							compound: "monthly",
							contribution: 100,
							contributionFrequency: "monthly",
						})
					}
				>
					<PlusIcon />
					Add Asset
				</Button>
			</CardFooter>
		</Card>
	);
}
