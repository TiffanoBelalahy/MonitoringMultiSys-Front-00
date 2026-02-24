import { writable } from "svelte/store";

const storedToken = localStorage.getItem("token");

export const authToken = writable<string | null>(storedToken);

authToken.subscribe((value) => {
  if (value) {
    localStorage.setItem("token", value);
  } else {
    localStorage.removeItem("token");
  }
});

export function logout() {
  authToken.set(null);
}