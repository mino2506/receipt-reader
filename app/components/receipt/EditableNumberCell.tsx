"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type EditableNumberCellProps = {
	value: number;
	isEditing: boolean;
	onSubmit: (value: number) => void;
	onEditStart: () => void;
	className?: string;
};

export function EditableNumberCell({
	value,
	isEditing,
	onSubmit,
	onEditStart,
	className,
}: EditableNumberCellProps) {
	return (
		<Input
			type="number"
			defaultValue={value}
			readOnly={!isEditing}
			onBlur={(e) => {
				if (isEditing) onSubmit(Number(e.target.value));
			}}
			onClick={() => {
				if (!isEditing) onEditStart();
			}}
			className={cn(
				"w-full h-9 px-2 py-1 text-sm text-right",
				!isEditing && "bg-transparent border-none text-gray-800 cursor-pointer",
				className,
			)}
		/>
	);
}
