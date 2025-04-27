"use client";

import { useState } from "react";

import { ItemSelector } from "@/app/components/receipt/ItemSelector";
import type { ReceiptWithItemDetails } from "@/lib/api/receipt/get.schema";

import type { Category, CreateReceiptDetail, Item } from "@/lib/api/receipt";
import {
	CATEGORY_LABELS,
	CURRENCY_LABELS,
	type Currency,
} from "@/lib/api/receipt";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { set } from "lodash";
import { Check, ListPlus } from "lucide-react";

export function NewReceiptDetailRow({
	receipt,
	onCreate,
	onError,
}: {
	receipt: ReceiptWithItemDetails;
	onCreate: (detail: CreateReceiptDetail, item: Item) => void;
	onError: (error: string | null) => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [item, setItem] = useState<Item | null>(null);
	const [amount, setAmount] = useState(1);
	const [unitPrice, setUnitPrice] = useState(0);
	const [subTotalPrice, setSubTotalPrice] = useState(0);
	const [tax, setTax] = useState(0);
	const [currency, setCurrency] = useState<Currency>("JPY");

	const handleCreate = () => {
		setError(null);
		if (!item) {
			setError("商品を選択してください");
			onError(error);
			return;
		}
		const draft: CreateReceiptDetail = {
			receiptId: receipt.id,
			itemId: item.id,
			amount,
			unitPrice,
			subTotalPrice,
			tax,
			currency,
			order: receipt.details.length + 1,
		};

		onCreate(draft, item);
	};

	return (
		<>
			<tr>
				<td className="flex justify-center items-center border table-fixed h-12">
					<ListPlus className="w-5 h-5" />
				</td>
				<td>
					<ItemSelector value={item} onSelect={setItem} />
				</td>
				<td className="border table-fixed text-center px-2 py-1 h-12">
					<div className="flex justify-center text-sm items-center h-full">
						{item ? CATEGORY_LABELS[item?.category as Category] : "-"}
					</div>
				</td>
				<td className="border table-fixed h-12">
					<Input
						type="number"
						defaultValue={amount}
						onChange={(e) => setAmount(Number(e.target.value))}
						className="w-full h-full px-2 py-1 text-sm text-right"
					/>
				</td>
				<td className="border table-fixed h-12">
					<Input
						type="number"
						defaultValue={unitPrice}
						onChange={(e) => setUnitPrice(Number(e.target.value))}
						className="w-full h-full px-2 py-1 text-sm text-right"
					/>
				</td>
				<td className="border table-fixed h-12">
					<Input
						type="number"
						defaultValue={subTotalPrice}
						onChange={(e) => setSubTotalPrice(Number(e.target.value))}
						className="w-full h-full px-2 py-1 text-sm text-right"
					/>
				</td>
				<td className="border table-fixed h-12">
					<Input
						type="number"
						defaultValue={tax}
						onChange={(e) => setTax(Number(e.target.value))}
						className="w-full h-full px-2 py-1 text-sm text-right"
					/>
				</td>
				<td className="border table-fixed h-12">
					<Select
						value={currency}
						onValueChange={(value) => {
							setCurrency(value as Currency);
						}}
					>
						<SelectTrigger className="w-full h-full ">
							<SelectValue placeholder="通貨" />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(CURRENCY_LABELS).map(([key, label]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</td>
				<td className="text-center table-fixed h-12">
					<div className="flex justify-center items-center h-full">
						<Button
							onClick={handleCreate}
							variant="default"
							className="flex gap-1 text-xs sm:text-sm"
						>
							<Check />
							<span className="">登録</span>
						</Button>
					</div>
				</td>
			</tr>
		</>
	);
}
