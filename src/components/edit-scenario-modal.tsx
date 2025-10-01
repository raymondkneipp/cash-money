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

export function EditScenarioModal({
	open,
	onOpenChange,
	data,
}: {
	open: boolean;
	onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
	data: Scenario;
}) {
	const [scenario, setScenario] = useState<Scenario>(data);

	// Update local state when data prop changes
	useEffect(() => {
		setScenario(data);
	}, [data]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent onCloseAutoFocus={() => setScenario(data)}>
				<form
					onSubmit={async (e) => {
						e.preventDefault();
						await db.scenarios.update(data.id, {
							name: scenario.name,
							age: scenario.age,
						});
						onOpenChange(false);
					}}
					className="gap-4 flex flex-col"
				>
					<DialogHeader>
						<DialogTitle>Edit scenario</DialogTitle>
						<DialogDescription>
							Make changes to your scenario—edit the name, age, or other details
							to see how your finances would look under different plans.
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
						<Button type="submit">Update scenario</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
