"use client";

import { trpc } from "@/lib/trpc/client";
import { type ChangeEvent, useState } from "react";

import {
	CATEGORY_LABELS,
	type Category,
	CategoryEnum,
	type Item,
} from "@/lib/api/receipt";
import { CreateItemSchema, ItemSchema } from "@/lib/api/receipt";

export function NewItemForm({
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
