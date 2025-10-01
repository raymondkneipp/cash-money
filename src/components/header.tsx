import { useState } from "react";
import {
	BanknoteIcon,
	CopyIcon,
	DatabaseIcon,
	EllipsisVerticalIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "lucide-react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { InspectDataSheet } from "./inspect-data-sheet";
import { CreateScenarioModal } from "./create-scenario-modal";
import { EditScenarioModal } from "./edit-scenario-modal";
import { DeleteScenarioAlert } from "./delete-scenario-alert";
import { DuplicateScenarioModal } from "./duplicate-scenario-modal";

export function useScenarioManager() {
	// Watch settings row
	const settings = useLiveQuery(() => db.settings.get(1), []);

	// Watch all scenarios
	const scenarios = useLiveQuery(() => db.scenarios.toArray());

	// Watch current scenario row based on settings
	const currentScenario = useLiveQuery(async () => {
		if (!settings?.currentScenarioId) return undefined;
		return await db.scenarios.get(settings.currentScenarioId);
	}, [settings?.currentScenarioId]);

	async function deleteCurrentScenario() {
		if (!settings?.currentScenarioId || !scenarios) return;

		// Prevent deletion if it's the only scenario
		if (scenarios.length <= 1) {
			throw new Error("Cannot delete the last scenario.");
		}

		// Delete current scenario
		await db.scenarios.delete(settings.currentScenarioId);

		// Pick the next available scenario
		const nextScenario = scenarios.find(
			(s) => s.id !== settings.currentScenarioId,
		);
		if (nextScenario) {
			await db.settings.update(1, { currentScenarioId: nextScenario.id });
		}
	}

	return {
		scenarios,
		settings,
		currentScenario,
		deleteCurrentScenario,
	};
}

export function Header() {
	const { currentScenario, scenarios } = useScenarioManager();

	const [open, setOpen] = useState(false);

	const [inspectDB, setInspectDB] = useState(false);
	const [showNewScenario, setShowNewScenario] = useState(false);
	const [showEditScenario, setShowEditScenario] = useState(false);
	const [showDeleteScenario, setShowDeleteScenario] = useState(false);
	const [showDuplicateScenario, setShowDuplicateScenario] = useState(false);

	const handleScenarioSelect = async (scenarioId: string) => {
		setOpen(false);

		await db.settings.put({
			id: 1,
			currentScenarioId: parseInt(scenarioId),
		});
	};

	return (
		<>
			<header className="border-b p-4 flex items-center justify-between flex-col gap-2 sm:flex-row">
				<h1 className="text-lg font-bold flex items-center gap-2">
					<BanknoteIcon className="text-primary size-8" /> Cash Money
				</h1>

				<div className="flex items-center gap-2">
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={open}
								className="w-[200px] justify-between"
							>
								{currentScenario ? currentScenario.name : "Select scenario"}

								<ChevronsUpDown className="opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[200px] p-0">
							<Command>
								<CommandInput placeholder="Search scenarios..." />
								<CommandList>
									<CommandEmpty>No scenario found.</CommandEmpty>
									<CommandGroup>
										{scenarios?.map((s) => (
											<CommandItem
												key={s.id}
												value={s.id.toString()}
												onSelect={handleScenarioSelect}
											>
												{s.name}
												<Check
													className={cn(
														"ml-auto",
														currentScenario?.id === s.id
															? "opacity-100"
															: "opacity-0",
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button size="icon" variant="outline">
								<EllipsisVerticalIcon />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end">
							<DropdownMenuGroup>
								<DropdownMenuItem onClick={(_) => setShowNewScenario(true)}>
									<PlusIcon />
									New Scenario
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(_) => setShowDuplicateScenario(true)}
								>
									<CopyIcon />
									Duplicate Scenario
								</DropdownMenuItem>
								<DropdownMenuItem onClick={(_) => setShowEditScenario(true)}>
									<PencilIcon />
									Edit Scenario
								</DropdownMenuItem>
								<DropdownMenuItem onClick={(_) => setShowDeleteScenario(true)}>
									<TrashIcon />
									Delete Scenario
								</DropdownMenuItem>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />

							<DropdownMenuGroup>
								<DropdownMenuItem onClick={() => setInspectDB(true)}>
									<DatabaseIcon />
									Inspect Data
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>

			<InspectDataSheet isOpen={inspectDB} setIsOpen={setInspectDB} />

			<CreateScenarioModal
				isOpen={showNewScenario}
				setIsOpen={setShowNewScenario}
			/>

			{currentScenario && (
				<EditScenarioModal
					data={currentScenario}
					open={showEditScenario}
					onOpenChange={setShowEditScenario}
				/>
			)}

			<DeleteScenarioAlert
				open={showDeleteScenario}
				onOpenChange={setShowDeleteScenario}
			/>

			<DuplicateScenarioModal
				isOpen={showDuplicateScenario}
				setIsOpen={setShowDuplicateScenario}
				scenarioToDuplicate={currentScenario || null}
			/>
		</>
	);
}
