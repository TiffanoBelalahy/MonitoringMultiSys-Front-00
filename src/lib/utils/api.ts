import { get } from "svelte/store";
import { authToken } from "$lib/stores/auth";
const BASE_URL = import.meta.env.VITE_API_URL || "";

export const api = {
  // async getProcesses(host: string) {
  //   const res = await fetch(`${BASE_URL}/api/processes?host=${host}`);
  //   if (!res.ok) throw new Error("Failed to fetch processes");
  //   return res.json() as Promise<[any[], any]>;
  // },
  async getProcesses(agentId: string) {
    const res = await fetch(
      `${BASE_URL}/api/processes?agent_id=${agentId}`,
      { headers: getAuthHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch processes");
    return res.json() as Promise<{
      processes: any[];
      systemStats: any;
    }>;
  },


  async killProcess(agentId: string, pid: number) {
    const res = await fetch(`${BASE_URL}/api/processes/kill`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ agent_id: agentId, pid }),
    });
    if (!res.ok) throw new Error("Failed to kill process");
    return res.json() as Promise<boolean>;
  },
};

export async function getAgents() {
  //const res = await fetch("http://localhost:8081/api/agents");
  const res = await fetch(`${BASE_URL}/api/agents`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch agents");
  }

  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}



function getAuthHeaders() {
  const token = get(authToken);

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}