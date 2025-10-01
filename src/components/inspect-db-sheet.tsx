import { db } from "@/db";
import { JsonViewer } from "./ui/json-tree-viewer";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { TrashIcon } from "lucide-react";
import { useScenarioManager } from "./header";

export function InspectDBSheet({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const { currentScenario, settings, scenarios } = useScenarioManager();

	return (
		<>
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Inspect Database</SheetTitle>
					</SheetHeader>

					<div className="flex flex-col">
						<JsonViewer
							data={scenarios}
							rootName="scenarios"
							defaultExpanded={false}
						/>
						<JsonViewer
							data={settings}
							rootName="settings"
							defaultExpanded={false}
						/>
						<JsonViewer
							data={currentScenario}
							rootName="currentScenario"
							defaultExpanded={false}
						/>
					</div>

					<SheetFooter>
						<SheetClose asChild>
							<Button
								variant="destructive"
								onClick={async (_) => {
									await db.delete();
									window.location.reload();
								}}
							>
								<TrashIcon />
								Delete Database
							</Button>
						</SheetClose>
						<SheetClose asChild>
							<Button variant="outline">Close</Button>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</>
	);
}
