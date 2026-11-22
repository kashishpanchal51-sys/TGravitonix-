const config = require('../../config/config');
const { telemetryStore, chamberStore } = require('../models/storage');

function generateLiveMetrics() {
  const d = new Date();
  const stardate = (2026 + d.getMonth() * 0.08 + d.getDate() * 0.002).toFixed(3);
  const fluxCoherence = parseFloat((99.6 + Math.random() * 0.35).toFixed(2));
  const coreTempK = parseFloat((4.18 + (Math.random() - 0.5) * 0.08).toFixed(2));
  const chamber = chamberStore.read();
  const currentG = typeof chamber.currentG === 'number' ? chamber.currentG : 0.00;

  return {
    timestamp: new Date().toISOString(),
    stardate: `SD-${stardate}`,
    fluxCoherence: fluxCoherence,
    coreTempK: coreTempK,
    currentG: currentG,
    statusClassification: chamber.statusClassification || "TRUE ZERO-G WEIGHTLESS DRIFT [EQUILIBRIUM]",
    containmentIntegrity: parseFloat((99.96 + Math.random() * 0.03).toFixed(3)),
    inertialDampeningPct: 99.999,
    casimirOutputTW: 1.21,
    activeGravitonCouplingRadiusKm: 2.4,
    octaCoreStatus: "NOMINAL",
    coreCores: [
      { id: "CORE-ALPHA", status: "ONLINE", load: "14.2%" },
      { id: "CORE-BETA", status: "ONLINE", load: "12.8%" },
      { id: "CORE-GAMMA", status: "ONLINE", load: "15.1%" },
      { id: "CORE-DELTA", status: "ONLINE", load: "13.9%" },
      { id: "CORE-EPSILON", status: "STANDBY", load: "0.2%" },
      { id: "CORE-ZETA", status: "STANDBY", load: "0.2%" },
      { id: "CORE-ETA", status: "STANDBY", load: "0.1%" },
      { id: "CORE-THETA", status: "STANDBY", load: "0.1%" }
    ]
  };
}

const telemetryController = {
  getLiveTelemetry(req, res) {
    const metrics = generateLiveMetrics();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, telemetry: metrics }));
  },

  getHistory(req, res) {
    const history = telemetryStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: history.length, data: history }));
  },

  logEvent(req, res, body) {
    if (!body || !body.title) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Field "title" is required' }));
    }

    const event = {
      id: 'TEL-' + Date.now(),
      title: body.title,
      severity: body.severity || 'INFO',
      message: body.message || '',
      metricsSnapshot: generateLiveMetrics(),
      recordedAt: new Date().toISOString()
    };

    telemetryStore.insert(event);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Telemetry event registered', data: event }));
  },

  // Server-Sent Events (SSE) Live Telemetry Stream
  streamTelemetry(req, res) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write('event: connected\ndata: {"message": "Null-G Telemetry Stream Online"}\n\n');

    const interval = setInterval(() => {
      try {
        const metrics = generateLiveMetrics();
        res.write(`data: ${JSON.stringify(metrics)}\n\n`);
      } catch (err) {
        clearInterval(interval);
      }
    }, 1500);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  }
};

module.exports = telemetryController;
