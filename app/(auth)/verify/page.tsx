import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Check your inbox</CardTitle>
        <CardDescription>
          A verification link has been sent to your email address.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild variant="outline">
          <Link href="/signin">Back to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
