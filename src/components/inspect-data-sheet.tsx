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
import { useScenario } from "@/hooks/use-scenario";
import { useIncomes } from "@/hooks/use-incomes";
import { useExpenses } from "@/hooks/use-expenses";
import { useDebts } from "@/hooks/use-debts";
import { useAssets } from "@/hooks/use-assets";

export function InspectDataSheet({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const { currentScenario, settings, scenarios } = useScenario();
	const { incomes } = useIncomes();
	const { expenses } = useExpenses();
	const { debts } = useDebts();
	const { assets } = useAssets();

	return (
		<>
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Inspect Data</SheetTitle>
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
						<JsonViewer
							data={incomes}
							rootName="incomes"
							defaultExpanded={false}
						/>
						<JsonViewer
							data={expenses}
							rootName="expenses"
							defaultExpanded={false}
						/>
						<JsonViewer data={debts} rootName="debts" defaultExpanded={false} />
						<JsonViewer
							data={assets}
							rootName="assets"
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
