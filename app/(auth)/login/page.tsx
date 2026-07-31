// app/login/page.tsx
"use client";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSocialLogin = async (provider: "google" | "github") => {
        await authClient.signIn.social({ provider });
    };

    const handleEmailLogin = async () => {
        await authClient.signIn.email({ email, password });
    };

    const handleEmailSignUp = async () => {
        await authClient.signUp.email({ email, password, name: "New User" });
    };

    return (
        <div className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
            <button onClick={() => handleSocialLogin("google")}>Login with Google</button>
            <button onClick={() => handleSocialLogin("github")}>Login with GitHub</button>

            <div className="flex flex-col gap-2 mt-4">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleEmailSignUp}>Sign Up</button>
                <button onClick={handleEmailLogin}>Login</button>
            </div>
        </div>
    );
}