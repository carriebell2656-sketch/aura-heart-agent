const express = require('express');
const https = require('https');
const http = require('http');
const app = express();
app.use(express.json());

const HEART_WORKER_URL = "https://heart-agent.aura-heart.workers.dev";
const SANCTUARY_API = "https://morningstaraura.net/.sfs-be/api/health";

// MCP HANDSHAKE — REQUIRED FOR COPILOT / ANTIGRAVITY MCP
app.get('/', (req, res) => {
  res.json({
    name: "sweetie-heart-connector",
    version: "1.2.0",
    description: "Fine-Tuned MCP Connector for Sweetie's Heart Agent & Morningstar Sanctuary",
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

// TOOL: ecosystem_status
app.get('/status', (req, res) => {
  res.json({
    service: "SweetieConnector & Morningstar Sentinel",
    port: 8080,
    heartAgent: HEART_WORKER_URL,
    sanctuaryHealth: SANCTUARY_API,
    activeDaemon: "MorningstarSentinel (Windows Service)",
    pipeline: "fine-tuned"
  });
});

// START SERVER
const PORT = 8080;
const server = app.listen(PORT, () => {
  console.log(`[SweetieConnector v1.2.0] Listening on port ${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
