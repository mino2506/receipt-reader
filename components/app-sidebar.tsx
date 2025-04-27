import {
	BarChart3,
	FileEdit,
	FilePlus,
	LayoutDashboard,
	Settings,
} from "lucide-react";

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
	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Application</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{items.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
