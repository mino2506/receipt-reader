// app/login/page.tsx

import EmailSignInForm from "@/app/components/EmailSignInForm";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";

export default function LoginPage() {
	return (
		<div className="h-screen flex items-center justify-center bg-gray-700">
			<div className="m-2 p-3 rounded shadow-md max-w-md w-full bg-gray-300">
				<form className="p-3 rounded shadow-lg max-w-md w-full bg-gray-300">
					<GoogleSignInButton />
					<EmailSignInForm />
				</form>
			</div>
		</div>
	);
}
