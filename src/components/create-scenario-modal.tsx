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
import { useState } from "react";
import { NumberInput } from "./ui/number-input";
import { createScenario } from "@/db/scenario";

function getDefaultScenario(): Omit<Scenario, "id"> {
	return {
		name: "New Scenario",
		age: 20,
	};
}

export function CreateScenarioModal({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const [scenario, setScenario] = useState<Omit<Scenario, "id">>(
		getDefaultScenario(),
	);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent onCloseAutoFocus={() => setScenario(getDefaultScenario())}>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						const newScenario = await createScenario(scenario);
						// Switch to the newly created scenario
						await db.settings.put({
							id: 1,
							currentScenarioId: newScenario.id,
						});
						setScenario(getDefaultScenario());
						setIsOpen(false);
					}}
					className="gap-4 flex flex-col"
				>
					<DialogHeader>
						<DialogTitle>New scenario</DialogTitle>
						<DialogDescription>
							Set up a new scenario to try out different budget plans and see
							where your finances could be at any age.
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
						<Button type="submit">Create scenario</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
