const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  API_PREFIX: '/api',
  DATA_DIR: path.join(__dirname, '..', 'data'),
  JWT_SECRET: process.env.JWT_SECRET || 'gravitonix-singularity-casimir-null-g-key-2026',
  TOKEN_EXPIRY_HOURS: 72,
  CORS_ORIGINS: [
    'https://gravitonix-null-g-labs-1.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:5500',
    '*'
  ],
  TELEMETRY_DEFAULTS: {
    baseFlux: 99.88,
    baseTempKelvin: 4.22,
    octaCoreStatus: 'NOMINAL',
    containmentField: 'QUAD_REDUNDANT_MAGNETIC_RINGS',
    maxCouplingRadiusKm: 2.4,
    inertialDampening: 99.999
  }
};
