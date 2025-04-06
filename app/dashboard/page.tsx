// app/dashboard/page.tsx

"use client";

import SignOutButton from "@/app/components/SignOutButton";
import { useSession } from "@/context/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
	const router = useRouter();
	const { session, loading } = useSession();

	useEffect(() => {
		if (!loading && !session) {
			router.push("/login");
		}
	});

	if (loading) return <div>読み込み中...</div>;

	if (session) {
		return (
			<>
				<SignOutButton />
				<div>ようこそ、{session.user.email} さん！</div>
			</>
		);
	}
}
