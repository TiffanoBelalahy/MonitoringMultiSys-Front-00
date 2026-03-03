<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    Chart,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Legend,
    Tooltip,
  } from "chart.js";
  import { get } from "svelte/store";
  import { selectedHost } from "$lib/stores/hosts";

  Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Legend,
    Tooltip
  );

  export let systemStats: any;
  export let range: string;
 
  let canvas: HTMLCanvasElement;
  let chart: Chart;

  let cpuHistory: number[] = [];
  let memHistory: number[] = [];
  let rxHistory: number[] = [];
  let txHistory: number[] = [];
  let labels: string[] = [];

  const MAX_POINTS = 60;

 

  let historyMode = false;

  async function loadHistory() {
    const agent = get(selectedHost);
    if (!agent) return;

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/agents/${agent}/history?range=${range}`
    );

    const data = await res.json();

    cpuHistory.length = 0;
    memHistory.length = 0;
    rxHistory.length = 0;
    txHistory.length = 0;
    labels.length = 0;

    data.forEach((d) => {
      cpuHistory.push(d.cpu_usage ?? 0);
      memHistory.push(
        d.memory_total
          ? (d.memory_used / d.memory_total) * 100
          : 0
      );
      rxHistory.push(d.network_receive ?? 0);
      txHistory.push(d.network_transmit ?? 0);
      labels.push(new Date(d.created_at).toLocaleTimeString());
    });

    chart.update();
  }


  onMount(() => {
    chart = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
            {
              label: "CPU %",
              data: cpuHistory,
              borderColor: "#89b4fa",
              backgroundColor: "rgba(137,180,250,0.2)",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Memory %",
              data: memHistory,
              borderColor: "#a6e3a1",
              backgroundColor: "rgba(166,227,161,0.2)",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Net RX (KB/s)",
              data: rxHistory,
              borderColor: "#f9e2af",
              backgroundColor: "rgba(249,226,175,0.15)",
              tension: 0.4,
              fill: false,
              yAxisID: "y1"
            },
            {
              label: "Net TX (KB/s)",
              data: txHistory,
              borderColor: "#f38ba8",
              backgroundColor: "rgba(243,139,168,0.15)",
              tension: 0.4,
              fill: false,
              yAxisID: "y1"
            },
          ],  
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            labels: { color: "#cdd6f4" }
          }
        },
        scales: {
          x: {
            ticks: { color: "#cdd6f4" },
            grid: { color: "rgba(255,255,255,0.05)" }
          },
          y: {
            position: "left",
            ticks: { color: "#cdd6f4" },
            grid: { color: "rgba(255,255,255,0.05)" },
            min: 0,
            max: 100
          },
          y1: {
            position: "right",
            ticks: { color: "#cdd6f4" },
            grid: { drawOnChartArea: false },
          }
        }
      }
    });
  });

  // $: if (chart && range && range !== "realtime") {
  //   historyMode = true;
  //   loadHistory();
  // }

  $: if (chart && range) {
    if (range === "realtime") {
      historyMode = false;
    } else {
      historyMode = true;
      loadHistory();
    }
  }


  $: if (chart && systemStats && !historyMode) {
    const cpu = systemStats.cpu_usage ?? 0;
    const mem =
      systemStats.memory_used && systemStats.memory_total
        ? (systemStats.memory_used / systemStats.memory_total) * 100
        : 0;
    const rx = systemStats.network_rx_bytes ?? 0;
    const tx = systemStats.network_tx_bytes ?? 0;

    cpuHistory.push(cpu);
    memHistory.push(mem);
    rxHistory.push(rx);
    txHistory.push(tx);
    labels.push("");

    if (cpuHistory.length > MAX_POINTS) {
      cpuHistory.shift();
      memHistory.shift();
      rxHistory.shift();
      txHistory.shift();
      labels.shift();
    }

    chart.update();
  }

  onDestroy(() => {
    if (chart) chart.destroy();
  });
</script>

<div class="graph-wrapper">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .graph-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    padding: 10px;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
</style>