// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);




//
// export async function GET() {
//   return new Response("Auth endpoint (placeholder)", { status: 200 });
// }
//
// export async function POST() {
//   return new Response("Auth endpoint (placeholder)", { status: 200 });
// }