export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch('https://grimzone-api.vercel.app/api/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: body.username, password: body.password }),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}