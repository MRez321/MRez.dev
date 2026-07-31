// app/actions/auth.ts
"use server";

import { signIn as authSignIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await authSignIn("credentials", {
      email,
      password,
      redirect: false, // We handle redirects manually to show error messages
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
  // Redirect on success
  return { success: true, redirectTo: "/dashboard" };
}

export async function signInWithOAuth(provider: "google" | "github") {
  await authSignIn(provider, { redirectTo: "/dashboard" });
}