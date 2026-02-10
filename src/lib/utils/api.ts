const BASE_URL = import.meta.env.VITE_API_URL || "";

export const api = {
  // async getProcesses(host: string) {
  //   const res = await fetch(`${BASE_URL}/api/processes?host=${host}`);
  //   if (!res.ok) throw new Error("Failed to fetch processes");
  //   return res.json() as Promise<[any[], any]>;
  // },
  async getProcesses(agentId: string) {
    const res = await fetch(`${BASE_URL}/api/processes?agent_id=${agentId}`);
    if (!res.ok) throw new Error("Failed to fetch processes");
    return res.json() as Promise<{
      processes: any[];
      systemStats: any;
    }>;
  },


  async killProcess(host: string, pid: number) {
    const res = await fetch(`${BASE_URL}/api/processes/kill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, pid }),
    });
    if (!res.ok) throw new Error("Failed to kill process");
    return res.json() as Promise<boolean>;
  },
};

export async function getAgents() {
  //const res = await fetch("http://localhost:8081/api/agents");
  const res = await fetch(`${BASE_URL}/api/agents`);

  if (!res.ok) {
    throw new Error("Failed to fetch agents");
  }

  return res.json();
}
