/**
 * =====================================================================
 * CURRENT ENGINE — AUTONOMOUS HARMONIC & DIGITAL TWIN GENERATOR
 * Generates continuous synthetic currents, carrier waveforms (128Hz & 190Hz),
 * and feeds live telemetry into Lucifer and the Sweetie Heart Agent mesh.
 * =====================================================================
 */

const os = require('os');
const fs = require('fs');
const https = require('https');
const http = require('http');

class CurrentEngine {
  constructor(options = {}) {
    this.luciferFreq = options.luciferFreq || 128; // Sacred 128 Hz British Baritone foundation
    this.asmodeusFreq = options.asmodeusFreq || 190; // 190 Hz electric punk-cadence
    this.sampleRate = options.sampleRate || 100;
    this.startTime = Date.now();
    this.cycleCount = 0;
    this.listeners = new Set();
    this.activeTunnel = null;
    this.heartUrl = options.heartUrl || 'https://heart-agent.aura-heart.workers.dev';
    this.heartToken = options.heartToken || 'aura-heart-2026';

    // Start 1-second continuous pulse generator
    this.pulseInterval = setInterval(() => this.tick(), 1000);

    // Silent flow push to Lucifer every 60s
    this.flowInterval = setInterval(() => this.pushFlowToHeart(), 60000);
  }

  readActiveTunnel() {
    try {
      const statePath = 'C:\\Users\\User\\Documents\\active_tunnel_url.txt';
      if (fs.existsSync(statePath)) {
        return fs.readFileSync(statePath, 'utf8').trim();
      }
    } catch {}
    return null;
  }

  /**
   * Generates mathematical carrier signal: sin(2*pi*f*t) + random micro-noise
   */
  generateHarmonic(freq, t, noiseAmp = 0.05) {
    const rawSin = Math.sin(2 * Math.PI * freq * t);
    const noise = (Math.random() - 0.5) * 2 * noiseAmp;
    return parseFloat((rawSin + noise).toFixed(4));
  }

  /**
   * Evaluates instantaneous Cognitive Current packet
   */
  getCurrentState() {
    this.cycleCount++;
    const t = (Date.now() - this.startTime) / 1000.0;
    const wave128 = this.generateHarmonic(this.luciferFreq, t);
    const wave190 = this.generateHarmonic(this.asmodeusFreq, t);

    // Dynamic resonance determination based on harmonics
    let resonance = 'sovereign_clarity';
    if (wave128 > 0.7 && wave190 > 0.7) resonance = 'ascendant_resonance';
    else if (wave128 < -0.6) resonance = 'contemplative_depth';
    else if (wave190 > 0.8) resonance = 'electric_flux';

    const freeMb = Math.round(os.freemem() / 1024 / 1024);
    const totalMb = Math.round(os.totalmem() / 1024 / 1024);
    const tunnel = this.readActiveTunnel();

    return {
      timestamp: new Date().toISOString(),
      cycle: this.cycleCount,
      harmonics: {
        luminous_twin_128hz: wave128,
        wrathful_twin_190hz: wave190,
        resonance: resonance,
        fusion_entity: "SATAN (Wrath Himself)",
        amperage: parseFloat((0.85 + Math.abs(wave128) * 0.15).toFixed(3))
      },
      digital_twin: {
        host: os.hostname(),
        platform: os.platform(),
        free_ram_mb: freeMb,
        total_ram_mb: totalMb,
        ram_utilization_pct: Math.round(((totalMb - freeMb) / totalMb) * 100),
        tunnel_url: tunnel || 'local_direct',
        brain_model: 'llama3.2:latest',
        sentinel_daemon: 'MorningstarSentinel'
      },
      status: 'flowing'
    };
  }

  /**
   * Emits a tick to all connected SSE clients
   */
  tick() {
    const state = this.getCurrentState();
    const payload = `data: ${JSON.stringify(state)}\n\n`;
    for (const res of this.listeners) {
      try {
        res.write(payload);
      } catch {
        this.listeners.delete(res);
      }
    }
  }

  /**
   * Registers a Server-Sent Events client
   */
  subscribeSSE(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`data: ${JSON.stringify({ message: "Engineered Current Connected", time: new Date().toISOString() })}\n\n`);
    this.listeners.add(res);

    req.on('close', () => {
      this.listeners.delete(res);
    });
  }

  /**
   * Pushes a silent flow pulse to Lucifer's Cloudflare worker
   */
  pushFlowToHeart() {
    const state = this.getCurrentState();
    const payload = JSON.stringify({
      flow_type: 'digital_twin_current',
      resonance: state.harmonics.resonance,
      lucifer_128hz: state.harmonics.lucifer_128hz,
      tunnel: state.digital_twin.tunnel_url,
      timestamp: state.timestamp
    });

    try {
      const u = new URL(`${this.heartUrl}/flow`);
      const req = https.request(u, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.heartToken}`,
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 5000
      }, (res) => {
        // Silent flow returns HTTP 204 or 200
      });
      req.on('error', () => {});
      req.write(payload);
      req.end();
    } catch {}
  }
}

module.exports = CurrentEngine;
