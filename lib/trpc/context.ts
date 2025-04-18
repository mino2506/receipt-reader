import { createClient as createServerClient } from "@/lib/supabase/server";

export const createContext = async () => {
	const supabase = await createServerClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return { user, supabase };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
