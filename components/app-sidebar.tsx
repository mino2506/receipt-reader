"use client";

import { usePathname } from "next/navigation";

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	BarChart3,
	FileEdit,
	FilePlus,
	LayoutDashboard,
	Settings,
} from "lucide-react";

// Menu items.
const items = [
	{
		title: "ダッシュボード",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "登録する",
		url: "/dashboard/receipts/new",
		icon: FilePlus,
	},
	{
		title: "確認する",
		url: "/dashboard/receipts/table",
		icon: FileEdit,
	},
	{
		title: "分析する",
		url: "/dashboard/analytics",
		icon: BarChart3,
	},
	{
		title: "設定",
		url: "#",
		icon: Settings,
	},
];

export function AppSidebar() {
	const pathname = usePathname();

	return (
		<Sidebar>
			<div className="flex h-16 items-center justify-center border-b px-4 text-lg font-bold uppercase">
				Menu
			</div>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Receipt</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => {
								const isActive = pathname === item.url;

								return (
									<SidebarMenuItem
										key={item.title}
										className={`${isActive && "bg-accent text-accent-foreground"}`}
									>
										<SidebarMenuButton asChild>
											<a href={item.url}>
												<item.icon />
												<span>{item.title}</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
