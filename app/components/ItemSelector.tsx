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

	const handleCreated = (item: Item) => {
		setInput(item.rawName);
		onSelect(item);
		setShowNewItemForm(false);
	};

	return (
		<div className="relative">
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
						<NewItemForm initialName={input} onCreated={handleCreated} />
					</li>
				)}
			</ul>
		</div>
	);
}

import type { ChangeEvent } from "react";

import {
	CATEGORY_LABELS,
	type Category,
	CategoryEnum,
} from "@/lib/api/receipt";
import { CreateItemSchema, ItemSchema } from "@/lib/api/receipt";

function NewItemForm({
	initialName,
	onCreated,
	onCancel,
}: {
	initialName: string;
	onCreated: (item: Item) => void;
	onCancel?: () => void;
}) {
	const [name, setName] = useState(initialName);
	const [category, setCategory] = useState<Category>("food");

	const mutation = trpc.item.create.useMutation({
		onSuccess: (data) => {
			const parsed = ItemSchema.safeParse(data);
			if (!parsed.success) {
				console.error("Invalid item data:", parsed.error.message);
				return;
			}
			onCreated(parsed.data);
		},
	});

	const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
		const parsed = CategoryEnum.safeParse(e.target.value);
		if (!parsed.success) {
			console.error("Invalid category:", parsed.error.message);
			return;
		}
		setCategory(parsed.data);
	};

	const handleSubmit = () => {
		const parsed = CreateItemSchema.safeParse({ rawName: name, category });
		if (!parsed.success) {
			console.error("Invalid item data:", parsed.error.message);
			return;
		}
		mutation.mutate(parsed.data);
	};

	return (
		<div className="p-2 mt-1 bg-gray-100">
			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="商品名"
				className="border px-1 py-0.5 mr-2 hover:bg-blue-100 cursor-text"
			/>
			<select
				value={category}
				onChange={(e) => handleSelect(e)}
				className="cursor-pointer"
			>
				{Object.entries(CATEGORY_LABELS).map(([key, value]) => (
					<option key={key} value={key}>
						{value}
					</option>
				))}
			</select>
			<button
				type="submit"
				disabled={mutation.isPending}
				onClick={
					() => mutation.mutate({ rawName: name, category }) // normalized はサーバー側で処理
				}
				className="ml-2 text-green-700 hover:bg-green-100 cursor-pointer"
			>
				登録
			</button>
			{onCancel && (
				<button type="button" onClick={onCancel} className="ml-1 text-gray-500">
					キャンセル
				</button>
			)}
		</div>
	);
}
