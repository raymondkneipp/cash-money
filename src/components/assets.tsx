import { freqToPeriods, frequencyOptions } from "../utils/constants";
import type { Frequency } from "../utils/types";
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
import { useScenarioManager } from "./header";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Asset } from "@/db";

export function useAssets() {
	const { currentScenario } = useScenarioManager();

	const assets = useLiveQuery(async () => {
		if (!currentScenario?.id) return [];
		return await db.assets.where({ scenarioId: currentScenario.id }).toArray();
	}, [currentScenario?.id]);

	async function add() {
		if (!currentScenario) {
			throw Error("No scenarioId");
		}

		await db.assets.add({
			scenarioId: currentScenario.id,
			name: "New Asset",
			value: 1_000,
			growthRate: 8,
			contribution: 100,
			frequency: "monthly",
		});
	}

	async function drop(id: number) {
		await db.assets.delete(id);
	}

	async function edit(
		i: { id: number } & Partial<Omit<Asset, "id" | "scenarioId">>,
	) {
		const { id, ...rest } = i;
		await db.assets.update(id, rest);
	}

	const totalAssets = assets?.reduce((sum, a) => sum + a.value, 0) ?? 0;

	const totalAnnualContributions =
		assets?.reduce(
			(sum, a) => sum + a.contribution * (freqToPeriods[a.frequency] ?? 0),
			0,
		) ?? 0;

	return { assets, add, drop, edit, totalAnnualContributions, totalAssets };
}

export function Assets() {
	const { assets, add, drop, edit } = useAssets();

	return (
		<Card className="divide-y">
			<CardHeader className="pb-4">
				<CardTitle>Assets</CardTitle>
				<CardDescription>
					Things you own that have value, like savings, investments, or
					property.
				</CardDescription>
			</CardHeader>

			{!assets?.length && (
				<CardContent className="pb-6">
					<p className="text-center text-muted-foreground">No assets</p>
				</CardContent>
			)}

			{assets?.map((i) => (
				<CardContent className="flex flex-col gap-4 pb-6" key={`asset-${i.id}`}>
					<div className="flex items-end gap-2">
						<div className="flex flex-col gap-1.5 flex-grow">
							<Label htmlFor={`asset-name-${i.id}`}>Name</Label>
							<Input
								id={`asset-name-${i.id}`}
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
							<Label htmlFor={`asset-value-${i.id}`}>Value</Label>
							<NumberInput
								id={`asset-value-${i.id}`}
								inputMode="numeric"
								decimalScale={2}
								thousandSeparator=","
								min={0}
								max={5_000_000}
								prefix="$"
								value={i.value}
								onValueChange={(value) => edit({ id: i.id, value: value })}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`asset-rate-${i.id}`}>Rate</Label>
							<NumberInput
								id={`asset-rate-${i.id}`}
								inputMode="numeric"
								decimalScale={2}
								min={0}
								max={100}
								suffix="%"
								value={i.growthRate}
								onValueChange={(value) =>
									edit({ id: i.id, growthRate: value ?? 0 })
								}
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-2">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`asset-contribution-${i.id}`}>Contribution</Label>
							<NumberInput
								id={`asset-contribution-${i.id}`}
								inputMode="numeric"
								min={0}
								max={500_000}
								decimalScale={2}
								thousandSeparator=","
								prefix="$"
								value={i.contribution}
								onValueChange={(value) =>
									edit({ id: i.id, contribution: value ?? 0 })
								}
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<Label htmlFor={`asset-contribution-frequency-${i.id}`}>
								Frequency
							</Label>

							<Select
								value={i.frequency}
								onValueChange={(value) =>
									edit({ id: i.id, frequency: value as Frequency })
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
				<Button className="w-full" onClick={(_) => add()}>
					<PlusIcon />
					Add Asset
				</Button>
			</CardFooter>
		</Card>
	);
}
