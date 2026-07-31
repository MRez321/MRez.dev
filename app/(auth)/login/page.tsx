// app/login/page.tsx
"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSocialLogin = async (provider: "google" | "github") => {
        await authClient.signIn.social({
            provider,
            callbackURL: "/dashboard" // Redirect here after OAuth
        });
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/dashboard"
        });
        if (!error) {
            router.push("/dashboard");
        } else {
            alert(error.message);
        }
    };

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await authClient.signUp.email({
            email,
            password,
            name: email.split("@")[0],
            callbackURL: "/dashboard"
        });
        if (!error) {
            router.push("/dashboard");
        } else {
            alert(error.message);
        }
    };

    return (
        <div className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
            <button
                onClick={() => handleSocialLogin("google")}
                className="p-2 border rounded hover:bg-gray-50"
            >
                Login with Google
            </button>
            <button
                onClick={() => handleSocialLogin("github")}
                className="p-2 border rounded hover:bg-gray-50"
            >
                Login with GitHub
            </button>

            <form onSubmit={handleEmailLogin} className="flex flex-col gap-2 mt-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-2 border rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 border rounded"
                    required
                />
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={handleEmailSignUp}
                        className="flex-1 p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    );
}