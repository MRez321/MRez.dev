import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/api/queries";
import { SignInForm } from "@/components/auth/signin-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SignInPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your MRez account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  );
}
