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
		title: "レシート登録",
		url: "/dashboard/receipts/new",
		icon: FilePlus,
	},
	{
		title: "レシート編集",
		url: "/dashboard/receipts/edit",
		icon: FileEdit,
	},
	{
		title: "分析",
		url: "/dashboard/analytics",
		icon: BarChart3,
	},
	{
		title: "Settings",
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
