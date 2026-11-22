const config = require('../../config/config');

function handleCors(req, res) {
  const origin = req.headers.origin;
  
  if (config.CORS_ORIGINS.includes('*') || config.CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Gravitonix-Clearance');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Sci-Fi Custom Headers
  res.setHeader('X-Powered-By', 'Gravitonix-Singularity-Engine-v2.0');
  res.setHeader('X-Telemetry-Status', 'NOMINAL');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
}

module.exports = { handleCors };
