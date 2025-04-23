"use client";

import { trpc } from "@/lib/trpc/client";
import { useState } from "react";

import type { Item } from "@/lib/api/receipt/get.schema";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { NewItemForm } from "./NewItemForm";

type Props = {
	value: Item | null;
	onSelect: (item: Item) => void;
};

export function ItemSelector({ value, onSelect }: Props) {
	const [input, setInput] = useState(value?.rawName ?? "");
	const debouncedInput = useDebounce(input, 300);

	type Mode = "idle" | "selecting" | "creating" | "submitting";
	const [mode, setMode] = useState<Mode>("idle");

	const { data: suggestions = [], isFetching } = trpc.item.search.useQuery(
		{ keyword: debouncedInput, limit: 5 },
		{ enabled: debouncedInput.trim().length > 1 },
	);

	const handleSelect = (item: Item) => {
		onSelect(item);
	};

	const handleCreated = (item: Item) => {
		setInput(item.rawName);
		onSelect(item);
	};

	return (
		<div
			className="relative"
			onFocus={() => setMode("selecting")}
			onBlur={(e) => {
				if (!e.currentTarget.contains(e.relatedTarget)) {
					setMode("idle");
				}
			}}
		>
			<div>{mode}</div>
			<input
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				className="border px-2 py-1 text-sm w-full"
				placeholder="商品名を検索"
			/>
			<ul className="absolute z-10 bg-white border w-full shadow text-sm">
				{mode === "selecting" && (
					<>
						{isFetching && (
							// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
							<li
								key="new"
								className="px-2 py-1 text-sm text-blue-900 hover:bg-blue-100 cursor-pointer"
								onClick={() => {}}
							>
								Loading...
							</li>
						)}
						{!isFetching && (
							<>
								{suggestions.length > 0 &&
									suggestions.map((item) => (
										// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
										<li
											key={item.id}
											className="px-2 py-1 text-sm hover:bg-blue-100 cursor-pointer"
											onClick={() => handleSelect(item)}
										>
											{item.rawName}（{item.category}）
										</li>
									))}
								{suggestions.length >= 0 && (
									// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
									<li
										key="new"
										className="px-2 py-1 text-sm text-blue-900 hover:bg-blue-100 cursor-pointer"
										onMouseDown={() => {
											setMode("creating");
											alert("creating");
										}}
									>
										+ New Item
									</li>
								)}
							</>
						)}
					</>
				)}
				{mode === "creating" && (
					<li>
						<NewItemForm initialName={input} onCreated={handleCreated} />
					</li>
				)}
			</ul>
		</div>
	);
}
