import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const hostParam = event.url.searchParams.get('host');

  // mapping logique
  const agentUrl =
    hostParam === 'local' || !hostParam
      ? 'http://localhost:9100'
      : hostParam;

  const res = await event.fetch(`${agentUrl}/processes`);
  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};
