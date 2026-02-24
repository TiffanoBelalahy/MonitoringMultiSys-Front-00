<script lang="ts">
  import { authToken } from "$lib/stores/auth";
  import { goto } from "$app/navigation";

  let email = "";
  let password = "";
  let error = "";
  let loading = false;

  async function handleLogin() {
    loading = true;
    error = "";

    try {
      const res = await fetch("http://51.75.181.183:8081/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await res.json();
      authToken.set(data.token);

      goto("/");
    } catch (err) {
      error = "Email ou mot de passe incorrect";
    } finally {
      loading = false;
    }
  }
</script>

<div class="login-container">
  <div class="login-box">
    <h1>Monitoring Login</h1>

    <input bind:value={email} placeholder="Email" />
    <input type="password" bind:value={password} placeholder="Password" />

    <button on:click={handleLogin} disabled={loading}>
      {loading ? "Connexion..." : "Se connecter"}
    </button>

    {#if error}
      <p class="error">{error}</p>
    {/if}
  </div>
</div>

<style>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--base);
}

.login-box {
  background: var(--surface0);
  padding: 30px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 300px;
}

input {
  padding: 8px;
  border-radius: 6px;
  border: none;
  background: var(--surface1);
  color: var(--text);
}

button {
  padding: 8px;
  border-radius: 6px;
  border: none;
  background: var(--blue);
  color: black;
  cursor: pointer;
}

.error {
  color: var(--red);
  font-size: 14px;
}
</style>