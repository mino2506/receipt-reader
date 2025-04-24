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
import { Check, ListPlus } from "lucide-react";

export function NewReceiptDetailRow({
	receipt,
	onCreate,
	onError,
}: {
	receipt: ReceiptWithItemDetails;
	onCreate: (data: CreateReceiptDetail) => void;
	onError: (error: string | null) => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [item, setItem] = useState<Item | null>(null);
	const [amount, setAmount] = useState(1);
	const [unitPrice, setUnitPrice] = useState(0);
	const [subTotalPrice, setSubTotalPrice] = useState(0);
	const [tax, setTax] = useState(0);
	const [currency, setCurrency] = useState<Currency>("JPY");
	const [isCurrencyEditing, setIsCurrencyEditing] = useState(false);
	const [currencyInput, setCurrencyInput] = useState<string>("");

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

		onCreate(draft);
	};

	return (
		<>
			<tr>
				<td className="border h-13">
					<ListPlus className="text-center text-sm w-[48px]" />
				</td>
				<td>
					<ItemSelector value={item} onSelect={setItem} />
				</td>
				<td className="border text-center px-2 py-1 h-13">
					<div className="flex justify-center text-sm items-center h-full">
						{CATEGORY_LABELS[item?.category as Category]}
					</div>
				</td>
				<td className="border px-2 py-1 h-13">
					<input
						type="number"
						value={amount}
						onChange={(e) => setAmount(Number(e.target.value))}
						className="text-right w-full text-sm"
					/>
				</td>
				<td className="border px-2 py-1 h-13">
					<input
						type="unitPrice"
						value={unitPrice}
						onChange={(e) => setUnitPrice(Number(e.target.value))}
						className="text-right w-full text-sm"
					/>
				</td>
				<td className="border px-2 py-1 h-13">
					<input
						type="subTotalPrice"
						value={subTotalPrice}
						onChange={(e) => setSubTotalPrice(Number(e.target.value))}
						className="text-right w-full text-sm"
					/>
				</td>
				<td className="border px-2 py-1 h-13">
					<input
						type="tax"
						value={tax}
						onChange={(e) => setTax(Number(e.target.value))}
						className="text-right w-full text-sm"
					/>
				</td>
				<td className="border px-2 py-1 h-13">
					<div className="relative">
						<input
							type="text"
							value={currencyInput}
							onFocus={() => setIsCurrencyEditing(true)}
							onBlur={(e) => {
								setIsCurrencyEditing(false);
								setCurrencyInput(e.target.value);
							}}
							onChange={(e) => setCurrencyInput(e.target.value)}
							className="text-center w-full h-full text-sm"
							placeholder="円..."
						/>
					</div>
					{isCurrencyEditing && (
						<ul className="absolute z-10 bg-white border w-full shadow text-sm">
							{Object.entries(CURRENCY_LABELS)
								.filter(
									([k, v]) =>
										k.includes(currencyInput) || v.includes(currencyInput),
								)
								.map(([key, label]) => (
									// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
									<li
										key={key}
										className="px-2 py-1 hover:bg-blue-100 cursor-pointer"
										onClick={() => setCurrency(key as Currency)}
									>
										{label}
									</li>
								))}
						</ul>
					)}
				</td>
				<td className="text-center h-13">
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
