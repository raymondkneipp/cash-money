import { type Scenario, db } from "@/db";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { NumberInput } from "./ui/number-input";
import { createScenario } from "@/db/scenario";

export function DuplicateScenarioModal({
	isOpen,
	setIsOpen,
	scenarioToDuplicate,
}: {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	scenarioToDuplicate: Scenario | null;
}) {
	const [scenario, setScenario] = useState<Omit<Scenario, "id">>({
		name: "",
		age: 20,
	});

	// Update form when scenarioToDuplicate changes
	useEffect(() => {
		if (scenarioToDuplicate) {
			setScenario({
				name: `${scenarioToDuplicate.name} (Copy)`,
				age: scenarioToDuplicate.age,
			});
		}
	}, [scenarioToDuplicate]);

	const handleDuplicate = async () => {
		if (!scenarioToDuplicate) return;

		try {
			// Create the new scenario
			const newScenario = await createScenario(scenario);

			// Get all data from the original scenario
			const [incomes, expenses, debts, assets] = await Promise.all([
				db.incomes.where({ scenarioId: scenarioToDuplicate.id }).toArray(),
				db.expenses.where({ scenarioId: scenarioToDuplicate.id }).toArray(),
				db.debts.where({ scenarioId: scenarioToDuplicate.id }).toArray(),
				db.assets.where({ scenarioId: scenarioToDuplicate.id }).toArray(),
			]);

			// Copy all data to the new scenario
			await Promise.all([
				// Copy incomes
				...incomes.map((income) =>
					db.incomes.add({
						...income,
						id: undefined, // Let Dexie generate new ID
						scenarioId: newScenario.id,
					})
				),
				// Copy expenses
				...expenses.map((expense) =>
					db.expenses.add({
						...expense,
						id: undefined, // Let Dexie generate new ID
						scenarioId: newScenario.id,
					})
				),
				// Copy debts
				...debts.map((debt) =>
					db.debts.add({
						...debt,
						id: undefined, // Let Dexie generate new ID
						scenarioId: newScenario.id,
					})
				),
				// Copy assets
				...assets.map((asset) =>
					db.assets.add({
						...asset,
						id: undefined, // Let Dexie generate new ID
						scenarioId: newScenario.id,
					})
				),
			]);

			// Switch to the newly created scenario
			await db.settings.put({
				id: 1,
				currentScenarioId: newScenario.id,
			});

			setIsOpen(false);
		} catch (error) {
			console.error("Failed to duplicate scenario:", error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						await handleDuplicate();
					}}
					className="gap-4 flex flex-col"
				>
					<DialogHeader>
						<DialogTitle>Duplicate Scenario</DialogTitle>
						<DialogDescription>
							Create a copy of "{scenarioToDuplicate?.name}" with all its data.
							You can modify the name and age for the new scenario.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="name">Scenario Name</Label>
							<Input
								id="name"
								value={scenario.name}
								onChange={(e) =>
									setScenario({ ...scenario, name: e.target.value })
								}
								placeholder="Enter scenario name"
							/>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="age">Age</Label>
							<NumberInput
								id="age"
								min={18}
								max={100}
								value={scenario.age}
								onValueChange={(value) =>
									setScenario({ ...scenario, age: value ?? 0 })
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button type="submit" disabled={!scenario.name.trim()}>
							Duplicate Scenario
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
