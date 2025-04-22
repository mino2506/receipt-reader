"use client";

import { trpc } from "@/lib/trpc/client";
import { useEffect, useState } from "react";

import type { Item } from "@/lib/api/receipt/get.schema";
import { useDebounce } from "@/lib/hooks/useDebounce";

const DUMMY_ITEMS: Item[] = [
	{
		id: "1",
		rawName: "牛乳500ml",
		normalized: "牛乳500ml",
		category: "drink",
		createdAt: "",
		updatedAt: "",
	},
	{
		id: "2",
		rawName: "卵",
		normalized: "卵",
		category: "food",
		createdAt: "",
		updatedAt: "",
	},
	{
		id: "3",
		rawName: "アイス",
		normalized: "アイス",
		category: "snacks",
		createdAt: "",
		updatedAt: "",
	},
	{
		id: "4",
		rawName: "牛乳1L",
		normalized: "牛乳1L",
		category: "drink",
		createdAt: "",
		updatedAt: "",
	},
];

type Props = {
	value: Item | null;
	onSelect: (item: Item) => void;
};

export default function ItemSelector({ value, onSelect }: Props) {
	const [input, setInput] = useState(value?.rawName ?? "");
	const debouncedInput = useDebounce(input, 300);
	const [showNewItemForm, setShowNewItemForm] = useState(false);

	const { data: suggestions = [], isFetching } = trpc.item.search.useQuery(
		{ keyword: debouncedInput, limit: 5 },
		{ enabled: debouncedInput.trim().length > 1 },
	);

	const handleSelect = (item: Item) => {
		onSelect(item);
	};

	return (
		<div className="relative">
			<span className="text-red-600">{input}</span>
			<input
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				className="border px-2 py-1 text-sm w-full"
				placeholder="商品名を検索"
			/>
			<ul className="absolute z-10 bg-white border w-full shadow text-sm">
				{isFetching && (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<li
						key="new"
						className="px-2 py-1 text-blue-900 hover:bg-blue-100 cursor-pointer"
						onClick={() => {}}
					>
						Loading...
					</li>
				)}
				{suggestions.length > 0 &&
					suggestions.map((item) => (
						// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
						<li
							key={item.id}
							className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
							onClick={() => handleSelect(item)}
						>
							{item.rawName}（{item.category}）
						</li>
					))}
				{suggestions.length === 0 && !isFetching && (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<li
						key="new"
						className="px-2 py-1 text-blue-900 hover:bg-blue-100 cursor-pointer"
						onClick={() => {
							setShowNewItemForm(!showNewItemForm);
						}}
					>
						+ 新しい商品を登録
					</li>
				)}
				{showNewItemForm && (
					<li>
						<NewItemForm />
					</li>
				)}
			</ul>
		</div>
	);
}

function NewItemForm() {
	return <div>NewItemForm</div>;
}
