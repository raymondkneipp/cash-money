import { useState } from "react";
import { BanknoteIcon, EllipsisVerticalIcon } from "lucide-react";
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
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
	const scenarios = [
		{
			value: "1",
			label: "Default",
		},
		{
			value: "2",
			label: "Future",
		},
		{
			value: "3",
			label: "Nice Job",
		},
	];

	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("1");

	return (
		<header className="border-b p-4 flex items-center justify-between">
			<h1 className="text-lg font-bold flex items-center gap-2">
				<BanknoteIcon /> Cash Money
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
							{value
								? scenarios.find((framework) => framework.value === value)
										?.label
								: "Select scenario..."}
							<ChevronsUpDown className="opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0">
						<Command>
							<CommandInput placeholder="Search scenarios..." className="h-9" />
							<CommandList>
								<CommandEmpty>No scenario found.</CommandEmpty>
								<CommandGroup>
									{scenarios.map((framework) => (
										<CommandItem
											key={framework.value}
											value={framework.value}
											onSelect={(currentValue) => {
												setValue(currentValue === value ? "" : currentValue);
												setOpen(false);
											}}
										>
											{framework.label}
											<Check
												className={cn(
													"ml-auto",
													value === framework.value
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
					<DropdownMenuContent className="w-56" align="start">
						<DropdownMenuLabel>My Scenarios</DropdownMenuLabel>
						<DropdownMenuGroup>
							<DropdownMenuItem>New Scenario</DropdownMenuItem>
							<DropdownMenuItem>Duplicate Scenario</DropdownMenuItem>
							<DropdownMenuItem>Delete Scenario</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>Team</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem>Email</DropdownMenuItem>
										<DropdownMenuItem>Message</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem>More...</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
							<DropdownMenuItem>
								New Team
								<DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem>GitHub</DropdownMenuItem>
						<DropdownMenuItem>Support</DropdownMenuItem>
						<DropdownMenuItem disabled>API</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							Log out
							<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
