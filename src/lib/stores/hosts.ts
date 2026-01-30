import { writable } from "svelte/store";

export const selectedHost = writable<string>("local");
