import { a as store_get, u as unsubscribe_stores, b as bind_props, c as attr_class, e as ensure_array_like, d as attr, f as attr_style, g as stringify, s as slot, h as store_mutate } from "../../chunks/index2.js";
import { a1 as ssr_context, a2 as fallback, a0 as escape_html } from "../../chunks/context.js";
import "clsx";
import { w as writable, g as get } from "../../chunks/index.js";
import { faChevronDown, faChevronRight, faPlay, faPause, faFilter, faThumbtack, faInfoCircle, faXmark, faMicrochip, faMemory, faHardDrive, faServer, faNetworkWired, faTerminal, faCodeFork, faList, faInfo } from "@fortawesome/free-solid-svg-icons";
import * as SimpleIcons from "simple-icons";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function formatMemorySize(bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}
function formatPercentage(value) {
  return `${value.toFixed(1)}%`;
}
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return `${days}d ${hours}h ${minutes}m`;
}
function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
const regexCache = /* @__PURE__ */ new Map();
function filterProcesses(processes, searchTerm, filters) {
  if (searchTerm.length === 0 && !Object.values(filters).some((f) => f.enabled)) {
    return processes;
  }
  const terms = searchTerm.length > 0 ? searchTerm.split(",").map((term) => term.trim()) : [];
  return processes.filter((process) => {
    if (filters.status.enabled && filters.status.values.length > 0) {
      if (!filters.status.values.includes(process.status)) {
        return false;
      }
    }
    if (filters.cpu.enabled) {
      const cpuValue = process.cpu_usage;
      if (!compareValue(cpuValue, filters.cpu.operator, filters.cpu.value)) {
        return false;
      }
    }
    if (filters.ram.enabled) {
      const ramMB = process.memory_usage / (1024 * 1024);
      if (!compareValue(ramMB, filters.ram.operator, filters.ram.value)) {
        return false;
      }
    }
    if (filters.runtime.enabled) {
      const runtimeMin = process.run_time / 60;
      if (!compareValue(
        runtimeMin,
        filters.runtime.operator,
        filters.runtime.value
      )) {
        return false;
      }
    }
    if (terms.length === 0) {
      return true;
    }
    const processNameLower = process.name.toLowerCase();
    const processCommandLower = process.command.toLowerCase();
    const processPidString = process.pid.toString();
    return terms.some((term) => {
      const termLower = term.toLowerCase();
      if (processNameLower.includes(termLower) || processCommandLower.includes(termLower) || processPidString.includes(term)) {
        return true;
      }
      try {
        let regex = regexCache.get(term);
        if (!regex) {
          regex = new RegExp(term, "i");
          regexCache.set(term, regex);
        }
        return regex.test(process.name);
      } catch {
        return false;
      }
    });
  });
}
function compareValue(value, operator, target) {
  switch (operator) {
    case ">":
      return value > target;
    case "<":
      return value < target;
    case "=":
      return value === target;
    case ">=":
      return value >= target;
    case "<=":
      return value <= target;
    default:
      return true;
  }
}
const isPinned = /* @__PURE__ */ new Map();
function sortProcesses(processes, sortConfig, pinnedProcesses) {
  isPinned.clear();
  return [...processes].sort((a, b) => {
    let aPin = pinnedProcesses.has(a.command);
    isPinned.set(a.command, aPin);
    let bPin = pinnedProcesses.has(b.command);
    isPinned.set(b.command, bPin);
    if (aPin !== bPin) {
      return aPin ? -1 : 1;
    }
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    if (sortConfig.field === "disk_usage") {
      const aRead = aValue[0];
      const aWrite = aValue[1];
      const bRead = bValue[0];
      const bWrite = bValue[1];
      const totalReads = aRead + bRead;
      const totalWrites = aWrite + bWrite;
      if (totalWrites > totalReads * 1.5) {
        if (aWrite !== bWrite) {
          return direction * (aWrite - bWrite);
        }
        return direction * (aRead - bRead);
      } else if (totalReads > totalWrites * 1.5) {
        if (aRead !== bRead) {
          return direction * (aRead - bRead);
        }
        return direction * (aWrite - bWrite);
      } else {
        const aTotalDisk = aRead + aWrite;
        const bTotalDisk = bRead + bWrite;
        if (aTotalDisk !== bTotalDisk) {
          return direction * (aTotalDisk - bTotalDisk);
        }
        const aMaxDisk = Math.max(aRead, aWrite);
        const bMaxDisk = Math.max(bRead, bWrite);
        return direction * (aMaxDisk - bMaxDisk);
      }
    }
    if (typeof aValue === "string") {
      return direction * aValue.localeCompare(bValue);
    }
    return direction * (Number(aValue) - Number(bValue));
  });
}
const BASE_URL = "http://51.75.181.183:8081";
const api = {
  // async getProcesses(host: string) {
  //   const res = await fetch(`${BASE_URL}/api/processes?host=${host}`);
  //   if (!res.ok) throw new Error("Failed to fetch processes");
  //   return res.json() as Promise<[any[], any]>;
  // },
  async getProcesses(agentId) {
    const res = await fetch(`${BASE_URL}/api/processes?agent_id=${agentId}`);
    if (!res.ok) throw new Error("Failed to fetch processes");
    return res.json();
  },
  async killProcess(host, pid) {
    const res = await fetch(`${BASE_URL}/api/processes/kill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host, pid })
    });
    if (!res.ok) throw new Error("Failed to kill process");
    return res.json();
  }
  

};
const hosts = writable([]);
const selectedHost = writable(null);
function createOverlayStore() {
  const { subscribe, set } = writable(null);
  return {
    subscribe,
    open: (overlayType) => set(overlayType),
    close: () => set(null),
    isOpen: (overlayType) => {
      let currentValue = null;
      subscribe((value) => currentValue = value)();
      return currentValue === overlayType;
    }
  };
}
const overlayStore = createOverlayStore();
function ToolBar($$renderer, $$props) {
  var $$store_subs;
  let isAnyOverlayOpen, activeOverlayType;
  let searchTerm = $$props["searchTerm"];
  let itemsPerPage = $$props["itemsPerPage"];
  let currentPage = $$props["currentPage"];
  let totalPages = $$props["totalPages"];
  let totalResults = $$props["totalResults"];
  let columns = $$props["columns"];
  let refreshRate = $$props["refreshRate"];
  let isFrozen = $$props["isFrozen"];
  let filters = fallback(
    $$props["filters"],
    () => ({
      cpu: { operator: ">", value: 50, enabled: false },
      ram: { operator: ">", value: 100, enabled: false },
      runtime: { operator: ">", value: 60, enabled: false },
      status: { values: [], enabled: false }
    }),
    true
  );
  isAnyOverlayOpen = store_get($$store_subs ??= {}, "$overlayStore", overlayStore) !== null;
  activeOverlayType = store_get($$store_subs ??= {}, "$overlayStore", overlayStore);
  let $$settled = true;
  let $$inner_renderer;
  function $$render_inner($$renderer2) {
    $$renderer2.push(`<div class="toolbar svelte-fm9zcz"><div${attr_class("toolbar-content svelte-fm9zcz", void 0, { "overlay-mode": isAnyOverlayOpen })}><div${attr_class("svelte-fm9zcz", void 0, {
      "hidden": isAnyOverlayOpen && activeOverlayType !== "searchHelp"
    })}>`);
    SearchBox($$renderer2, {
      get searchTerm() {
        return searchTerm;
      },
      set searchTerm($$value) {
        searchTerm = $$value;
        $$settled = false;
      }
    });
    $$renderer2.push(`<!----></div> <div${attr_class("svelte-fm9zcz", void 0, {
      "hidden": isAnyOverlayOpen && activeOverlayType !== "filters"
    })}>`);
    FilterToggle($$renderer2, {
      get filters() {
        return filters;
      },
      set filters($$value) {
        filters = $$value;
        $$settled = false;
      }
    });
    $$renderer2.push(`<!----></div> <div${attr_class("toolbar-spacer svelte-fm9zcz", void 0, { "hidden": isAnyOverlayOpen })}></div> <div${attr_class("svelte-fm9zcz", void 0, {
      "hidden": isAnyOverlayOpen && activeOverlayType !== "pagination"
    })}>`);
    PaginationControls($$renderer2, {
      totalPages,
      totalResults,
      get itemsPerPage() {
        return itemsPerPage;
      },
      set itemsPerPage($$value) {
        itemsPerPage = $$value;
        $$settled = false;
      },
      get currentPage() {
        return currentPage;
      },
      set currentPage($$value) {
        currentPage = $$value;
        $$settled = false;
      }
    });
    $$renderer2.push(`<!----></div> <div${attr_class("toolbar-spacer svelte-fm9zcz", void 0, { "hidden": isAnyOverlayOpen })}></div> <div${attr_class("svelte-fm9zcz", void 0, {
      "hidden": isAnyOverlayOpen && activeOverlayType !== "columns"
    })}>`);
    ColumnToggle($$renderer2, { columns });
    $$renderer2.push(`<!----></div> <div${attr_class("svelte-fm9zcz", void 0, {
      "hidden": isAnyOverlayOpen && activeOverlayType !== "refresh"
    })}>`);
    RefreshControls($$renderer2, {
      get refreshRate() {
        return refreshRate;
      },
      set refreshRate($$value) {
        refreshRate = $$value;
        $$settled = false;
      },
      get isFrozen() {
        return isFrozen;
      },
      set isFrozen($$value) {
        isFrozen = $$value;
        $$settled = false;
      }
    });
    $$renderer2.push(`<!----></div> <div${attr_class("svelte-fm9zcz", void 0, { "hidden": isAnyOverlayOpen && activeOverlayType !== "theme" })}>`);
    AppInfo($$renderer2);
    $$renderer2.push(`<!----></div> <div${attr_class("svelte-fm9zcz", void 0, { "hidden": isAnyOverlayOpen })}>`);
    $$renderer2.select(
      {
        value: store_get($$store_subs ??= {}, "$selectedHost", selectedHost)
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "", disabled: true }, ($$renderer4) => {
          $$renderer4.push(`-- Select agent --`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$hosts", hosts));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let host = each_array[$$index];
          $$renderer3.option({ value: host.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(host.id)} ${escape_html(host.online ? "🟢" : "🔴")}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div></div></div>`);
  }
  do {
    $$settled = true;
    $$inner_renderer = $$renderer.copy();
    $$render_inner($$inner_renderer);
  } while (!$$settled);
  $$renderer.subsume($$inner_renderer);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, {
    searchTerm,
    itemsPerPage,
    currentPage,
    totalPages,
    totalResults,
    columns,
    refreshRate,
    isFrozen,
    filters
  });
}
function SearchBox($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let showHelp, hasActiveSearch;
    let searchTerm = $$props["searchTerm"];
    let placeholderIndex = 0;
    const searchExamples = [
      {
        query: "systemd, dbus",
        description: "Multiple terms (comma-separated)",
        type: "multi"
      },
      {
        query: "d$",
        description: "Processes ending with 'd' (daemons)",
        type: "regex"
      },
      {
        query: "^kernel",
        description: "Kernel processes",
        type: "regex"
      },
      {
        query: "ssh.*server",
        description: "SSH server processes",
        type: "regex"
      },
      { query: "1234", description: "Search by PID", type: "pid" },
      {
        query: "python, node, nginx",
        description: "Find web/app server processes",
        type: "multi"
      },
      {
        query: "docker, containerd",
        description: "Container processes",
        type: "multi"
      },
      {
        query: "gnome, plasma",
        description: "Desktop environment processes",
        type: "multi"
      }
    ];
    const placeholders = [
      "Search processes...",
      "Try: systemd, dbus",
      "Try: d$ (daemons)",
      "Try: ^kernel (regex)",
      "Search by name, command, or PID",
      "Try: docker, nginx"
    ];
    function handleClickOutside(event) {
    }
    function setupClickOutside() {
      if (typeof document !== "undefined") {
        document.addEventListener("click", handleClickOutside);
      }
    }
    function cleanupClickOutside() {
      if (typeof document !== "undefined") {
        document.removeEventListener("click", handleClickOutside);
      }
    }
    onDestroy(() => {
      cleanupClickOutside();
    });
    showHelp = store_get($$store_subs ??= {}, "$overlayStore", overlayStore) === "searchHelp";
    hasActiveSearch = searchTerm.trim().length > 0;
    if (showHelp) {
      setTimeout(setupClickOutside, 0);
    } else {
      cleanupClickOutside();
    }
    $$renderer2.push(`<div class="search-box svelte-s7t9dd"><div class="search-input-wrapper svelte-s7t9dd"><input type="text"${attr(
      "placeholder",
      // Start placeholder rotation
      placeholders[placeholderIndex]
    )}${attr("value", searchTerm)}${attr_class("search-input svelte-s7t9dd", void 0, { "has-search": hasActiveSearch })}/> `);
    if (searchTerm) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="btn-clear svelte-s7t9dd">Clear</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (showHelp) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="touchbar-full-overlay svelte-s7t9dd" role="dialog" aria-label="Search help overlay"><div class="search-help-content svelte-s7t9dd"><div class="enhanced-search-input svelte-s7t9dd"><input type="text"${attr("placeholder", placeholders[placeholderIndex])}${attr("value", searchTerm)} class="overlay-search-input svelte-s7t9dd" autocomplete="off"/> `);
      if (searchTerm) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="overlay-clear-btn svelte-s7t9dd">Clear</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="help-sections svelte-s7t9dd"><div class="examples-section svelte-s7t9dd"><span class="section-label svelte-s7t9dd">Examples:</span> <div class="examples-grid svelte-s7t9dd"><!--[-->`);
      const each_array = ensure_array_like(searchExamples.slice(0, 5));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let example = each_array[$$index];
        $$renderer2.push(`<button${attr_class("example-query svelte-s7t9dd", void 0, {
          "regex": example.type === "regex",
          "multi": example.type === "multi",
          "pid": example.type === "pid"
        })}${attr("title", example.description)}>${escape_html(example.query)}</button>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="regex-section svelte-s7t9dd"><span class="section-label svelte-s7t9dd">Regex:</span> <div class="regex-tips svelte-s7t9dd"><code class="svelte-s7t9dd">^</code><span class="svelte-s7t9dd">start</span> <code class="svelte-s7t9dd">$</code><span class="svelte-s7t9dd">end</span> <code class="svelte-s7t9dd">.*</code><span class="svelte-s7t9dd">any</span> <code class="svelte-s7t9dd">\\d+</code><span class="svelte-s7t9dd">numbers</span></div></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { searchTerm });
  });
}
const ITEMS_PER_PAGE_OPTIONS = [15, 25, 50, 100, 250, 500];
const REFRESH_RATE_OPTIONS = [
  { value: 2e3, label: "2s" },
  { value: 3e3, label: "3s" },
  { value: 5e3, label: "5s" },
  { value: 1e4, label: "10s" },
  { value: 3e4, label: "30s" }
];
const THEME_GROUPS = [
  {
    label: "Dark",
    themes: [
      "catppuccin",
      "dracula",
      "monokaiPro",
      "tokyoNight",
      "solarizedDark",
      "ayuDark",
      "ayuMirage"
    ]
  },
  {
    label: "Light",
    themes: ["githubLight", "solarizedLight", "oneLight", "ayuLight"]
  },
  {
    label: "Warm",
    themes: ["gruvbox"]
  },
  {
    label: "Cool",
    themes: ["nord", "oneDark"]
  },
  {
    label: "Fun",
    themes: ["bubblegum", "rosePine", "cottonCandy", "synthwave", "candyfloss"]
  },
  {
    label: "Retro",
    themes: ["terminal", "amber", "ibmPC"]
  },
  {
    label: "Accessibility",
    themes: ["highContrast"]
  }
];
const initialState = {
  processes: [],
  systemStats: null,
  error: null,
  isLoading: true,
  searchTerm: "",
  currentPage: 1,
  pinnedProcesses: /* @__PURE__ */ new Set(),
  selectedProcess: null,
  showInfoModal: false,
  showConfirmModal: false,
  processToKill: null,
  isKilling: false,
  isFrozen: false,
  selectedProcessPid: null,
  sortConfig: {
    field: "cpu_usage",
    direction: "desc"
  }
};
function createProcessStore() {
  const { subscribe, set, update } = writable(initialState);
  const setIsLoading = (isLoading) => update((state) => ({ ...state, isLoading }));
  const getProcesses = async () => {
    try {
      const host = get(selectedHost);
      if (!host) {
        console.warn("No agent selected, skipping getProcesses");
        return;
      }
      const { processes, systemStats } = await api.getProcesses(host);
      update((state) => {
        let updatedSelectedProcess = null;
        if (state.selectedProcessPid !== null) {
          updatedSelectedProcess = processes?.find((p) => p.pid === state.selectedProcessPid) ?? null;
        }
        return {
          ...state,
          processes,
          systemStats,
          selectedProcess: updatedSelectedProcess,
          error: null
        };
      });
    } catch (e) {
      update((state) => ({
        ...state,
        error: e instanceof Error ? e.message : String(e)
      }));
    }
  };
  const killProcess = async (pid) => {
    try {
      update((state) => ({ ...state, isKilling: true }));
      const host = get(selectedHost);
      const success = await api.killProcess(host, pid);
      if (success) {
        await getProcesses();
      } else {
        throw new Error("Failed to kill process");
      }
    } catch (e) {
      update((state) => ({
        ...state,
        error: e instanceof Error ? e.message : String(e)
      }));
    } finally {
      update((state) => ({ ...state, isKilling: false }));
    }
  };
  const toggleSort = (field) => {
    update((state) => ({
      ...state,
      sortConfig: {
        field,
        direction: state.sortConfig.field === field ? state.sortConfig.direction === "asc" ? "desc" : "asc" : "desc"
      }
    }));
  };
  const togglePin = (command) => {
    update((state) => {
      const newPinnedProcesses = new Set(state.pinnedProcesses);
      if (newPinnedProcesses.has(command)) {
        newPinnedProcesses.delete(command);
      } else {
        newPinnedProcesses.add(command);
      }
      return { ...state, pinnedProcesses: newPinnedProcesses };
    });
  };
  const setSearchTerm = (searchTerm) => update((state) => ({ ...state, searchTerm, currentPage: 1 }));
  const setIsFrozen = (isFrozen) => update((state) => ({ ...state, isFrozen }));
  const setCurrentPage = (currentPage) => update((state) => ({ ...state, currentPage }));
  const showProcessDetails = (process) => {
    update((state) => ({
      ...state,
      selectedProcessPid: process.pid,
      selectedProcess: process,
      showInfoModal: true
    }));
  };
  const closeProcessDetails = () => {
    update((state) => ({
      ...state,
      showInfoModal: false,
      selectedProcess: null,
      selectedProcessPid: null
    }));
  };
  const confirmKillProcess = (process) => {
    update((state) => ({
      ...state,
      processToKill: process,
      showConfirmModal: true
    }));
  };
  const closeConfirmKill = () => {
    update((state) => ({
      ...state,
      showConfirmModal: false,
      processToKill: null
    }));
  };
  const handleConfirmKill = async () => {
    let processToKill = null;
    let currentState;
    const unsubscribe = subscribe((state) => {
      currentState = state;
    });
    unsubscribe();
    if (currentState?.processToKill && "pid" in currentState.processToKill) {
      processToKill = currentState.processToKill;
    }
    if (!processToKill?.pid) {
      return;
    }
    try {
      await killProcess(processToKill.pid);
    } finally {
      update((state) => ({
        ...state,
        showConfirmModal: false,
        processToKill: null
      }));
    }
  };
  return {
    subscribe,
    set,
    update,
    setIsLoading,
    getProcesses,
    killProcess,
    toggleSort,
    togglePin,
    setSearchTerm,
    setIsFrozen,
    setCurrentPage,
    showProcessDetails,
    closeProcessDetails,
    confirmKillProcess,
    closeConfirmKill,
    handleConfirmKill
  };
}
const processStore = createProcessStore();
const themes = {
  catppuccin: {
    name: "catppuccin",
    label: "Catppuccin",
    colors: {
      base: "#1e1e2e",
      mantle: "#181825",
      crust: "#11111b",
      text: "#cdd6f4",
      subtext0: "#a6adc8",
      subtext1: "#bac2de",
      surface0: "#313244",
      surface1: "#45475a",
      surface2: "#585b70",
      overlay0: "#6c7086",
      overlay1: "#7f849c",
      blue: "#89b4fa",
      lavender: "#b4befe",
      sapphire: "#74c7ec",
      sky: "#89dceb",
      red: "#f38ba8",
      maroon: "#eba0ac",
      peach: "#fab387",
      yellow: "#f9e2af",
      green: "#a6e3a1",
      teal: "#94e2d5"
    }
  },
  dracula: {
    name: "dracula",
    label: "Dracula",
    colors: {
      base: "#282a36",
      mantle: "#1e1f29",
      crust: "#191a21",
      text: "#f8f8f2",
      subtext0: "#bfbfbf",
      subtext1: "#e6e6e6",
      surface0: "#44475a",
      surface1: "#6272a4",
      surface2: "#7970a9",
      overlay0: "#6272a4",
      overlay1: "#7970a9",
      blue: "#8be9fd",
      lavender: "#bd93f9",
      sapphire: "#62d6e8",
      sky: "#89ddff",
      red: "#ff5555",
      maroon: "#ff6e6e",
      peach: "#ffb86c",
      yellow: "#f1fa8c",
      green: "#50fa7b",
      teal: "#8be9fd"
    }
  },
  monokaiPro: {
    name: "monokaiPro",
    label: "Monokai Pro",
    colors: {
      base: "#2d2a2e",
      mantle: "#221f22",
      crust: "#1b1b1b",
      text: "#fcfcfa",
      subtext0: "#939293",
      subtext1: "#c1c0c0",
      surface0: "#403e41",
      surface1: "#565457",
      surface2: "#69676c",
      overlay0: "#727072",
      overlay1: "#848486",
      blue: "#78dce8",
      lavender: "#ab9df2",
      sapphire: "#66d9ef",
      sky: "#78dce8",
      red: "#ff6188",
      maroon: "#ff6188",
      peach: "#fc9867",
      yellow: "#ffd866",
      green: "#a9dc76",
      teal: "#78dce8"
    }
  },
  tokyoNight: {
    name: "tokyoNight",
    label: "Tokyo Night",
    colors: {
      base: "#1a1b26",
      mantle: "#16161e",
      crust: "#13131a",
      text: "#a9b1d6",
      subtext0: "#9aa5ce",
      subtext1: "#9aa5ce",
      surface0: "#232433",
      surface1: "#2a2b3d",
      surface2: "#32344a",
      overlay0: "#565f89",
      overlay1: "#6b7089",
      blue: "#7aa2f7",
      lavender: "#bb9af7",
      sapphire: "#7dcfff",
      sky: "#7dcfff",
      red: "#f7768e",
      maroon: "#ff9e64",
      peach: "#ff9e64",
      yellow: "#e0af68",
      green: "#9ece6a",
      teal: "#2ac3de"
    }
  },
  gruvbox: {
    name: "gruvbox",
    label: "Gruvbox Dark",
    colors: {
      base: "#282828",
      mantle: "#1d2021",
      crust: "#1b1b1b",
      text: "#ebdbb2",
      subtext0: "#a89984",
      subtext1: "#bdae93",
      surface0: "#3c3836",
      surface1: "#504945",
      surface2: "#665c54",
      overlay0: "#7c6f64",
      overlay1: "#928374",
      blue: "#83a598",
      lavender: "#d3869b",
      sapphire: "#83a598",
      sky: "#8ec07c",
      red: "#fb4934",
      maroon: "#cc241d",
      peach: "#fe8019",
      yellow: "#fabd2f",
      green: "#b8bb26",
      teal: "#8ec07c"
    }
  },
  nord: {
    name: "nord",
    label: "Nord",
    colors: {
      base: "#2e3440",
      mantle: "#272c36",
      crust: "#242933",
      text: "#eceff4",
      subtext0: "#d8dee9",
      subtext1: "#e5e9f0",
      surface0: "#3b4252",
      surface1: "#434c5e",
      surface2: "#4c566a",
      overlay0: "#616e88",
      overlay1: "#7b88a1",
      blue: "#88c0d0",
      lavender: "#b48ead",
      sapphire: "#81a1c1",
      sky: "#88c0d0",
      red: "#bf616a",
      maroon: "#d08770",
      peach: "#d08770",
      yellow: "#ebcb8b",
      green: "#a3be8c",
      teal: "#8fbcbb"
    }
  },
  oneDark: {
    name: "oneDark",
    label: "One Dark",
    colors: {
      base: "#282c34",
      mantle: "#21252b",
      crust: "#1b1f23",
      text: "#abb2bf",
      subtext0: "#828997",
      subtext1: "#9da5b4",
      surface0: "#31353f",
      surface1: "#393f4a",
      surface2: "#4b5263",
      overlay0: "#636d83",
      overlay1: "#767d8d",
      blue: "#61afef",
      lavender: "#c678dd",
      sapphire: "#56b6c2",
      sky: "#56b6c2",
      red: "#e06c75",
      maroon: "#be5046",
      peach: "#d19a66",
      yellow: "#e5c07b",
      green: "#98c379",
      teal: "#56b6c2"
    }
  },
  highContrast: {
    name: "highContrast",
    label: "High Contrast",
    colors: {
      base: "#000000",
      // Pure black background
      mantle: "#0a0a0a",
      // Slightly lighter black for layering
      crust: "#141414",
      // Even lighter black for depth
      text: "#ffffff",
      // Pure white text
      subtext0: "#e0e0e0",
      // Very light grey for secondary text
      subtext1: "#f0f0f0",
      // Almost white for important secondary text
      surface0: "#1a1a1a",
      // Dark surface for contrast
      surface1: "#2a2a2a",
      // Lighter surface for hover states
      surface2: "#3a3a3a",
      // Even lighter surface for active states
      overlay0: "#4a4a4a",
      // Medium grey for overlays
      overlay1: "#5a5a5a",
      // Lighter grey for overlay hover states
      blue: "#00ffff",
      // Cyan for primary actions
      lavender: "#ff00ff",
      // Magenta for accents
      sapphire: "#00ccff",
      // Bright blue for links
      sky: "#00ffee",
      // Bright cyan for highlights
      red: "#ff0000",
      // Pure red for errors/warnings
      maroon: "#ff3333",
      // Lighter red for secondary warnings
      peach: "#ffaa00",
      // Bright orange for notifications
      yellow: "#ffff00",
      // Pure yellow for important highlights
      green: "#00ff00",
      // Pure green for success states
      teal: "#00ffcc"
      // Bright teal for special actions
    }
  },
  githubLight: {
    name: "githubLight",
    label: "GitHub Light",
    colors: {
      base: "#ffffff",
      mantle: "#f6f8fa",
      crust: "#eaeef2",
      text: "#24292f",
      subtext0: "#57606a",
      subtext1: "#6e7781",
      surface0: "#f3f6fa",
      surface1: "#eaeef2",
      surface2: "#d0d7de",
      overlay0: "#8c959f",
      overlay1: "#6e7781",
      blue: "#0969da",
      lavender: "#8250df",
      sapphire: "#0550ae",
      sky: "#218bff",
      red: "#cf222e",
      maroon: "#a40e26",
      peach: "#bc4c00",
      yellow: "#9a6700",
      green: "#1a7f37",
      teal: "#0969da"
    }
  },
  solarizedLight: {
    name: "solarizedLight",
    label: "Solarized Light",
    colors: {
      base: "#fdf6e3",
      mantle: "#eee8d5",
      crust: "#e4dcc9",
      text: "#657b83",
      subtext0: "#839496",
      subtext1: "#93a1a1",
      surface0: "#f7f2e4",
      surface1: "#eee8d5",
      surface2: "#dcd4c4",
      overlay0: "#93a1a1",
      overlay1: "#839496",
      blue: "#268bd2",
      lavender: "#6c71c4",
      sapphire: "#2aa198",
      sky: "#2aa198",
      red: "#dc322f",
      maroon: "#cb4b16",
      peach: "#cb4b16",
      yellow: "#b58900",
      green: "#859900",
      teal: "#2aa198"
    }
  },
  solarizedDark: {
    name: "solarizedDark",
    label: "Solarized Dark",
    colors: {
      base: "#002b36",
      mantle: "#073642",
      crust: "#0A4C5C",
      text: "#839496",
      subtext0: "#657b83",
      subtext1: "#586e75",
      surface0: "#00313D",
      surface1: "#073642",
      surface2: "#083C49",
      overlay0: "#586e75",
      overlay1: "#657b83",
      blue: "#268bd2",
      lavender: "#6c71c4",
      sapphire: "#2aa198",
      sky: "#2aa198",
      red: "#dc322f",
      maroon: "#cb4b16",
      peach: "#cb4b16",
      yellow: "#b58900",
      green: "#859900",
      teal: "#2aa198"
    }
  },
  oneLight: {
    name: "oneLight",
    label: "One Light",
    colors: {
      base: "#fafafa",
      mantle: "#f0f0f0",
      crust: "#e5e5e5",
      text: "#383a42",
      subtext0: "#4f525e",
      subtext1: "#696c77",
      surface0: "#f2f2f2",
      surface1: "#e5e5e5",
      surface2: "#d4d4d4",
      overlay0: "#a0a1a7",
      overlay1: "#696c77",
      blue: "#4078f2",
      lavender: "#a626a4",
      sapphire: "#0184bc",
      sky: "#0997b3",
      red: "#e45649",
      maroon: "#ca1243",
      peach: "#d75f00",
      yellow: "#c18401",
      green: "#50a14f",
      teal: "#0184bc"
    }
  },
  bubblegum: {
    name: "bubblegum",
    label: "Bubblegum",
    colors: {
      base: "#ff9ac1",
      // Light pink background
      mantle: "#ffa7cc",
      // Slightly darker pink
      crust: "#ffb4d8",
      // Even darker pink for depth
      text: "#2d1c2d",
      // Dark purple text
      subtext0: "#4b384b",
      // Medium purple for secondary text
      subtext1: "#5c465c",
      // Lighter purple for tertiary text
      surface0: "#ffc1e0",
      // Light pink surface
      surface1: "#ffcee7",
      // Lighter pink surface
      surface2: "#ffdaf0",
      // Even lighter pink surface
      overlay0: "#7e5c7e",
      // Muted purple overlay
      overlay1: "#6e4f6e",
      // Darker purple overlay
      blue: "#7287fd",
      // Soft blue
      lavender: "#b4befe",
      // Soft lavender
      sapphire: "#89dceb",
      // Soft cyan
      sky: "#89dceb",
      // Matching cyan
      red: "#ff8089",
      // Soft red
      maroon: "#ff9999",
      // Soft maroon
      peach: "#ffb4a1",
      // Soft peach
      yellow: "#ffe5a0",
      // Soft yellow
      green: "#a6e3a1",
      // Soft green
      teal: "#94e2d5"
      // Soft teal
    }
  },
  rosePine: {
    name: "rosePine",
    label: "Rosé Pine",
    colors: {
      base: "#191724",
      // Deep purple base
      mantle: "#1f1d2e",
      // Slightly lighter purple
      crust: "#26233a",
      // Even lighter purple
      text: "#e0def4",
      // Soft white text
      subtext0: "#908caa",
      // Muted purple text
      subtext1: "#6e6a86",
      // Darker muted text
      surface0: "#2a2837",
      // Surface purple
      surface1: "#343145",
      // Lighter surface
      surface2: "#3e3b54",
      // Even lighter surface
      overlay0: "#524f67",
      // Overlay purple
      overlay1: "#6e6a86",
      // Lighter overlay
      blue: "#9ccfd8",
      // Soft blue
      lavender: "#c4a7e7",
      // Soft lavender
      sapphire: "#31748f",
      // Deep blue
      sky: "#9ccfd8",
      // Light blue
      red: "#eb6f92",
      // Soft pink
      maroon: "#ebbcba",
      // Soft rose
      peach: "#f6c177",
      // Soft peach
      yellow: "#f6c177",
      // Gold
      green: "#31748f",
      // Sage
      teal: "#9ccfd8"
      // Soft teal
    }
  },
  cottonCandy: {
    name: "cottonCandy",
    label: "Cotton Candy",
    colors: {
      base: "#f5d1eb",
      // Light pink
      mantle: "#f7d7ee",
      // Slightly darker pink
      crust: "#fae1f3",
      // Even darker pink
      text: "#2d0c3a",
      // Deep purple text
      subtext0: "#4a1259",
      // Medium purple text
      subtext1: "#671878",
      // Light purple text
      surface0: "#f9def1",
      // Surface pink
      surface1: "#fde9f5",
      // Lighter surface
      surface2: "#fff2fa",
      // Even lighter surface
      overlay0: "#b87dd3",
      // Purple overlay
      overlay1: "#9c5fb8",
      // Darker overlay
      blue: "#79c7ff",
      // Baby blue
      lavender: "#d5a6ff",
      // Soft purple
      sapphire: "#7cb8ff",
      // Light blue
      sky: "#89dcff",
      // Bright blue
      red: "#ff9ed2",
      // Soft pink
      maroon: "#ff8ac4",
      // Darker pink
      peach: "#ffb2c7",
      // Peachy pink
      yellow: "#ffffc2",
      // Pastel yellow
      green: "#b6ffd7",
      // Mint green
      teal: "#89ffea"
      // Turquoise
    }
  },
  synthwave: {
    name: "synthwave",
    label: "Synthwave",
    colors: {
      base: "#2b213a",
      // Deep purple
      mantle: "#2f2444",
      // Slightly lighter purple
      crust: "#33274f",
      // Even lighter purple
      text: "#ff7edb",
      // Neon pink text
      subtext0: "#e58ee0",
      // Softer pink text
      subtext1: "#cb9ee6",
      // Lavender text
      surface0: "#392662",
      // Surface purple
      surface1: "#443773",
      // Lighter surface
      surface2: "#504785",
      // Even lighter surface
      overlay0: "#625997",
      // Purple overlay
      overlay1: "#7267aa",
      // Lighter overlay
      blue: "#36f9f6",
      // Cyan
      lavender: "#ff7edb",
      // Pink
      sapphire: "#72f1b8",
      // Mint
      sky: "#36f9f6",
      // Bright cyan
      red: "#fe4450",
      // Hot red
      maroon: "#ff558f",
      // Hot pink
      peach: "#ff8b39",
      // Orange
      yellow: "#fede5d",
      // Yellow
      green: "#72f1b8",
      // Neon green
      teal: "#36f9f6"
      // Bright teal
    }
  },
  candyfloss: {
    name: "candyfloss",
    label: "Candyfloss",
    colors: {
      base: "#f8e2ff",
      // Light purple
      mantle: "#ffe2f8",
      // Pink tint
      crust: "#ffe9f3",
      // Lighter pink
      text: "#5c1b99",
      // Deep purple text
      subtext0: "#7a3aaf",
      // Medium purple text
      subtext1: "#944bc6",
      // Light purple text
      surface0: "#ffeaf8",
      // Surface pink
      surface1: "#fff2fb",
      // Lighter surface
      surface2: "#fff7fd",
      // Even lighter surface
      overlay0: "#d59bff",
      // Purple overlay
      overlay1: "#c77dff",
      // Darker overlay
      blue: "#79baff",
      // Soft blue
      lavender: "#cc8fff",
      // Light purple
      sapphire: "#85a5ff",
      // Periwinkle
      sky: "#8aceff",
      // Light blue
      red: "#ff8fab",
      // Soft red
      maroon: "#ff7fa6",
      // Pink
      peach: "#ffb2c7",
      // Peach
      yellow: "#fff3b2",
      // Soft yellow
      green: "#b8ffda",
      // Mint
      teal: "#8affef"
      // Aqua
    }
  },
  terminal: {
    name: "terminal",
    label: "Green Terminal",
    colors: {
      base: "#0D1117",
      // Deep black background
      mantle: "#161B22",
      // Slightly lighter black
      crust: "#1B2127",
      // Terminal border color
      text: "#00FF00",
      // Classic terminal green
      subtext0: "#00D700",
      // Dimmer green
      subtext1: "#00BB00",
      // Even dimmer green
      surface0: "#1C2128",
      // Slightly lifted surface
      surface1: "#21262D",
      // Terminal input area
      surface2: "#282E35",
      // Selected area
      overlay0: "#008800",
      // Darker green for overlays
      overlay1: "#006600",
      // Even darker green
      blue: "#00FF00",
      // Keep everything in green shades
      lavender: "#00FF66",
      // Slight variation
      sapphire: "#00DD88",
      // Another variation
      sky: "#00FFBB",
      // Lighter green
      red: "#FF0000",
      // Error red (keep for errors)
      maroon: "#AA0000",
      // Darker error
      peach: "#00FF99",
      // Another green variation
      yellow: "#FFFF00",
      // Warning yellow (keep for warnings)
      green: "#00FF00",
      // Main green
      teal: "#00FFCC"
      // Cyan-ish green
    }
  },
  amber: {
    name: "amber",
    label: "Amber Terminal",
    colors: {
      base: "#0D0904",
      // Deep black with amber tint
      mantle: "#160E06",
      // Slightly lighter black
      crust: "#1B1109",
      // Terminal border color
      text: "#FFB000",
      // Classic amber
      subtext0: "#CC8800",
      // Dimmer amber
      subtext1: "#995500",
      // Even dimmer amber
      surface0: "#1C1409",
      // Slightly lifted surface
      surface1: "#211909",
      // Terminal input area
      surface2: "#281E0A",
      // Selected area
      overlay0: "#663300",
      // Darker amber for overlays
      overlay1: "#442200",
      // Even darker amber
      blue: "#FFB000",
      // Keep everything in amber shades
      lavender: "#FFAA00",
      // Slight variation
      sapphire: "#FF9500",
      // Another variation
      sky: "#FFB000",
      // Main amber
      red: "#FF3300",
      // Error red (keep for errors)
      maroon: "#CC3300",
      // Darker error
      peach: "#FFAA55",
      // Lighter amber
      yellow: "#FFDD00",
      // Warning yellow
      green: "#FFB000",
      // Main amber
      teal: "#FFC000"
      // Lighter amber
    }
  },
  ibmPC: {
    name: "ibmPC",
    label: "IBM PC",
    colors: {
      base: "#000000",
      // Classic black background
      mantle: "#0A0A0A",
      // Slightly lighter black
      crust: "#141414",
      // Border color
      text: "#AAAAAA",
      // Light gray text
      subtext0: "#888888",
      // Dimmer text
      subtext1: "#666666",
      // Even dimmer text
      surface0: "#1C1C1C",
      // Slightly lifted surface
      surface1: "#212121",
      // Input area
      surface2: "#282828",
      // Selected area
      overlay0: "#444444",
      // Overlay
      overlay1: "#333333",
      // Darker overlay
      blue: "#5555FF",
      // CGA blue
      lavender: "#FF55FF",
      // CGA magenta
      sapphire: "#5555FF",
      // Another blue
      sky: "#55FFFF",
      // CGA cyan
      red: "#FF5555",
      // CGA red
      maroon: "#AA0000",
      // Darker red
      peach: "#FF5555",
      // Another red shade
      yellow: "#FFFF55",
      // CGA yellow
      green: "#55FF55",
      // CGA green
      teal: "#55FFFF"
      // Another cyan
    }
  },
  glassy: {
    name: "glassy",
    label: "Glassy",
    colors: {
      base: "#1e1e2e",
      mantle: "#181825",
      crust: "#11111b",
      text: "#cdd6f4",
      subtext0: "#a6adc8",
      subtext1: "#bac2de",
      surface0: "#313244",
      surface1: "#45475a",
      surface2: "#585b70",
      overlay0: "#6c7086",
      overlay1: "#7f849c",
      blue: "#89b4fa",
      lavender: "#b4befe",
      sapphire: "#74c7ec",
      sky: "#89dceb",
      red: "#f38ba8",
      maroon: "#eba0ac",
      peach: "#fab387",
      yellow: "#f9e2af",
      green: "#a6e3a1",
      teal: "#94e2d5"
    }
  },
  ayuDark: {
    name: "ayuDark",
    label: "Ayu Dark",
    colors: {
      base: "#0D1017",
      mantle: "#131721",
      crust: "#232834",
      text: "#BFBDB6",
      subtext0: "#707a8c",
      subtext1: "#8b939e",
      surface0: "#0f1419",
      surface1: "#131721",
      surface2: "#212733",
      overlay0: "#E6B450",
      overlay1: "#434c5e",
      blue: "#36a3d9",
      lavender: "#d2a8ff",
      sapphire: "#0f958a",
      sky: "#c9d1d9",
      red: "#D95757",
      maroon: "#e06c75",
      peach: "#f07178",
      yellow: "#ffb454",
      green: "#b8cc52",
      teal: "#95e6cb"
    }
  },
  ayuMirage: {
    name: "ayuMirage",
    label: "Ayu Mirage",
    colors: {
      base: "#242936",
      mantle: "#1A1F29",
      crust: "#232834",
      text: "#CCCAC2",
      subtext0: "#707a8c",
      subtext1: "#8b939e",
      surface0: "#0f1419",
      surface1: "#131721",
      surface2: "#212733",
      overlay0: "#FFCC66",
      overlay1: "#434c5e",
      blue: "#36a3d9",
      lavender: "#d2a8ff",
      sapphire: "#0f958a",
      sky: "#c9d1d9",
      red: "#FF6666",
      maroon: "#e06c75",
      peach: "#f07178",
      yellow: "#ffb454",
      green: "#b8cc52",
      teal: "#95e6cb"
    }
  },
  ayuLight: {
    name: "ayuLight",
    label: "Ayu Light",
    colors: {
      base: "#FCFCFC",
      mantle: "#8A91991A",
      crust: "#eaeef2",
      text: "#5C6166",
      subtext0: "#57606a",
      subtext1: "#6e7781",
      surface0: "#f3f6fa",
      surface1: "#eaeef2",
      surface2: "#d0d7de",
      overlay0: "#FFAA33",
      overlay1: "#6e7781",
      blue: "#0969da",
      lavender: "#8250df",
      sapphire: "#0550ae",
      sky: "#218bff",
      red: "#E65050",
      maroon: "#a40e26",
      peach: "#bc4c00",
      yellow: "#9a6700",
      green: "#1a7f37",
      teal: "#0969da"
    }
  }
};
function createThemeStore() {
  const defaultTheme = themes.catppuccin;
  const { subscribe, set } = writable(defaultTheme);
  if (typeof window !== "undefined") {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme && themes[storedTheme]) {
      set(themes[storedTheme]);
    }
  }
  return {
    subscribe,
    setTheme: (themeName) => {
      const theme = themes[themeName];
      if (theme) {
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", themeName);
          document.documentElement.setAttribute("data-theme", themeName);
        }
        set(theme);
        applyTheme(theme);
      }
    },
    init: () => {
      const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
      const theme = storedTheme && themes[storedTheme] || defaultTheme;
      if (typeof window !== "undefined") {
        document.documentElement.setAttribute(
          "data-theme",
          storedTheme || "catppuccin"
        );
      }
      applyTheme(theme);
    }
  };
}
function applyTheme(theme) {
  if (typeof window !== "undefined") {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }
}
const themeStore = createThemeStore();
const DEFAULT_CONFIG = {
  appearance: {
    columnVisibility: {
      name: true,
      pid: true,
      status: true,
      user: true,
      cpu_usage: true,
      memory_usage: true,
      virtual_memory: true,
      disk_usage: true,
      ppid: false,
      root: false,
      command: false,
      environ: false,
      session_id: false,
      start_time: false,
      run_time: true
    }
  },
  behavior: {
    itemsPerPage: 15,
    refreshRate: 3e3,
    defaultStatusFilter: "all"
  }
};
function createSettingsStore() {
  const { subscribe, set, update } = writable(DEFAULT_CONFIG);
  return {
    subscribe,
    init: () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("neohtop_config");
        if (stored) {
          try {
            const config = JSON.parse(stored);
            set({ ...DEFAULT_CONFIG, ...config });
          } catch (e) {
            console.error("Failed to parse stored config:", e);
            set(DEFAULT_CONFIG);
          }
        }
      }
    },
    updateConfig: (newConfig) => {
      update((config) => {
        const updated = { ...config, ...newConfig };
        if (typeof window !== "undefined") {
          localStorage.setItem("neohtop_config", JSON.stringify(updated));
        }
        return updated;
      });
    }
  };
}
const settingsStore = createSettingsStore();
function PaginationControls($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isExpanded;
    let itemsPerPage = $$props["itemsPerPage"];
    let currentPage = $$props["currentPage"];
    let totalPages = $$props["totalPages"];
    let totalResults = $$props["totalResults"];
    function handleClickOutside(event) {
    }
    function setupClickOutside() {
      if (typeof document !== "undefined") {
        document.addEventListener("click", handleClickOutside);
      }
    }
    function cleanupClickOutside() {
      if (typeof document !== "undefined") {
        document.removeEventListener("click", handleClickOutside);
      }
    }
    onDestroy(() => {
      cleanupClickOutside();
    });
    isExpanded = store_get($$store_subs ??= {}, "$overlayStore", overlayStore) === "pagination";
    if (isExpanded) {
      setTimeout(setupClickOutside, 0);
    } else {
      cleanupClickOutside();
    }
    $$renderer2.push(`<div class="pagination-controls svelte-m3q65a"><div${attr_class("pagination-per-page svelte-m3q65a", void 0, { "active": isExpanded })}><button${attr_class("touchbar-trigger svelte-m3q65a", void 0, { "active": isExpanded })}>${escape_html(itemsPerPage)} per page</button> `);
    if (isExpanded) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="touchbar-full-overlay svelte-m3q65a" role="dialog" aria-label="Pagination controls" tabindex="-1"><div class="touchbar-horizontal-options svelte-m3q65a"><!--[-->`);
      const each_array = ensure_array_like(ITEMS_PER_PAGE_OPTIONS);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let option = each_array[$$index];
        $$renderer2.push(`<button${attr_class("touchbar-option svelte-m3q65a", void 0, { "active": option === itemsPerPage })}>${escape_html(option)}</button>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <div class="pagination svelte-m3q65a"><button class="btn-page svelte-m3q65a"${attr("disabled", currentPage === 1, true)}>««</button> <button class="btn-page svelte-m3q65a"${attr("disabled", currentPage === 1, true)}>«</button> <div class="page-info svelte-m3q65a"><span class="svelte-m3q65a">Page ${escape_html(currentPage)} of ${escape_html(totalPages)}</span> <span class="results-info svelte-m3q65a">(${escape_html(totalResults)} processes)</span></div> <button class="btn-page svelte-m3q65a"${attr("disabled", currentPage === totalPages, true)}>»</button> <button class="btn-page svelte-m3q65a"${attr("disabled", currentPage === totalPages, true)}>»»</button></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { itemsPerPage, currentPage, totalPages, totalResults });
  });
}
function getTransform(scale, translateX, translateY, rotate, flip, translateTimes = 1, translateUnit = "", rotateUnit = "") {
  let flipX = 1;
  let flipY = 1;
  if (flip) {
    if (flip == "horizontal") {
      flipX = -1;
    } else if (flip == "vertical") {
      flipY = -1;
    } else {
      flipX = flipY = -1;
    }
  }
  if (typeof scale === "string") {
    scale = parseFloat(scale);
  }
  if (typeof translateX === "string") {
    translateX = parseFloat(translateX);
  }
  if (typeof translateY === "string") {
    translateY = parseFloat(translateY);
  }
  const x = `${translateX * translateTimes}${translateUnit}`;
  const y = `${translateY * translateTimes}${translateUnit}`;
  let output = `translate(${x},${y}) scale(${flipX * scale},${flipY * scale})`;
  if (rotate) {
    output += ` rotate(${rotate}${rotateUnit})`;
  }
  return output;
}
function Fa($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let i, transform;
    let clazz = fallback($$props["class"], () => void 0, true);
    let id = fallback($$props["id"], () => void 0, true);
    let style = fallback($$props["style"], () => void 0, true);
    let icon = $$props["icon"];
    let title = fallback($$props["title"], () => void 0, true);
    let size = fallback($$props["size"], () => void 0, true);
    let color = fallback($$props["color"], () => void 0, true);
    let fw = fallback($$props["fw"], false);
    let pull = fallback($$props["pull"], () => void 0, true);
    let scale = fallback($$props["scale"], 1);
    let translateX = fallback($$props["translateX"], 0);
    let translateY = fallback($$props["translateY"], 0);
    let rotate = fallback($$props["rotate"], () => void 0, true);
    let flip = fallback($$props["flip"], () => void 0, true);
    let spin = fallback($$props["spin"], false);
    let pulse = fallback($$props["pulse"], false);
    let primaryColor = fallback($$props["primaryColor"], "");
    let secondaryColor = fallback($$props["secondaryColor"], "");
    let primaryOpacity = fallback($$props["primaryOpacity"], 1);
    let secondaryOpacity = fallback($$props["secondaryOpacity"], 0.4);
    let swapOpacity = fallback($$props["swapOpacity"], false);
    i = icon && icon.icon || [0, 0, "", [], ""];
    transform = getTransform(scale, translateX, translateY, rotate, flip, 512);
    if (i[4]) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<svg${attr("id", id)}${attr_class(`svelte-fa svelte-fa-base ${stringify(clazz)}`, "svelte-q6zoq1", {
        "pulse": pulse,
        "svelte-fa-size-lg": size === "lg",
        "svelte-fa-size-sm": size === "sm",
        "svelte-fa-size-xs": size === "xs",
        "svelte-fa-fw": fw,
        "svelte-fa-pull-left": pull === "left",
        "svelte-fa-pull-right": pull === "right",
        "spin": spin
      })}${attr_style(style)}${attr("viewBox", `0 0 ${stringify(i[0])} ${stringify(i[1])}`)}${attr("aria-hidden", title === void 0)} role="img" xmlns="http://www.w3.org/2000/svg">`);
      if (title) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<title class="svelte-q6zoq1">${escape_html(title)}</title>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--><g${attr("transform", `translate(${stringify(i[0] / 2)} ${stringify(i[1] / 2)})`)}${attr("transform-origin", `${stringify(i[0] / 4)} 0`)} class="svelte-q6zoq1"><g${attr("transform", transform)} class="svelte-q6zoq1">`);
      if (typeof i[4] == "string") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<path${attr("d", i[4])}${attr("fill", color || primaryColor || "currentColor")}${attr("transform", `translate(${stringify(i[0] / -2)} ${stringify(i[1] / -2)})`)} class="svelte-q6zoq1"></path>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<path${attr("d", i[4][0])}${attr("fill", secondaryColor || color || "currentColor")}${attr("fill-opacity", swapOpacity != false ? primaryOpacity : secondaryOpacity)}${attr("transform", `translate(${stringify(i[0] / -2)} ${stringify(i[1] / -2)})`)} class="svelte-q6zoq1"></path><path${attr("d", i[4][1])}${attr("fill", primaryColor || color || "currentColor")}${attr("fill-opacity", swapOpacity != false ? secondaryOpacity : primaryOpacity)}${attr("transform", `translate(${stringify(i[0] / -2)} ${stringify(i[1] / -2)})`)} class="svelte-q6zoq1"></path>`);
      }
      $$renderer2.push(`<!--]--></g></g></svg>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      class: clazz,
      id,
      style,
      icon,
      title,
      size,
      color,
      fw,
      pull,
      scale,
      translateX,
      translateY,
      rotate,
      flip,
      spin,
      pulse,
      primaryColor,
      secondaryColor,
      primaryOpacity,
      secondaryOpacity,
      swapOpacity
    });
  });
}
function ColumnToggle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let showColumnMenu;
    let columns = $$props["columns"];
    function handleClickOutside(event) {
    }
    function setupClickOutside() {
      if (typeof document !== "undefined") {
        document.addEventListener("click", handleClickOutside);
      }
    }
    function cleanupClickOutside() {
      if (typeof document !== "undefined") {
        document.removeEventListener("click", handleClickOutside);
      }
    }
    onDestroy(() => {
      cleanupClickOutside();
    });
    showColumnMenu = store_get($$store_subs ??= {}, "$overlayStore", overlayStore) === "columns";
    if (showColumnMenu) {
      setTimeout(setupClickOutside, 0);
    } else {
      cleanupClickOutside();
    }
    $$renderer2.push(`<div class="column-toggle svelte-dv9ziu"><button${attr_class("touchbar-trigger svelte-dv9ziu", void 0, { "active": showColumnMenu })} aria-label="Toggle columns">Columns <span class="icon svelte-dv9ziu">`);
    Fa($$renderer2, { icon: showColumnMenu ? faChevronDown : faChevronRight });
    $$renderer2.push(`<!----></span></button> `);
    if (showColumnMenu) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="touchbar-full-overlay svelte-dv9ziu" role="dialog" aria-label="Column visibility options" tabindex="-1">`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="touchbar-horizontal-options svelte-dv9ziu"><!--[-->`);
      const each_array = ensure_array_like(columns);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let column = each_array[$$index];
        $$renderer2.push(`<button${attr_class("touchbar-option svelte-dv9ziu", void 0, { "active": column.visible, "disabled": column.required })}${attr("title", column.required ? "Required column" : `Toggle ${column.label}`)}>${escape_html(column.label)}</button>`);
      }
      $$renderer2.push(`<!--]--></div> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { columns });
  });
}
function RefreshControls($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isExpanded;
    let refreshRate = $$props["refreshRate"];
    let isFrozen = $$props["isFrozen"];
    function getCurrentLabel() {
      return REFRESH_RATE_OPTIONS.find((opt) => opt.value === refreshRate)?.label || "1s";
    }
    function handleClickOutside(event) {
    }
    function setupClickOutside() {
      if (typeof document !== "undefined") {
        document.addEventListener("click", handleClickOutside);
      }
    }
    function cleanupClickOutside() {
      if (typeof document !== "undefined") {
        document.removeEventListener("click", handleClickOutside);
      }
    }
    onDestroy(() => {
      cleanupClickOutside();
    });
    isExpanded = store_get($$store_subs ??= {}, "$overlayStore", overlayStore) === "refresh";
    if (isExpanded) {
      setTimeout(setupClickOutside, 0);
    } else {
      cleanupClickOutside();
    }
    $$renderer2.push(`<div class="refresh-controls svelte-9w6q1t"><div${attr_class("refresh-rate svelte-9w6q1t", void 0, { "active": isExpanded })}><button${attr_class("touchbar-trigger svelte-9w6q1t", void 0, { "disabled": isFrozen, "active": isExpanded })}>${escape_html(getCurrentLabel())}</button> `);
    if (isExpanded) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="touchbar-full-overlay svelte-9w6q1t" role="dialog" aria-label="Refresh rate controls" tabindex="-1"><div class="touchbar-horizontal-options svelte-9w6q1t"><!--[-->`);
      const each_array = ensure_array_like(REFRESH_RATE_OPTIONS);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let option = each_array[$$index];
        $$renderer2.push(`<button${attr_class("touchbar-option svelte-9w6q1t", void 0, { "active": option.value === refreshRate })}>${escape_html(option.label)}</button>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> <button${attr_class("btn-action svelte-9w6q1t", void 0, { "frozen": isFrozen })}${attr("title", isFrozen ? "Resume Updates" : "Pause Updates")}>`);
    if (isFrozen) {
      $$renderer2.push("<!--[-->");
      Fa($$renderer2, { icon: faPlay, color: "var(--red)" });
    } else {
      $$renderer2.push("<!--[!-->");
      Fa($$renderer2, { icon: faPause, color: "var(--subtext0)" });
    }
    $$renderer2.push(`<!--]--></button></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { refreshRate, isFrozen });
  });
}
function FilterToggle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let showFilters, hasActiveFilters, activeFilterCount;
    let filters = fallback(
      $$props["filters"],
      () => ({
        cpu: { operator: ">", value: 50, enabled: false },
        ram: { operator: ">", value: 100, enabled: false },
        runtime: { operator: ">", value: 60, enabled: false },
        status: { values: [], enabled: false }
      }),
      true
    );
    const operators = [{ value: ">", label: ">" }, { value: "<", label: "<" }];
    const statusOptions = [
      { value: "Running", label: "Running", color: "var(--green)" },
      { value: "Sleeping", label: "Sleeping", color: "var(--blue)" },
      { value: "Stopped", label: "Stopped", color: "var(--red)" },
      { value: "Zombie", label: "Zombie", color: "var(--yellow)" }
    ];
    function handleClickOutside(event) {
    }
    function setupClickOutside() {
      if (typeof document !== "undefined") {
        document.addEventListener("click", handleClickOutside);
      }
    }
    function cleanupClickOutside() {
      if (typeof document !== "undefined") {
        document.removeEventListener("click", handleClickOutside);
      }
    }
    onDestroy(() => {
      cleanupClickOutside();
    });
    showFilters = store_get($$store_subs ??= {}, "$overlayStore", overlayStore) === "filters";
    hasActiveFilters = Object.values(filters).some((f) => f.enabled);
    activeFilterCount = Object.values(filters).filter((f) => f.enabled).length;
    if (showFilters) {
      setTimeout(setupClickOutside, 0);
    } else {
      cleanupClickOutside();
    }
    $$renderer2.push(`<div class="filter-toggle svelte-4tfu26"><button${attr_class("filter-button svelte-4tfu26", void 0, { "active": showFilters, "has-filters": hasActiveFilters })} aria-label="Toggle filters">`);
    Fa($$renderer2, { icon: faFilter });
    $$renderer2.push(`<!----> Filters `);
    if (hasActiveFilters) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span class="filter-count svelte-4tfu26">${escape_html(activeFilterCount)}</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></button> `);
    if (showFilters) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="touchbar-full-overlay svelte-4tfu26" role="dialog" aria-label="Filter options overlay" tabindex="-1"><div class="filter-content svelte-4tfu26"><div class="filter-sections svelte-4tfu26"><div class="filter-section svelte-4tfu26"><span class="section-label svelte-4tfu26">Performance:</span> <div class="filter-controls svelte-4tfu26"><!--[-->`);
      const each_array = ensure_array_like([
        ["cpu", "CPU %"],
        ["ram", "RAM MB"],
        ["runtime", "Runtime min"]
      ]);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let [type, label] = each_array[$$index_1];
        const filterKey = type;
        $$renderer2.push(`<div class="filter-control svelte-4tfu26"><button${attr_class("filter-toggle-btn svelte-4tfu26", void 0, { "active": filters[filterKey].enabled })}>${escape_html(label)}</button> `);
        if (filters[filterKey].enabled) {
          $$renderer2.push("<!--[-->");
          $$renderer2.select(
            { class: "operator-select", value: filters[filterKey].operator },
            ($$renderer3) => {
              $$renderer3.push(`<!--[-->`);
              const each_array_1 = ensure_array_like(operators);
              for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
                let op = each_array_1[$$index];
                $$renderer3.option({ value: op.value }, ($$renderer4) => {
                  $$renderer4.push(`${escape_html(op.label)}`);
                });
              }
              $$renderer3.push(`<!--]-->`);
            },
            "svelte-4tfu26"
          );
          $$renderer2.push(` <input type="number" class="value-input svelte-4tfu26"${attr("value", filters[filterKey].value)}${attr("placeholder", type === "cpu" ? "50" : type === "ram" ? "100" : "60")}/> `);
          if (type === "ram") {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<span class="unit svelte-4tfu26">MB</span>`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (type === "runtime") {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span class="unit svelte-4tfu26">min</span>`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<span class="unit svelte-4tfu26">%</span>`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="filter-section svelte-4tfu26"><span class="section-label svelte-4tfu26">Status:</span> <div class="status-controls svelte-4tfu26"><!--[-->`);
      const each_array_2 = ensure_array_like(statusOptions);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let status = each_array_2[$$index_2];
        $$renderer2.push(`<button${attr_class("status-toggle svelte-4tfu26", void 0, { "active": filters.status.values.includes(status.value) })}${attr_style(`--status-color: ${stringify(status.color)}`)}>${escape_html(status.label)}</button>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="filter-actions svelte-4tfu26">`);
      if (hasActiveFilters) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="clear-all-btn svelte-4tfu26">`);
        Fa($$renderer2, { icon: faFilter });
        $$renderer2.push(`<!----> Clear All</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="filter-summary svelte-4tfu26">`);
      if (hasActiveFilters) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span>${escape_html(activeFilterCount)} filter${escape_html(activeFilterCount > 1 ? "s" : "")} active</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<span>No filters applied</span>`);
      }
      $$renderer2.push(`<!--]--></div></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { filters });
  });
}
function ProcessTable($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let processes = $$props["processes"];
    let columns = $$props["columns"];
    let systemStats = $$props["systemStats"];
    let sortConfig = $$props["sortConfig"];
    let pinnedProcesses = $$props["pinnedProcesses"];
    let onToggleSort = $$props["onToggleSort"];
    let onTogglePin = $$props["onTogglePin"];
    let onShowDetails = $$props["onShowDetails"];
    let onKillProcess = $$props["onKillProcess"];
    $$renderer2.push(`<div class="table-container svelte-1h60zlj"><table class="svelte-1h60zlj">`);
    TableHeader($$renderer2, { columns, sortConfig, onToggleSort });
    $$renderer2.push(`<!----><tbody><!--[-->`);
    const each_array = ensure_array_like(processes);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let process = each_array[$$index];
      ProcessRow($$renderer2, {
        process,
        columns,
        isPinned: pinnedProcesses.has(process.command),
        isHighUsage: process.cpu_usage > 50 || process.memory_usage / (systemStats?.memory_total || 0) > 0.1,
        onTogglePin,
        onShowDetails,
        onKillProcess
      });
    }
    $$renderer2.push(`<!--]--></tbody></table></div>`);
    bind_props($$props, {
      processes,
      columns,
      systemStats,
      sortConfig,
      pinnedProcesses,
      onToggleSort,
      onTogglePin,
      onShowDetails,
      onKillProcess
    });
  });
}
function ProcessRow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let process = $$props["process"];
    let columns = $$props["columns"];
    let isPinned2 = $$props["isPinned"];
    let isHighUsage = $$props["isHighUsage"];
    let onTogglePin = $$props["onTogglePin"];
    let onShowDetails = $$props["onShowDetails"];
    let onKillProcess = $$props["onKillProcess"];
    $$renderer2.push(`<tr${attr_class("svelte-1vp2lrb", void 0, { "high-usage": isHighUsage, "pinned": isPinned2 })}><!--[-->`);
    const each_array = ensure_array_like(columns.filter((col) => col.visible));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let column = each_array[$$index];
      $$renderer2.push(`<td class="truncate svelte-1vp2lrb">`);
      if (column.id === "name") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="name-cell svelte-1vp2lrb">`);
        ProcessIcon($$renderer2, { processName: process.name });
        $$renderer2.push(`<!----> <span class="process-name">${escape_html(process.name)}</span></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (column.format) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`${html(column.format(process[column.id]))}`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`${escape_html(process[column.id])}`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></td>`);
    }
    $$renderer2.push(`<!--]-->`);
    ActionButtons($$renderer2, { process, isPinned: isPinned2, onTogglePin, onShowDetails, onKillProcess });
    $$renderer2.push(`<!----></tr>`);
    bind_props($$props, {
      process,
      columns,
      isPinned: isPinned2,
      isHighUsage,
      onTogglePin,
      onShowDetails,
      onKillProcess
    });
  });
}
function TableHeader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let columns = $$props["columns"];
    let sortConfig = $$props["sortConfig"];
    let onToggleSort = $$props["onToggleSort"];
    function getSortIndicator(field) {
      if (sortConfig.field !== field) return "↕";
      return sortConfig.direction === "asc" ? "↑" : "↓";
    }
    $$renderer2.push(`<thead><tr><!--[-->`);
    const each_array = ensure_array_like(columns.filter((col) => col.visible));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let column = each_array[$$index];
      $$renderer2.push(`<th class="sortable svelte-1tsk8gz"><div class="th-content svelte-1tsk8gz">${escape_html(column.label)} <span${attr_class("sort-indicator svelte-1tsk8gz", void 0, { "active": sortConfig.field === column.id })}>${escape_html(getSortIndicator(column.id))}</span></div></th>`);
    }
    $$renderer2.push(`<!--]--><th class="svelte-1tsk8gz">Actions</th></tr></thead>`);
    bind_props($$props, { columns, sortConfig, onToggleSort });
  });
}
function ActionButtons($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let process = $$props["process"];
    let isPinned2 = $$props["isPinned"];
    let onTogglePin = $$props["onTogglePin"];
    let onShowDetails = $$props["onShowDetails"];
    let onKillProcess = $$props["onKillProcess"];
    $$renderer2.push(`<td class="col-actions svelte-4x4ju1"><div class="action-buttons svelte-4x4ju1"><button${attr_class("btn-action pin-btn svelte-4x4ju1", void 0, { "pinned": isPinned2 })}${attr("title", isPinned2 ? "Unpin" : "Pin")}>`);
    Fa($$renderer2, { icon: faThumbtack });
    $$renderer2.push(`<!----></button> <button class="btn-action info-btn svelte-4x4ju1" title="Show Details">`);
    Fa($$renderer2, { icon: faInfoCircle });
    $$renderer2.push(`<!----></button> <button class="btn-action kill-btn svelte-4x4ju1" title="End Process">`);
    Fa($$renderer2, { icon: faXmark });
    $$renderer2.push(`<!----></button></div></td>`);
    bind_props($$props, { process, isPinned: isPinned2, onTogglePin, onShowDetails, onKillProcess });
  });
}
function ProcessIcon($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let processName = $$props["processName"];
    let size = fallback($$props["size"], 16);
    function getIconForProcess(name) {
      if (name.startsWith("com.")) {
        const companyName = name.replace(/^com\.([^.]+)\..*$/, "$1");
        const formattedCompanyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
        const companyIconKey = `si${formattedCompanyName}`;
        const companyIcon = SimpleIcons[companyIconKey];
        if (companyIcon) {
          const color2 = getComputedStyle(document.documentElement).getPropertyValue("--text").trim();
          const svg2 = typeof companyIcon === "object" && "svg" in companyIcon ? companyIcon.svg : "";
          const svgWithColor2 = svg2.replace("<svg", `<svg fill="${color2}"`);
          return `data:image/svg+xml;base64,${btoa(svgWithColor2)}`;
        }
      }
      const cleanName = name.replace(/\.(app|exe)$/i, "").replace(/[-_./\\]/g, " ").split(" ")[0].trim().toLowerCase();
      const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      const iconKey = `si${formattedName}`;
      let simpleIcon = SimpleIcons[iconKey];
      if (!simpleIcon) {
        simpleIcon = SimpleIcons.siGhostery;
      }
      const color = getComputedStyle(document.documentElement).getPropertyValue("--text").trim();
      const svg = typeof simpleIcon === "object" && "svg" in simpleIcon ? simpleIcon.svg : "";
      const svgWithColor = svg.replace("<svg", `<svg fill="${color}"`);
      return `data:image/svg+xml;base64,${btoa(svgWithColor)}`;
    }
    $$renderer2.push(`<img class="process-icon svelte-cbcpti"${attr("src", getIconForProcess(processName))} alt=""${attr("height", size)}${attr("width", size)}/>`);
    bind_props($$props, { processName, size });
  });
}
function StatsBar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let systemStats = fallback($$props["systemStats"], null);
    $$renderer2.push(`<div class="dashboard-stats svelte-12bg7h8">`);
    if (systemStats) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="stats-layout svelte-12bg7h8">`);
      CpuPanel($$renderer2, { cpuUsage: systemStats.cpu_usage });
      $$renderer2.push(`<!----> `);
      MemoryPanel($$renderer2, {
        memoryTotal: systemStats.memory_total,
        memoryUsed: systemStats.memory_used,
        memoryFree: systemStats.memory_free
      });
      $$renderer2.push(`<!----> `);
      StoragePanel($$renderer2, {
        diskTotalBytes: systemStats.disk_total_bytes,
        diskUsedBytes: systemStats.disk_used_bytes,
        diskFreeBytes: systemStats.disk_free_bytes
      });
      $$renderer2.push(`<!----> `);
      SystemPanel($$renderer2, { uptime: systemStats.uptime, loadAvg: systemStats.load_avg });
      $$renderer2.push(`<!----> `);
      NetworkPanel($$renderer2, {
        networkRxBytes: systemStats.network_rx_bytes,
        networkTxBytes: systemStats.network_tx_bytes
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { systemStats });
  });
}
function CpuPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let averageUsage;
    let cpuUsage = $$props["cpuUsage"];
    averageUsage = formatPercentage(cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length);
    $$renderer2.push(`<div class="stat-panel svelte-ks2mu8">`);
    PanelHeader($$renderer2, {
      icon: faMicrochip,
      title: "CPU Usage",
      usageValue: averageUsage
    });
    $$renderer2.push(`<!----> <div class="stats-content cpu-grid svelte-ks2mu8"><!--[-->`);
    const each_array = ensure_array_like(cpuUsage);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let usage = each_array[i];
      $$renderer2.push(`<div class="stat-item with-progress svelte-ks2mu8">`);
      ProgressBar($$renderer2, {
        label: `Core ${i}`,
        value: usage,
        labelWidth: "2.5rem",
        valueWidth: "2.5rem"
      });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { cpuUsage });
  });
}
function MemoryPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let memoryPercentage;
    let memoryTotal = $$props["memoryTotal"];
    let memoryUsed = $$props["memoryUsed"];
    let memoryFree = $$props["memoryFree"];
    memoryPercentage = memoryUsed / memoryTotal * 100;
    $$renderer2.push(`<div class="stat-panel svelte-1h8p9mv">`);
    PanelHeader($$renderer2, {
      icon: faMemory,
      title: "Memory",
      usageValue: formatPercentage(memoryPercentage)
    });
    $$renderer2.push(`<!----> <div class="stats-content svelte-1h8p9mv"><div class="stat-item with-progress svelte-1h8p9mv">`);
    ProgressBar($$renderer2, {
      label: "Memory usage",
      value: memoryPercentage,
      labelWidth: "5rem",
      valueWidth: "2.5rem"
    });
    $$renderer2.push(`<!----></div> `);
    StatItem($$renderer2, { label: "Total", value: formatMemorySize(memoryTotal) });
    $$renderer2.push(`<!----> `);
    StatItem($$renderer2, { label: "Used", value: formatMemorySize(memoryUsed) });
    $$renderer2.push(`<!----> `);
    StatItem($$renderer2, { label: "Free", value: formatMemorySize(memoryFree) });
    $$renderer2.push(`<!----></div></div>`);
    bind_props($$props, { memoryTotal, memoryUsed, memoryFree });
  });
}
function StoragePanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let diskUsagePercentage;
    let diskTotalBytes = $$props["diskTotalBytes"];
    let diskUsedBytes = $$props["diskUsedBytes"];
    let diskFreeBytes = $$props["diskFreeBytes"];
    diskUsagePercentage = diskUsedBytes / diskTotalBytes * 100;
    $$renderer2.push(`<div class="stat-panel svelte-1igcxtb">`);
    PanelHeader($$renderer2, {
      icon: faHardDrive,
      title: "Storage",
      usageValue: formatPercentage(diskUsagePercentage)
    });
    $$renderer2.push(`<!----> <div class="stats-content svelte-1igcxtb">`);
    StatItem($$renderer2, { label: "Total", value: formatBytes(diskTotalBytes) });
    $$renderer2.push(`<!----> `);
    StatItem($$renderer2, { label: "Used", value: formatBytes(diskUsedBytes) });
    $$renderer2.push(`<!----> `);
    StatItem($$renderer2, { label: "Free", value: formatBytes(diskFreeBytes) });
    $$renderer2.push(`<!----></div></div>`);
    bind_props($$props, { diskTotalBytes, diskUsedBytes, diskFreeBytes });
  });
}
function SystemPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let uptime = $$props["uptime"];
    let loadAvg = $$props["loadAvg"];
    $$renderer2.push(`<div class="stat-panel svelte-6iy8yp">`);
    PanelHeader($$renderer2, { icon: faServer, title: "System" });
    $$renderer2.push(`<!----> <div class="system-grid svelte-6iy8yp">`);
    StatItem($$renderer2, { label: "Uptime", value: formatUptime(uptime) });
    $$renderer2.push(`<!----> `);
    StatItem($$renderer2, { label: "1m Load", value: loadAvg[0].toFixed(2) });
    $$renderer2.push(`<!----> `);
    StatItem($$renderer2, { label: "5m Load", value: loadAvg[1].toFixed(2) });
    $$renderer2.push(`<!----> `);
    StatItem($$renderer2, { label: "15m Load", value: loadAvg[2].toFixed(2) });
    $$renderer2.push(`<!----></div></div>`);
    bind_props($$props, { uptime, loadAvg });
  });
}
function NetworkPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let networkRxBytes = $$props["networkRxBytes"];
    let networkTxBytes = $$props["networkTxBytes"];
    $$renderer2.push(`<div class="stat-panel svelte-9i7y4c">`);
    PanelHeader($$renderer2, { icon: faNetworkWired, title: "Network I/O" });
    $$renderer2.push(`<!----> <div class="network-stats svelte-9i7y4c">`);
    StatItem($$renderer2, { label: "↓ Receiving", value: formatBytes(networkRxBytes) });
    $$renderer2.push(`<!----> `);
    StatItem($$renderer2, { label: "↑ Sending", value: formatBytes(networkTxBytes) });
    $$renderer2.push(`<!----></div></div>`);
    bind_props($$props, { networkRxBytes, networkTxBytes });
  });
}
function PanelHeader($$renderer, $$props) {
  let icon = $$props["icon"];
  let title = $$props["title"];
  let usageValue = fallback($$props["usageValue"], null);
  $$renderer.push(`<div class="panel-header svelte-eacvrj">`);
  Fa($$renderer, { icon });
  $$renderer.push(`<!----> <h3 class="svelte-eacvrj">${escape_html(title)}</h3> `);
  if (usageValue) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="usage-pill svelte-eacvrj">${escape_html(usageValue)}</div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--></div>`);
  bind_props($$props, { icon, title, usageValue });
}
function ProgressBar($$renderer, $$props) {
  let label = $$props["label"];
  let value = $$props["value"];
  let labelWidth = fallback($$props["labelWidth"], "2.5rem");
  let valueWidth = fallback($$props["valueWidth"], "2.5rem");
  function getUsageClass(usage) {
    if (usage > 90) return "critical";
    if (usage > 75) return "high";
    if (usage > 50) return "medium";
    return "low";
  }
  $$renderer.push(`<div class="progress-container svelte-p0md24"${attr_style(`--label-width: ${stringify(labelWidth)}; --value-width: ${stringify(valueWidth)}`)}><span class="label svelte-p0md24">${escape_html(label)}</span> <div class="bar-container svelte-p0md24"><div${attr_class(`usage-bar ${stringify(getUsageClass(value))}`, "svelte-p0md24")}${attr_style(`transform: translateX(${stringify(value - 100)}%);`)}></div></div> <span class="value svelte-p0md24">${escape_html(Math.round(value))}%</span></div>`);
  bind_props($$props, { label, value, labelWidth, valueWidth });
}
function StatItem($$renderer, $$props) {
  let label = $$props["label"];
  let value = $$props["value"];
  $$renderer.push(`<div class="stat-item svelte-shhjf"><span class="svelte-shhjf">${escape_html(label)}</span> <span class="svelte-shhjf">${escape_html(value)}</span></div>`);
  bind_props($$props, { label, value });
}
function Modal($$renderer, $$props) {
  let show = fallback($$props["show"], false);
  let maxWidth = fallback($$props["maxWidth"], "600px");
  let title = $$props["title"];
  let onClose = $$props["onClose"];
  if (show) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="modal-backdrop svelte-2aoco4"><div class="modal svelte-2aoco4"${attr_style(`--max-width: ${stringify(maxWidth)}`)}><div class="modal-header svelte-2aoco4"><h2 class="svelte-2aoco4">${escape_html(title)}</h2> <button class="btn-close svelte-2aoco4">×</button></div> <div class="modal-content svelte-2aoco4"><!--[-->`);
    slot($$renderer, $$props, "default", {});
    $$renderer.push(`<!--]--></div></div></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]-->`);
  bind_props($$props, { show, maxWidth, title, onClose });
}
function ProcessDetailsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let childProcesses;
    let show = fallback($$props["show"], false);
    let process = fallback($$props["process"], null);
    let onClose = $$props["onClose"];
    let processes = fallback($$props["processes"], () => [], true);
    let onShowDetails = $$props["onShowDetails"];
    childProcesses = process ? processes.filter((p) => p.ppid === process.pid) : [];
    Modal($$renderer2, {
      show,
      title: `${process ? process.name.slice(0, 10) : "Unknown Process"} - Process Details`,
      maxWidth: "1000px",
      onClose,
      children: ($$renderer3) => {
        if (process) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="modal-content svelte-134jolh"><div class="header-stats svelte-134jolh"><div class="stat-item svelte-134jolh"><div class="stat-label svelte-134jolh">PID</div> <div class="stat-value svelte-134jolh">${escape_html(process.pid)}</div></div> <div class="stat-item svelte-134jolh"><div class="stat-label svelte-134jolh">Status</div> <div${attr_class("stat-value status svelte-134jolh", void 0, { "running": process.status === "Running" })}>${escape_html(process.status)}</div></div> <div class="stat-item svelte-134jolh"><div class="stat-label svelte-134jolh">CPU</div> <div class="stat-value svelte-134jolh">${escape_html(process.cpu_usage.toFixed(1))}%</div></div> <div class="stat-item svelte-134jolh"><div class="stat-label svelte-134jolh">Memory</div> <div class="stat-value svelte-134jolh">${escape_html(formatBytes(process.memory_usage))}</div></div></div> <div class="content-grid svelte-134jolh"><div class="content-column svelte-134jolh"><div class="card svelte-134jolh"><div class="card-header svelte-134jolh">`);
          Fa($$renderer3, { icon: faMicrochip });
          $$renderer3.push(`<!----> <span>Process Information</span></div> <div class="card-content svelte-134jolh"><div class="info-grid svelte-134jolh"><div class="info-item svelte-134jolh"><span class="info-label svelte-134jolh">Name</span> <span class="info-value svelte-134jolh">${escape_html(process.name)}</span></div> <div class="info-item svelte-134jolh"><span class="info-label svelte-134jolh">User</span> <span class="info-value svelte-134jolh">${escape_html(process.user)}</span></div> <div class="info-item svelte-134jolh"><span class="info-label svelte-134jolh">Parent PID</span>  <span class="info-value clickable svelte-134jolh">${escape_html(process.ppid)}</span></div> <div class="info-item svelte-134jolh"><span class="info-label svelte-134jolh">Session ID</span> <span class="info-value svelte-134jolh">${escape_html(process.session_id)}</span></div></div></div></div> <div class="card svelte-134jolh"><div class="card-header svelte-134jolh">`);
          Fa($$renderer3, { icon: faMemory });
          $$renderer3.push(`<!----> <span>Resource Usage</span></div> <div class="card-content svelte-134jolh"><div class="resource-grid svelte-134jolh"><div class="resource-item svelte-134jolh"><div class="resource-header svelte-134jolh"><span>CPU Usage</span> <span class="resource-value svelte-134jolh">${escape_html(process.cpu_usage.toFixed(1))}%</span></div> <div class="progress-bar svelte-134jolh"><div${attr_class("progress-fill svelte-134jolh", void 0, {
            "high": process.cpu_usage > 50,
            "critical": process.cpu_usage > 80
          })}${attr_style(`width: ${stringify(process.cpu_usage)}%`)}></div></div></div> <div class="resource-item svelte-134jolh"><div class="resource-header svelte-134jolh"><span>Memory Usage</span></div> <div class="memory-stats svelte-134jolh"><div>Physical: ${escape_html(formatBytes(process.memory_usage))}</div> <div>Virtual: ${escape_html(formatBytes(process.virtual_memory))}</div></div></div> <div class="resource-item svelte-134jolh"><div class="resource-header svelte-134jolh"><span>Disk I/O</span></div> <div class="disk-stats svelte-134jolh"><div>Read: ${escape_html(formatBytes(process.disk_usage[0]))}</div> <div>Written: ${escape_html(formatBytes(process.disk_usage[1]))}</div></div></div></div></div></div></div> <div class="content-column svelte-134jolh"><div class="card svelte-134jolh"><div class="card-header svelte-134jolh">`);
          Fa($$renderer3, { icon: faTerminal });
          $$renderer3.push(`<!----> <span>Command</span></div> <div class="card-content svelte-134jolh"><div class="command-text svelte-134jolh">${escape_html(process.command)}</div> <div class="path-text svelte-134jolh">${escape_html(process.root)}</div></div></div> `);
          if (childProcesses.length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="card svelte-134jolh"><div class="card-header svelte-134jolh">`);
            Fa($$renderer3, { icon: faCodeFork });
            $$renderer3.push(`<!----> <span>Child Processes (${escape_html(childProcesses.length)})</span></div> <div class="card-content svelte-134jolh"><table class="process-table svelte-134jolh"><thead><tr><th class="svelte-134jolh">Name</th><th class="svelte-134jolh">PID</th><th class="svelte-134jolh">CPU</th><th class="svelte-134jolh">Memory</th></tr></thead><tbody><!--[-->`);
            const each_array = ensure_array_like(childProcesses);
            for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
              let child = each_array[$$index];
              $$renderer3.push(`<tr class="clickable svelte-134jolh"><td class="svelte-134jolh">${escape_html(child.name)}</td><td class="svelte-134jolh">${escape_html(child.pid)}</td><td class="svelte-134jolh">${escape_html(child.cpu_usage.toFixed(1))}%</td><td class="svelte-134jolh">${escape_html(formatBytes(child.memory_usage))}</td></tr>`);
            }
            $$renderer3.push(`<!--]--></tbody></table></div></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> `);
          if (process.environ.length > 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="card svelte-134jolh"><div class="card-header svelte-134jolh">`);
            Fa($$renderer3, { icon: faList });
            $$renderer3.push(`<!----> <span>Environment Variables</span></div> <div class="card-content svelte-134jolh"><div class="env-list svelte-134jolh"><!--[-->`);
            const each_array_1 = ensure_array_like(process.environ);
            for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
              let env = each_array_1[$$index_1];
              $$renderer3.push(`<div class="env-item svelte-134jolh">${escape_html(env)}</div>`);
            }
            $$renderer3.push(`<!--]--></div></div></div>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--></div></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    bind_props($$props, { show, process, onClose, processes, onShowDetails });
  });
}
function KillProcessModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let show = fallback($$props["show"], false);
    let process = fallback($$props["process"], null);
    let onClose = $$props["onClose"];
    let onConfirm = $$props["onConfirm"];
    let isKilling = fallback($$props["isKilling"], false);
    Modal($$renderer2, {
      show,
      title: "Confirm Action",
      maxWidth: "400px",
      onClose,
      children: ($$renderer3) => {
        if (process) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="confirm-content svelte-1j9pk69"><p class="confirm-message svelte-1j9pk69">Are you sure you want to end this process?</p> <div class="process-info svelte-1j9pk69"><span class="process-name svelte-1j9pk69">${escape_html(process.name)}</span> <span class="process-pid svelte-1j9pk69">(PID: ${escape_html(process.pid)})</span></div> <div class="confirm-actions svelte-1j9pk69"><button class="btn-secondary svelte-1j9pk69"${attr("disabled", isKilling, true)}>Cancel</button> <button class="btn-danger svelte-1j9pk69"${attr("disabled", isKilling, true)}>`);
          if (isKilling) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<div class="spinner svelte-1j9pk69"></div> <span>Ending...</span>`);
          } else {
            $$renderer3.push("<!--[!-->");
            $$renderer3.push(`End Process`);
          }
          $$renderer3.push(`<!--]--></button></div></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    bind_props($$props, { show, process, onClose, onConfirm, isKilling });
  });
}
function AppInfo($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let hasUpdate = false;
    $$renderer2.push(`<div class="app-info svelte-w37f43">`);
    ThemeSwitcher($$renderer2);
    $$renderer2.push(`<!----> <button aria-label="Toggle app info"${attr_class("svelte-w37f43", void 0, { "info-button": true, "has-update": hasUpdate })}><span${attr_class("icon svelte-w37f43", void 0, { "update-available": hasUpdate })}>`);
    Fa($$renderer2, { icon: faInfo });
    $$renderer2.push(`<!----></span></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function TitleBar($$renderer) {
  $$renderer.push(`<div class="title-bar svelte-tq03kl" data-tauri-drag-region=""><div class="title svelte-tq03kl"><img src="/32x32.png" alt="MonitoringMultiSystem" class="app-icon svelte-tq03kl"/> <div class="neon svelte-tq03kl">MonitoringMultiSystem</div></div></div>`);
}
let column_definitions = [
  { id: "name", label: "Process Name", visible: true, required: true },
  { id: "pid", label: "PID", visible: true, required: false },
  {
    id: "status",
    label: "Status",
    visible: true
  },
  { id: "user", label: "User", visible: true },
  {
    id: "cpu_usage",
    label: "CPU %",
    visible: true,
    format: (v) => v.toFixed(1) + "%"
  },
  {
    id: "memory_usage",
    label: "RAM",
    visible: true,
    format: (v) => (v / (1024 * 1024)).toFixed(1) + " MB"
  },
  {
    id: "virtual_memory",
    label: "VIRT",
    visible: true,
    format: (v) => formatMemorySize(v)
  },
  {
    id: "disk_usage",
    label: "Disk I/O (R/W)",
    visible: true,
    format: (v) => {
      const readMB = (v[0] / (1024 * 1024)).toFixed(1);
      const writeMB = (v[1] / (1024 * 1024)).toFixed(1);
      return `${readMB}/${writeMB} MB`;
    }
  },
  { id: "ppid", label: "Parent PID", visible: false },
  { id: "root", label: "Root", visible: false },
  { id: "command", label: "Command", visible: false },
  { id: "environ", label: "Environment Variables", visible: false },
  { id: "session_id", label: "Session ID", visible: false },
  {
    id: "start_time",
    label: "Start Time",
    visible: false,
    format: (v) => new Date(v * 1e3).toLocaleString()
    // v is the time where the process was started (in seconds) from epoch
  },
  {
    id: "run_time",
    label: "Run Time",
    visible: true,
    format: (v) => {
      const seconds = v;
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor(seconds % 3600 / 60);
      const remainingSeconds = seconds % 60;
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
  }
];
function ThemeSwitcher($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let showMenu;
    const platform = navigator.platform.toLowerCase();
    const themeGroups = [
      ...THEME_GROUPS,
      ...platform.includes("win") || platform.includes("mac") ? [{ label: "Glassy", themes: ["glassy"] }] : []
    ];
    function handleClickOutside(event) {
    }
    function setupClickOutside() {
      if (typeof document !== "undefined") {
        document.addEventListener("click", handleClickOutside);
      }
    }
    function cleanupClickOutside() {
      if (typeof document !== "undefined") {
        document.removeEventListener("click", handleClickOutside);
      }
    }
    onDestroy(() => {
      cleanupClickOutside();
    });
    showMenu = store_get($$store_subs ??= {}, "$overlayStore", overlayStore) === "theme";
    if (showMenu) {
      setTimeout(setupClickOutside, 0);
    } else {
      cleanupClickOutside();
    }
    $$renderer2.push(`<div${attr_class("theme-switcher svelte-u8uo5a", void 0, { "active": showMenu })}><button${attr_class("theme-button svelte-u8uo5a", void 0, { "active": showMenu })} aria-label="Toggle theme menu"><div class="current-theme svelte-u8uo5a"><div class="theme-preview svelte-u8uo5a"${attr_style("", {
      background: store_get($$store_subs ??= {}, "$themeStore", themeStore).colors.base
    })}><div class="preview-color svelte-u8uo5a"${attr_style("", {
      background: store_get($$store_subs ??= {}, "$themeStore", themeStore).colors.blue
    })}></div> <div class="preview-color svelte-u8uo5a"${attr_style("", {
      background: store_get($$store_subs ??= {}, "$themeStore", themeStore).colors.red
    })}></div> <div class="preview-color svelte-u8uo5a"${attr_style("", {
      background: store_get($$store_subs ??= {}, "$themeStore", themeStore).colors.green
    })}></div></div></div> <span class="icon svelte-u8uo5a">`);
    if (showMenu) {
      $$renderer2.push("<!--[-->");
      Fa($$renderer2, { icon: faChevronDown });
    } else {
      $$renderer2.push("<!--[!-->");
      Fa($$renderer2, { icon: faChevronRight });
    }
    $$renderer2.push(`<!--]--></span></button> `);
    if (showMenu) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="touchbar-full-overlay svelte-u8uo5a" role="dialog" aria-label="Theme selection" tabindex="-1">`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="touchbar-horizontal-options svelte-u8uo5a"><!--[-->`);
      const each_array = ensure_array_like(themeGroups);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let group = each_array[$$index_1];
        $$renderer2.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(group.themes);
        for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
          let themeName = each_array_1[$$index];
          const theme = themes[themeName];
          $$renderer2.push(`<button${attr_class("touchbar-option svelte-u8uo5a", void 0, {
            "active": store_get($$store_subs ??= {}, "$themeStore", themeStore).name === theme.name
          })}${attr("title", theme.label)}><div class="theme-preview svelte-u8uo5a"${attr_style("", { background: theme.colors.base })}><div class="preview-color svelte-u8uo5a"${attr_style("", { background: theme.colors.blue })}></div> <div class="preview-color svelte-u8uo5a"${attr_style("", { background: theme.colors.red })}></div> <div class="preview-color svelte-u8uo5a"${attr_style("", { background: theme.colors.green })}></div></div> <span class="theme-label svelte-u8uo5a">${escape_html(theme.label)}</span></button>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let processes, systemStats, error, searchTerm, isLoading, currentPage, pinnedProcesses, selectedProcess, showInfoModal, showConfirmModal, processToKill, isKilling, isFrozen, sortConfig, columns, itemsPerPage, refreshRate, totalPages, paginatedProcesses;
    let intervalId;
    let lastProcessCount = 0;
    let cachedFilteredProcesses = [];
    let cachedSortedProcesses = [];
    let filters = {
      cpu: { operator: ">", value: 50, enabled: false },
      ram: { operator: ">", value: 100, enabled: false },
      runtime: { operator: ">", value: 60, enabled: false },
      status: { values: [], enabled: false }
    };
    const debouncedFilter = debounce(
      () => {
        cachedFilteredProcesses = filterProcesses(processes, searchTerm, filters);
      },
      100
    );
    onDestroy(() => {
      if (intervalId) clearInterval(intervalId);
    });
    ({
      processes,
      systemStats,
      error,
      searchTerm,
      isLoading,
      currentPage,
      pinnedProcesses,
      selectedProcess,
      showInfoModal,
      showConfirmModal,
      processToKill,
      isKilling,
      isFrozen,
      sortConfig
    } = store_get($$store_subs ??= {}, "$processStore", processStore));
    columns = column_definitions.map((col) => ({
      ...col,
      visible: col.required || (store_get($$store_subs ??= {}, "$settingsStore", settingsStore).appearance.columnVisibility[col.id] ?? col.visible)
    }));
    itemsPerPage = store_get($$store_subs ??= {}, "$settingsStore", settingsStore).behavior.itemsPerPage;
    refreshRate = store_get($$store_subs ??= {}, "$settingsStore", settingsStore).behavior.refreshRate;
    if (processes.length !== lastProcessCount || searchTerm || Object.values(filters).some((f) => f.enabled)) {
      lastProcessCount = processes.length;
      debouncedFilter();
    } else if (processes.length === lastProcessCount && !searchTerm && !Object.values(filters).some((f) => f.enabled)) {
      cachedFilteredProcesses = processes;
    }
    if (cachedFilteredProcesses && (sortConfig || pinnedProcesses.size > 0)) {
      cachedSortedProcesses = sortProcesses(cachedFilteredProcesses, sortConfig, pinnedProcesses);
    } else {
      cachedSortedProcesses = cachedFilteredProcesses;
    }
    totalPages = Math.ceil(cachedFilteredProcesses.length / itemsPerPage);
    {
      if (searchTerm || itemsPerPage) {
        currentPage = 1;
      }
    }
    paginatedProcesses = cachedSortedProcesses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    {
      if (intervalId) clearInterval(intervalId);
      if (!isFrozen) {
        const adaptiveRefreshRate = refreshRate === 1e3 ? 1500 : refreshRate;
        intervalId = setInterval(
          () => {
            processStore.getProcesses();
          },
          adaptiveRefreshRate
        );
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (isLoading) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="loading-container svelte-1uha8ag"><div class="loading-content svelte-1uha8ag"><img src="128x128.png" alt="NeoHtop Logo" class="logo svelte-1uha8ag"/></div></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
        $$renderer3.push(`<div class="app-container svelte-1uha8ag">`);
        TitleBar($$renderer3);
        $$renderer3.push(`<!----> <main class="svelte-1uha8ag">`);
        if (systemStats) {
          $$renderer3.push("<!--[-->");
          StatsBar($$renderer3, { systemStats });
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        ToolBar($$renderer3, {
          totalPages,
          totalResults: cachedFilteredProcesses.length,
          get searchTerm() {
            return store_get($$store_subs ??= {}, "$processStore", processStore).searchTerm;
          },
          set searchTerm($$value) {
            store_mutate($$store_subs ??= {}, "$processStore", processStore, store_get($$store_subs ??= {}, "$processStore", processStore).searchTerm = $$value);
            $$settled = false;
          },
          get itemsPerPage() {
            return itemsPerPage;
          },
          set itemsPerPage($$value) {
            itemsPerPage = $$value;
            $$settled = false;
          },
          get currentPage() {
            return store_get($$store_subs ??= {}, "$processStore", processStore).currentPage;
          },
          set currentPage($$value) {
            store_mutate($$store_subs ??= {}, "$processStore", processStore, store_get($$store_subs ??= {}, "$processStore", processStore).currentPage = $$value);
            $$settled = false;
          },
          get refreshRate() {
            return refreshRate;
          },
          set refreshRate($$value) {
            refreshRate = $$value;
            $$settled = false;
          },
          get isFrozen() {
            return store_get($$store_subs ??= {}, "$processStore", processStore).isFrozen;
          },
          set isFrozen($$value) {
            store_mutate($$store_subs ??= {}, "$processStore", processStore, store_get($$store_subs ??= {}, "$processStore", processStore).isFrozen = $$value);
            $$settled = false;
          },
          get filters() {
            return filters;
          },
          set filters($$value) {
            filters = $$value;
            $$settled = false;
          },
          get columns() {
            return columns;
          },
          set columns($$value) {
            columns = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----> `);
        if (error) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="alert svelte-1uha8ag">${escape_html(error)}</div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        ProcessTable($$renderer3, {
          processes: paginatedProcesses,
          columns,
          systemStats,
          sortConfig,
          pinnedProcesses,
          onToggleSort: processStore.toggleSort,
          onTogglePin: processStore.togglePin,
          onShowDetails: processStore.showProcessDetails,
          onKillProcess: processStore.confirmKillProcess
        });
        $$renderer3.push(`<!----></main></div>`);
      }
      $$renderer3.push(`<!--]--> `);
      ProcessDetailsModal($$renderer3, {
        show: showInfoModal,
        process: selectedProcess,
        processes,
        onClose: processStore.closeProcessDetails,
        onShowDetails: processStore.showProcessDetails
      });
      $$renderer3.push(`<!----> `);
      KillProcessModal($$renderer3, {
        show: showConfirmModal,
        process: processToKill,
        isKilling,
        onClose: processStore.closeConfirmKill,
        onConfirm: processStore.handleConfirmKill
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
