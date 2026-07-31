// internal blog API


export async function GET() {
  return new Response("OK", { status: 200 });
}

// If your health endpoint might be called with POST, add:
export async function POST() {
  return new Response("OK", { status: 200 });
}
