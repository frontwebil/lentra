export async function POST(req: Request) {
  const headers = Object.fromEntries(req.headers.entries());

  console.log(headers);

  return Response.json(headers);
}
