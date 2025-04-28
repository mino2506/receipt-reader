// app/login/page.tsx

import EmailSignInForm from "@/app/components/EmailSignInForm";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";

export default function LoginPage() {
	return (
		<div className="h-screen flex items-center justify-center">
			<div className="m-2 p-3 rounded shadow-md max-w-md w-full">
				<form className="p-3 rounded shadow-lg max-w-md w-full">
					<GoogleSignInButton />
					<EmailSignInForm />
				</form>
			</div>
		</div>
	);
}
