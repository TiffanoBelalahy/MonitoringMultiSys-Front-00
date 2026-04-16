<script lang="ts">
  import { selectedHost, hosts } from "$lib/stores/hosts";
  import { derived } from "svelte/store";
  import { fly, fade } from "svelte/transition";
  import { onMount } from "svelte";
  import type { Host } from "$lib/stores/hosts";
  import { get } from "svelte/store";
  import { loadHosts } from "$lib/stores/hosts";
  
  import {
    AppInfo,
    SearchBox,
    RefreshControls,
    PaginationControls,
    ColumnToggle,
    FilterToggle,
  } from "$lib/components";
  export let columns: {
    id: string;
    label: string;
    visible: boolean;
    required?: boolean;
  }[] = [];

  let isSidebarOpen = false;
  let editingAgent: Host | null = null;
  let newName: string = "";

  type Company = {
    id: number
    name: string
    agents: Host[]
  }

  let companies: Company[] = []

  let showCompanyModal = false;
  let newCompanyName = "";
  let showAssignModal = false;
  let selectedCompanyId: number | null = null;
  let selectedAgentId: string = "";
  let showAgents = false;
  let showCompanies = false;
  let showSettings = false;
    

  async function loadCompanies() {
    const res = await fetch("http://51.75.181.183:8081/api/companies");
    companies = await res.json();
  }
  onMount(() => {
    loadCompanies();
  });

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  const selectedHostName = derived(
    [selectedHost, hosts],
    ([$selectedHost, $hosts]) => {
      return $hosts.find(h => h.id === $selectedHost)?.name || "No agent";
    }
  );

  function startRename(agent: Host) {
    editingAgent = agent;
    newName = agent.name;
  }

  async function saveRename() {
    if (!editingAgent) return;

    await fetch(`http://51.75.181.183:8081/api/agents/${editingAgent.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName })
    });

    // 🔥 update store
    const currentHosts = get(hosts);

    hosts.set(
      currentHosts.map(h =>
        h.id === editingAgent!.id
          ? { ...h, name: newName }
          : h
      )
    );

    editingAgent = null;
  }

  async function createCompany() {

    const res = await fetch("http://51.75.181.183:8081/api/companies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: newCompanyName
      })
    })

    const company = await res.json()

    companies = [...companies, { ...company, agents: [] }]

    newCompanyName = ""
    showCompanyModal = false
  }


  async function assignAgent() {

    if (!selectedAgentId) return;

    await fetch(`http://51.75.181.183:8081/api/agents/${selectedAgentId}/assign`,{
      method:"PUT",
      headers:{ "Content-Type":"application/json"},
      body: JSON.stringify({
        company_id: selectedCompanyId
      })
    });

    await loadCompanies();
    await loadHosts();

    showAssignModal = false;
  }
  
</script>

<div class="title-bar">
  
  <!-- LEFT : HAMBURGER -->
  <div class="left">
    <button class="menu-btn" on:click={toggleSidebar}>
      ☰
    </button>
  </div>

  <!-- CENTER : TITLE -->
  <div class="title" data-tauri-drag-region>
    <div class="neon">MonitoringMultiSystem</div>
  </div>

  <!-- RIGHT : SELECTED HOST -->
  <div class="right">
    {$selectedHostName}
  </div>

</div>

