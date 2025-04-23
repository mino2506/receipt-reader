"use client";

import {
	CATEGORY_LABELS,
	type Category,
	CategoryEnum,
	type Item,
} from "@/lib/api/receipt";
import { CreateItemSchema, ItemSchema } from "@/lib/api/receipt";
import { trpc } from "@/lib/trpc/client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";

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

	const handleSubmit = () => {
		const parsed = CreateItemSchema.safeParse({ rawName: name, category });
		if (!parsed.success) {
			console.error("Invalid item data:", parsed.error.message);
			return;
		}
		mutation.mutate(parsed.data);
	};

	return (
		<div className="p-2 mt-1 space-y-2 bg-gray-50 rounded-md border">
			<Input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="商品名を入力..."
				className="p-2 border rounded-md shadow-sm bg-white space-y-2"
			/>

			<div className="flex gap-2">
				<Select
					value={category}
					onValueChange={(value) => {
						const parsed = CategoryEnum.safeParse(value);
						if (parsed.success) setCategory(parsed.data);
					}}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="カテゴリ選択" />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(CATEGORY_LABELS).map(([key, label]) => (
							<SelectItem key={key} value={key}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<div className="flex flex-wrap sm:flex-nowrap gap-2">
					<Button
						type="submit"
						variant="default"
						onClick={handleSubmit}
						disabled={mutation.isPending}
						className="flex items-center gap-1 text-xs sm:text-sm"
					>
						<Check />
						<span className="hidden sm:inline">登録</span>
					</Button>
					{onCancel && (
						<Button
							type="button"
							variant="ghost"
							onClick={onCancel}
							className="flex items-center gap-1 text-xs sm:text-sm text-gray-500"
						>
							<X />
							<span className="hidden sm:inline">キャンセル</span>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
