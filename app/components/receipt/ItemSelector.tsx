"use client";

import { useDebounce } from "@/lib/hooks/useDebounce";
import { trpc } from "@/lib/trpc/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { type Item, ItemSchema } from "@/lib/api/receipt";

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
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { NewItemForm } from "./NewItemForm";

type Props = {
	value: Item | null;
	onSelect: (item: Item) => void;
};

export function ItemSelector({ value, onSelect }: Props) {
	const [open, setOpen] = useState(false);
	const [item, setItem] = useState<Item | null>(value);
	const [input, setInput] = useState(value?.rawName ?? "");
	const debouncedInput = useDebounce(input, 300);
	type Mode = "idle" | "selecting" | "creating";
	const [mode, setMode] = useState<Mode>("idle");

	const { data: suggestions = [], isFetching } = trpc.item.search.useQuery(
		{ keyword: debouncedInput, limit: 5 },
		{ enabled: debouncedInput.trim().length > 1 },
	);

	const handleSelect = (item: Item) => {
		setItem(item);
		setOpen(false);
		onSelect(item);
	};

	const handleCreated = (item: Item) => {
		setMode("idle");
		setItem(item);
		setInput(item.rawName);
		onSelect(item);
	};

	const renderSelectorButton = () => (
		<Button
			variant="outline"
			// biome-ignore lint/a11y/useSemanticElements: <explanation>
			role="combobox"
			aria-expanded={open}
			className="w-[200px] justify-between p-7"
		>
			<span className="text-left whitespace-normal break-words line-clamp-2">
				{item?.rawName ?? item?.normalized ?? "商品名を選択..."}
			</span>
			<ChevronsUpDown className="opacity-50" />
		</Button>
	);

	const renderSuggestionList = () => (
		<>
			<Command>
				<CommandInput
					value={input}
					onValueChange={(v) => setInput(v)}
					placeholder="商品名を選択..."
					className="h-9"
				/>
				<CommandList>
					<CommandGroup>
						{suggestions.map((i) => (
							<CommandItem
								key={i.id}
								value={`${i.rawName}${i.normalized}`}
								onSelect={() => handleSelect(i)}
								className="whitespace-normal break-words"
							>
								{i.normalized ?? i.rawName}
								<Check
									className={cn(
										"ml-auto",
										item?.id === i.id ? "opacity-100" : "opacity-0",
									)}
								/>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</Command>

			<Command>
				<CommandGroup>
					<CommandItem
						value=""
						className="pointer-events-auto text-blue-700 hover:bg-blue-100 cursor-pointer"
						onSelect={() => setMode("creating")}
					>
						<Plus />
						新しい商品
					</CommandItem>
				</CommandGroup>
			</Command>
		</>
	);

	const renderNewItemForm = () => (
		<Command>
			<CommandGroup>
				<NewItemForm initialName={input} onCreated={handleCreated} />
			</CommandGroup>
		</Command>
	);

	return (
		<Popover
			open={open}
			onOpenChange={(open) => {
				setOpen(open);
				setMode("selecting");
			}}
		>
			<PopoverTrigger asChild>{renderSelectorButton()}</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				{mode === "selecting" && renderSuggestionList()}
				{mode === "creating" && renderNewItemForm()}
			</PopoverContent>
		</Popover>
	);
}
