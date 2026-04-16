<script lang="ts">
  import {
    AppInfo,
    SearchBox,
    RefreshControls,
    PaginationControls,
    ColumnToggle,
    FilterToggle,
  } from "$lib/components";
  import { overlayStore } from "$lib/stores/overlay";
  import { hosts, selectedHost } from "$lib/stores/hosts";
  import { showGraph, toggleGraph, selectedRange, setRange } from "$lib/stores/graph";

  export let searchTerm: string;
  export let itemsPerPage: number;
  export let currentPage: number;
  export let totalPages: number;
  export let totalResults: number;
  export let columns: Array<{
    id: string;
    label: string;
    visible: boolean;
    required?: boolean;
  }>;
  export let refreshRate: number;
  export let isFrozen: boolean;
  export let filters: {
    cpu: { operator: string; value: number; enabled: boolean };
    ram: { operator: string; value: number; enabled: boolean };
    runtime: { operator: string; value: number; enabled: boolean };
    status: { values: string[]; enabled: boolean };
  } = {
    cpu: { operator: ">", value: 50, enabled: false },
    ram: { operator: ">", value: 100, enabled: false },
    runtime: { operator: ">", value: 60, enabled: false },
    status: { values: [], enabled: false },
  };

  $: isAnyOverlayOpen = $overlayStore !== null;
  $: activeOverlayType = $overlayStore;
</script>

<div class="toolbar">
  <div class="toolbar-content">

    <!-- MODE GRAPH -->
    {#if $showGraph}

      <div class="graph-controls">
        <button on:click={toggleGraph}>
          📋 Table
        </button>

        <select
          bind:value={$selectedRange}
          on:change={(e) => setRange(e.target.value)}
        >
          <option value="realtime">Live</option>
          <option value="1m">1m</option>
          <option value="1h">1h</option>
          <option value="10h">10h</option>
          <option value="1d">1d</option>
          <option value="1month">1M</option>
        </select>
        <AppInfo />
        <select bind:value={$selectedHost}>
          <option value="" disabled>
            -- Select agent --
          </option>

          {#each $hosts as host}
            <option value={host.id}>
              {host.id} {host.online ? "🟢" : "🔴"}
            </option>
          {/each}
        </select>
      </div>

    {:else}

      <!-- MODE TABLE (ancien toolbar complet) -->

      <SearchBox bind:searchTerm />

      <div class="graph-controls">
        <button on:click={toggleGraph}>
          📊 Graph
        </button>
      </div>

      <FilterToggle bind:filters />

      <div class="toolbar-spacer"></div>

      <PaginationControls
        bind:itemsPerPage
        bind:currentPage
        {totalPages}
        {totalResults}
      />

      <div class="toolbar-spacer"></div>

      <!-- <ColumnToggle {columns} /> -->

      <RefreshControls bind:refreshRate bind:isFrozen />

      <!-- <AppInfo /> -->

      <select bind:value={$selectedHost}>
        <option value="" disabled>
          -- Select agent --
        </option>

        {#each $hosts as host}
          <option value={host.id}>
            {host.id} {host.online ? "🟢" : "🔴"}
          </option>
        {/each}
      </select>

    {/if}

  </div>
</div>

<style>
  .toolbar {
    padding: 8px;
    border-bottom: 1px solid var(--surface0);
    background-color: var(--mantle);
  }

  .toolbar-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 12px;
    min-width: max-content;
    height: 44px;
    position: relative;
  }

  .toolbar-content > div {
    display: flex;
    align-items: center;
  }

  .toolbar-content :global(.hidden) {
    opacity: 0;
    pointer-events: none;
  }

  .toolbar-spacer {
    flex: 1;
  }

  .graph-controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }

 
</style>
