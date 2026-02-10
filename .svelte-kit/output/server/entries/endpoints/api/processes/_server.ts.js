const GET = async (event) => {
  const hostParam = event.url.searchParams.get("host");
  const agentUrl = hostParam === "local" || !hostParam ? "http://localhost:9100" : hostParam;
  const res = await event.fetch(`${agentUrl}/processes`);
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
};
export {
  GET
};
