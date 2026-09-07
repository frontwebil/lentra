export async function POST(req: Request) {
  const headers = Object.fromEntries(req.headers.entries());

  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

  console.log("IP:", ip);
  console.log("Headers:", headers);

  return Response.json({
    ip,
    headers,
  });
}