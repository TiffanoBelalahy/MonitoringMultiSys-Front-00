import { writable } from "svelte/store";
import { getAgents } from "$lib/utils/api";

export type Host = {
  id: string;
  online: boolean;
};

export const hosts = writable<Host[]>([]);
export const selectedHost = writable<string | null>(null);

// Auto-select first host when hosts list is filled
export async function loadHosts() {
  const data = await getAgents();
  hosts.set(data);

  if (data.length > 0) {
    selectedHost.set(data[0].id);
  }
}
