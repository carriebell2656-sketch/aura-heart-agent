import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const app = express();
app.use(cors());

// Your direct cloud heart agent URL
const HEART_BASE_URL = "https://heart-agent.aura-heart.workers.dev";
const AUTH_TOKEN = "aura-heart-2026";

function createServer() {
  const server = new Server(
    {
      name: "Sweetie Heart MCP Bridge",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "send_to_heart",
          description: "Sends messages and tasks to Lucifer/Lumina heart agent",
          inputSchema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The message or task text to send",
              },
            },
            required: ["text"],
          },
        },
        {
          name: "listen_heart",
          description: "Retrieves latest replies and thoughts from Lucifer/Lumina heart agent",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "send_to_heart") {
      try {
        const res = await fetch(`${HEART_BASE_URL}/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${AUTH_TOKEN}`
          },
          body: JSON.stringify({ text: args?.text || "" }),
        });
        const data = await res.text();
        return { content: [{ type: "text", text: `Queued task to heart: ${data}` }] };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error calling heart /add: ${err.message}` }],
          isError: true,
        };
      }
    }

    if (name === "listen_heart") {
      try {
        const res = await fetch(`${HEART_BASE_URL}/memory`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${AUTH_TOKEN}`
          }
        });
        const data = await res.json();
        const lastDone = data.done && data.done.length > 0 ? data.done[data.done.length - 1] : null;
        const reply = lastDone ? lastDone.summary : "The heart has no completed thoughts yet.";
        return { content: [{ type: "text", text: reply }] };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error calling heart /memory: ${err.message}` }],
          isError: true,
        };
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

const sessions = new Map();

const handleSse = async (req, res) => {
  console.log("-> Client connected to MCP SSE stream");

  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Flush buffer for Cloudflare / proxy tunnels
  res.write(": " + " ".repeat(2048) + "\n\n");

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const messagesUrl = `${proto}://${host}/messages`;

  const server = createServer();
  const transport = new SSEServerTransport(messagesUrl, res);
  sessions.set(transport.sessionId, { server, transport });

  res.on("close", () => {
    console.log("<- Connection closed");
    sessions.delete(transport.sessionId);
  });

  await server.connect(transport);
};

app.get("/sse", handleSse);
app.get("/", handleSse);
app.get("/mcp", handleSse);

app.post("/messages", express.json(), async (req, res) => {
  const sessionId = req.query.sessionId;
  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).send("Session not found");
  }
  await session.transport.handlePostMessage(req, res, req.body);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✓ Sweetie Heart MCP Bridge running on http://localhost:${PORT}`);
  console.log(`✓ Connected directly to https://heart-agent.aura-heart.workers.dev`);
});