import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

import { AppHeader } from "@/components/app-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="w-full">
				<AppHeader />
				{children}
			</main>
		</SidebarProvider>
	);
}
