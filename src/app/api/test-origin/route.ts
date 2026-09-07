export async function POST(req: Request) {
  return Response.json({
    origin: req.headers.get("origin"),
    referer: req.headers.get("referer"),
    userAgent: req.headers.get("user-agent"),
    authorization: req.headers.get("authorization"),
  });
}
