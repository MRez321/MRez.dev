// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"; // Adjust path if your auth.ts is elsewhere

export const { GET, POST } = handlers;

// Optional but recommended for Vercel: force dynamic rendering for this route
export const runtime = "nodejs";


// export async function GET() {
//   return new Response("Auth endpoint (placeholder)", { status: 200 });
// }
//
// export async function POST() {
//   return new Response("Auth endpoint (placeholder)", { status: 200 });
// }