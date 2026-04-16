import { writable } from "svelte/store";
import { getAgents } from "$lib/utils/api";

export type Host = {
  id: string;
  name: string;
  online: boolean;
  company_id?: number;
};

export const hosts = writable<Host[]>([]);
export const selectedHost = writable<string | null>(null);

// Auto-select first host when hosts list is filled
export async function loadHosts() {
  const data = await getAgents();

  const formatted = data.map((a) => ({
    id: a.id,
    name: a.name,
    online: true, // TODO: Add online status from API
    company_id: a.company_id,
  }));

  hosts.set(formatted);

  if (formatted.length > 0) {
    selectedHost.set(formatted[0].id);
  }
}
