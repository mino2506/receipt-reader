"use client";

import { createClient as createBrowserClient } from "@/utils/supabase/client";
import type { Session } from "@supabase/supabase-js";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

type SessionContextType = {
	session: Session | null;
	loading: boolean;
};

export const SessionContext = createContext<SessionContextType | undefined>(
	undefined,
);

export function SessionProvider({ children }: { children: ReactNode }) {
	const supabase = createBrowserClient();
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
			setLoading(false);
		};
		// console.log("fetchSession START");
		fetchSession();
		// console.log("fetchSession END");
		// console.log("[SessionProvider] session:", session);

		// console.log("\n\n");
		// console.log("listenSessionChange START");
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});
		// console.log("listenSessionChange END");
		// console.log("[SessionProvider] subscription:", subscription);

		return () => subscription.unsubscribe();
	}, [supabase]);

	return (
		<SessionContext.Provider value={{ session, loading }}>
			{children}
		</SessionContext.Provider>
	);
}