<!-- SIDEBAR -->
{#if isSidebarOpen}
  <!-- OVERLAY -->
  <div
    class="overlay"
    role="button"
    tabindex="0"
    on:click={() => isSidebarOpen = false}
    on:keydown={(e) => e.key === "Enter" && (isSidebarOpen = false)}
  ></div>

  <!-- SIDEBAR -->
  <div 
    class="sidebar"
    transition:fly={{ x: -250, duration: 550 }}
  >
    <button class="section-header" on:click={() => showAgents = !showAgents}>
      <span>Agents</span>
      <span>{showAgents ? "▼" : "▶"}</span>
    </button>
    {#if showAgents}
      {#each $hosts as host}
        <div class="agent-row">

          <button
            class="sidebar-item"
            on:click={() => {
              selectedHost.set(host.id);
              isSidebarOpen = false;
            }}
          >
            {host.name} {host.online ? "🟢" : "🔴"}
          </button>

          <button
            class="edit-btn"
            on:click={() => startRename(host)}
          >
            ✏️
          </button>

        </div>
      {/each}
    {/if}

    {#if editingAgent}
      <div class="rename-modal">

        <div class="rename-box">

          <h3>Rename agent</h3>

          <input bind:value={newName} />

          <div class="buttons">
            <button on:click={saveRename}>Save</button>
            <button on:click={() => editingAgent = null}>Cancel</button>
          </div>

        </div>

      </div>
    {/if}

    {#if showCompanyModal}

      <div class="rename-modal">

        <div class="rename-box">

          <h3>New Company</h3>

          <input bind:value={newCompanyName} placeholder="Company name"/>

          <div class="buttons">
            <button on:click={createCompany}>Create</button>
            <button on:click={() => showCompanyModal = false}>Cancel</button>
          </div>

        </div>

      </div>

    {/if}
    {#if showAssignModal}
      <div class="rename-modal">
        <div class="rename-box">

          <h3>Assign Agent</h3>

          <select bind:value={selectedAgentId}>
            <option value="">Select agent</option>

            {#each $hosts.filter(h => !h.company_id) as host}
              <option value={host.id}>{host.name}</option>
            {/each}
          </select>

          <div class="buttons">
            <button on:click={assignAgent}>Assign</button>
            <button on:click={() => showAssignModal = false}>Cancel</button>
          </div>

        </div>
      </div>
    {/if}


    <div class="company-header">
      <button class="section-header" on:click={() => showCompanies = !showCompanies}>
        <span>Entreprise</span>
        <span>{showCompanies ? "▼" : "▶"}</span>
      </button>

      <button on:click={() => showCompanyModal = true}>+</button>
    </div>
    {#if showCompanies}
      {#each companies as company}

        <div class="company-row">

          <div class="company-name">
            {company.name}
            <button on:click={() => {
                selectedCompanyId = company.id;
                showAssignModal = true;
              }}>
                +
              </button>
          </div>

          {#each $hosts.filter(h => h.company_id && h.company_id === company.id) as agent}

            <div class="sidebar-item agent">
              &emsp; - {agent.name}
            </div>

          {/each}

        </div>

      {/each}
    {/if}

    <button class="section-header" on:click={() => showSettings = !showSettings}>
      <span>Settings</span>
      <span>{showSettings ? "▼" : "▶"}</span>
    </button>
    {#if showSettings}
      <div class="sidebar-item"><AppInfo /></div>
      <div class="sidebar-item"><ColumnToggle {columns} /></div>
    {/if}

  </div>
{/if}

<style>
  .title-bar {
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    background: var(--mantle);
    position: relative;
  }

  .left {
    width: 60px;
  }

  .menu-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--text);
  }

  .title {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .neon {
    font-family: "Courier New", monospace;
    font-size: 14px;
    font-weight: bold;
    color: var(--text);
  }

  .right {
    width: 120px;
    text-align: right;
    font-size: 13px;
    color: var(--text);
  }

  .sidebar {
    position: fixed;
    top: 32px;
    left: 0;
    width: 220px;
    height: calc(100vh - 32px);
    background: var(--base);
    border-right: 1px solid var(--surface0);
    padding: 16px;
    overflow-y: auto;
    z-index: 999;
  }

  .sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar::-webkit-scrollbar-thumb {
    background: var(--surface1);
    border-radius: 4px;
  }

  .sidebar::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar-item {
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    color: var(--text);
  }

  .sidebar-item:hover {
    background: var(--surface0);
  }
  .overlay {
  position: fixed;
  top: 32px;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;
}

.rename-modal{
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background:rgba(0,0,0,0.4);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:2000;
}

.rename-box{
  background:var(--base);
  padding:20px;
  border-radius:8px;
  width:250px;
}

.rename-box input{
  width:100%;
  margin-top:10px;
  padding:6px;
}

.buttons{
  margin-top:10px;
  display:flex;
  justify-content:space-between;
}
.agent-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.edit-btn{
  background:none;
  border:none;
  cursor:pointer;
  font-size:14px;
}
.company-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.company-name{
  font-weight:white;
  padding:6px;
}

.section-header {
 display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  font-weight: bold;
  color: var(--text);
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  font-size: 17px;
  
}

.section-header:hover {
  background: var(--surface0);
  border-radius: 4px;
}


</style>