import { useState, useEffect } from "react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";

export function TooltipPopover({
	children,
	content,
}: {
	children: React.ReactNode;
	content: React.ReactNode;
}) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		function handleResize() {
			setIsMobile(window.innerWidth < 768); // adjust breakpoint as needed
		}
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (isMobile) {
		return (
			<Popover>
				<PopoverTrigger asChild>{children}</PopoverTrigger>
				<PopoverContent>{content}</PopoverContent>
			</Popover>
		);
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent>{content}</TooltipContent>
		</Tooltip>
	);
}
