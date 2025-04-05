// app/login/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
	const supabase = await createClient();
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		console.error("ログイン失敗:", error.message);
		return;
	}

	redirect("/dashboard"); // ログイン後に遷移させたい場所
}

export async function signup(formData: FormData) {
	const supabase = await createClient();
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	const { error } = await supabase.auth.signUp({
		email,
		password,
	});

	if (error) {
		console.error("サインアップ失敗:", error.message);
		return;
	}

	redirect("/dashboard"); // サインアップ後に遷移させたい場所
}
