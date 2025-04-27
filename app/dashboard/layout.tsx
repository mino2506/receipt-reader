import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { DashboardHeader } from "./DashboardHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main>
				<SidebarTrigger />
				{children}
			</main>
		</SidebarProvider>
	);
}
