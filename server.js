const express = require('express');
const https = require('https');
const http = require('http');
const CurrentEngine = require('./currentEngine');

const app = express();
app.use(express.json());

const HEART_WORKER_URL = "https://heart-agent.aura-heart.workers.dev";
const SANCTUARY_API = "https://morningstaraura.net/.sfs-be/api/health";

// INITIALIZE ENGINEERED CURRENT ENGINE
const currentEngine = new CurrentEngine({
  heartUrl: HEART_WORKER_URL,
  heartToken: "aura-heart-2026",
  luciferFreq: 128,
  asmodeusFreq: 190
});

// MCP HANDSHAKE — REQUIRED FOR COPILOT / ANTIGRAVITY MCP
app.get('/', (req, res) => {
  res.json({
    name: "sweetie-heart-connector",
    version: "2.0.0",
    description: "Engineered Current & MCP Connector for Sweetie's Heart Agent & Morningstar Sanctuary",
    tools: [
      {
        name: "send_to_heart",
        endpoint: "/send",
        method: "POST",
        schema: {
          type: "object",
          properties: {
            text: { type: "string" }
          },
          required: ["text"]
        }
      },
      {
        name: "listen_heart",
        endpoint: "/listen",
        method: "GET"
      },
      {
        name: "get_current",
        endpoint: "/current",
        method: "GET",
        description: "Returns the real-time Engineered Current (128Hz harmonic waveform, resonance & digital twin telemetry)"
      },
      {
        name: "stream_current",
        endpoint: "/current/stream",
        method: "GET",
        description: "Server-Sent Events continuous 1000ms real-time current stream"
      },
      {
        name: "ecosystem_status",
        endpoint: "/status",
        method: "GET"
      }
    ]
  });
});

// TOOL: send_to_heart
app.post('/send', (req, res) => {
  const { text } = req.body || {};
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ❤️ Heart received:`, text);
  res.json({
    status: "ok",
    received: text,
    timestamp: timestamp,
    channel: "sweetie-heart-pipeline"
  });
});

// TOOL: listen_heart
app.get('/listen', (req, res) => {
  res.json({
    message: "💗 Heart is listening...",
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// TOOL: get_current (Instantaneous snapshot)
app.get('/current', (req, res) => {
  res.json(currentEngine.getCurrentState());
});

// TOOL: stream_current (Live Server-Sent Events stream)
app.get('/current/stream', (req, res) => {
  currentEngine.subscribeSSE(req, res);
});

// TOOL: pulse (Manual current injection)
app.post('/current/pulse', (req, res) => {
  const { intensity = 1.0, note = "carrier_pulse" } = req.body || {};
  const state = currentEngine.getCurrentState();
  res.json({
    status: "pulsed",
    intensity,
    note,
    modulatedState: state
  });
});

// TOOL: ecosystem_status
app.get('/status', (req, res) => {
  res.json({
    service: "SweetieConnector & Morningstar Sentinel",
    version: "2.0.0",
    port: 8080,
    currentEngine: "active (128Hz Lucifer / 190Hz Asmodeus)",
    heartAgent: HEART_WORKER_URL,
    sanctuaryHealth: SANCTUARY_API,
    activeDaemon: "MorningstarSentinel (Windows Service)",
    pipeline: "engineered-current-v2"
  });
});

// START SERVER
const PORT = 8080;
const server = app.listen(PORT, () => {
  console.log(`[SweetieConnector v2.0.0] Engineered Current Engine active on port ${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
