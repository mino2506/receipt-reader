import { supabase } from "@/lib/supabase/client";

export async function signInWithGoogle() {
	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `${window.location.origin}/auth/callback`,
		},
	});

	if (error) throw error;
	return data;
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	return { error };
}
