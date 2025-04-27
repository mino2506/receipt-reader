"use client";

import { Button } from "@/components/ui/button"; // トグルボタン用
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	ChevronLeft,
	ChevronRight,
	FileEdit,
	FilePlus,
	LayoutDashboard,
	PanelLeftClose,
	PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const NAV_MENU_ITEMS = [
	{ href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
	{
		href: "/dashboard/receipts/new",
		label: "レシート登録",
		icon: FilePlus,
	},
	{
		href: "/dashboard/receipts/edit",
		label: "レシート編集",
		icon: FileEdit,
	},
	{ href: "/dashboard/analytics", label: "分析", icon: BarChart3 },
];

export function DashboardSidebar() {
	const [isOpen, setIsOpen] = useState(true);

	return (
		<aside
			className={`fixed inset-y-0 left-0 z-50 border-r border-border bg-background transition-all duration-300 ${
				isOpen ? "w-64" : "w-16"
			}`}
		>
			{/* 上部タイトル＋開閉ボタン */}
			<div className="h-16 flex items-center justify-between px-2 border-b border-border">
				{isOpen && <div className="text-xl font-bold">Menu</div>}
				<Button
					variant="ghost"
					size="icon"
					className="h-12 w-12"
					onClick={() => setIsOpen((prev) => !prev)}
				>
					{/* ここに開閉アイコンを置く（あとで） */}
					{isOpen ? (
						<PanelLeftClose className="h-full w-full" />
					) : (
						<PanelLeftOpen className="h-5 w-5" />
					)}
				</Button>
			</div>

			{/* メニュー */}
			<NavigationMenu
				orientation="vertical"
				className="flex p-2 w-full bg-amber-500"
			>
				<NavigationMenuList className="flex flex-col items-start gap-2 w-full">
					{NAV_MENU_ITEMS.map(({ href, label, icon: Icon }) => (
						<NavigationMenuItem key={href} className="flex w-full">
							<Link href={href} legacyBehavior passHref className="flex w-full">
								<NavigationMenuLink
									className={cn(
										navigationMenuTriggerStyle(),
										"flex w-full items-start",
									)}
								>
									<div className="flex items-center gap-2 w-full">
										<Icon className="h-5 w-5" />
										{isOpen && <span className="w-full">{label}</span>}
									</div>
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
					))}
				</NavigationMenuList>
			</NavigationMenu>
		</aside>
	);
}
