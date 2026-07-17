const BACKEND = 'https://grimzone-api.vercel.app';

async function proxy(request) {
  const path = request.nextUrl.pathname;
  const url = `${BACKEND}${path}${request.nextUrl.search}`;
  const headers = new Headers(request.headers);
  headers.delete('host');
  const body = request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined;
  try {
    const res = await fetch(url, { method: request.method, headers, body, redirect: 'manual' });
    const resHeaders = new Headers(res.headers);
    resHeaders.delete('transfer-encoding');
    return new Response(res.body, { status: res.status, headers: resHeaders });
  } catch {
    return Response.json({ error: 'Backend unreachable' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
