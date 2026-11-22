const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');
const { handleCors } = require('./src/middleware/corsMiddleware');
const { handleApiRoutes } = require('./src/routes/apiRouter');

const PORT = config.PORT;

const server = http.createServer((req, res) => {
  // 1. CORS Preflight & Headers
  if (handleCors(req, res)) {
    return;
  }

  // 2. Parse Request URL & Query Parameters
  const parsedUrl = url.parse(req.url, true);
  const pathName = parsedUrl.pathname;
  const queryParams = parsedUrl.query;

  // 3. Serve Interactive API Docs at /docs or /
  if (pathName === '/' || pathName === '/docs' || pathName === '/docs.html') {
    const docsPath = path.join(__dirname, 'src', 'public', 'docs.html');
    if (fs.existsSync(docsPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(docsPath).pipe(res);
    }
  }

  // 4. Serve Frontend SDK Client
  if (pathName === '/gravitonix-client.js') {
    const clientSdkPath = path.join(__dirname, 'src', 'public', 'gravitonix-client.js');
    if (fs.existsSync(clientSdkPath)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
      return fs.createReadStream(clientSdkPath).pipe(res);
    }
  }

  // 5. Read Body Data (for POST, PUT, PATCH)
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk.toString();
  });

  req.on('end', () => {
    let body = null;
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload' }));
      }
    }

    console.log(`[GRAVITONIX API] ${req.method} ${pathName} ${body ? JSON.stringify(body) : ''}`);

    // 6. Delegate to Master API Router
    try {
      handleApiRoutes(req, res, pathName, queryParams, body);
    } catch (routeErr) {
      console.error(`[API UNHANDLED ERROR] ${pathName}:`, routeErr);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Spacetime anomaly: Internal server fault',
        details: routeErr.message
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`
  ══════════════════════════════════════════════════════════════
  ✦ GRAVITONIX · NULL-G LABS BACKEND API OPERATIONAL ✦
  ══════════════════════════════════════════════════════════════
  ► Local Server:     http://localhost:${PORT}
  ► API Base:         http://localhost:${PORT}/api
  ► Health Endpoint:  http://localhost:${PORT}/api/health
  ► Interactive Docs: http://localhost:${PORT}/docs
  ► Live Telemetry:   http://localhost:${PORT}/api/telemetry/live
  ► Telemetry SSE:    http://localhost:${PORT}/api/telemetry/stream
  ► Physics Chamber:  http://localhost:${PORT}/api/chamber
  ► Flight Bookings:  http://localhost:${PORT}/api/bookings/experiences
  ► Front-End Origin: https://gravitonix-null-g-labs-1.vercel.app/
  ══════════════════════════════════════════════════════════════
  `);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[GRAVITONIX UNCAUGHT EXCEPTION]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[GRAVITONIX UNHANDLED REJECTION]:', reason);
});
