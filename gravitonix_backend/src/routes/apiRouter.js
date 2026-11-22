const authController = require('../controllers/authController');
const chamberController = require('../controllers/chamberController');
const telemetryController = require('../controllers/telemetryController');
const appsController = require('../controllers/appsController');
const bookingsController = require('../controllers/bookingsController');
const waitlistController = require('../controllers/waitlistController');
const contactController = require('../controllers/contactController');

function handleApiRoutes(req, res, pathName, queryParams, body) {
  const method = req.method;

  // 1. System Health Check
  if (method === 'GET' && (pathName === '/api' || pathName === '/api/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      service: 'GRAVITONIX · Null-G Labs Core Backend API',
      status: 'OPERATIONAL',
      version: '2.4.0-quantum',
      stardate: `SD-${(2026 + new Date().getMonth() * 0.08).toFixed(3)}`,
      engine: 'Singularity-Casimir-Inversion-Engine',
      docsUrl: '/docs'
    }));
  }

  // 2. Authentication Routes
  if (pathName === '/api/auth/register' && method === 'POST') {
    return authController.register(req, res, body);
  }
  if (pathName === '/api/auth/login' && method === 'POST') {
    return authController.login(req, res, body);
  }
  if (pathName === '/api/auth/profile' && method === 'GET') {
    return authController.getProfile(req, res);
  }

  // 3. Gravity Chamber Simulator Routes
  if (pathName === '/api/chamber' && method === 'GET') {
    return chamberController.getChamberState(req, res);
  }
  if (pathName === '/api/chamber/presets' && method === 'GET') {
    return chamberController.getPresets(req, res);
  }
  if (pathName === '/api/chamber/gravity' && (method === 'POST' || method === 'PUT')) {
    return chamberController.setGravity(req, res, body);
  }
  if (pathName === '/api/chamber/objects' && method === 'GET') {
    return chamberController.getObjects(req, res);
  }
  if (pathName === '/api/chamber/objects' && method === 'POST') {
    return chamberController.spawnObject(req, res, body);
  }
  if (pathName.startsWith('/api/chamber/objects/') && method === 'DELETE') {
    const objId = pathName.replace('/api/chamber/objects/', '');
    return chamberController.deleteObject(req, res, objId);
  }
  if (pathName === '/api/chamber/pulse' && method === 'POST') {
    return chamberController.triggerPulse(req, res, body);
  }
  if (pathName === '/api/chamber/vortex' && method === 'POST') {
    return chamberController.toggleVortex(req, res, body);
  }
  if (pathName === '/api/chamber/reset' && method === 'POST') {
    return chamberController.resetChamber(req, res);
  }

  // 4. Telemetry Routes & SSE Stream
  if (pathName === '/api/telemetry/live' && method === 'GET') {
    return telemetryController.getLiveTelemetry(req, res);
  }
  if (pathName === '/api/telemetry/history' && method === 'GET') {
    return telemetryController.getHistory(req, res);
  }
  if (pathName === '/api/telemetry/log' && method === 'POST') {
    return telemetryController.logEvent(req, res, body);
  }
  if (pathName === '/api/telemetry/stream' && method === 'GET') {
    return telemetryController.streamTelemetry(req, res);
  }

  // 5. Applications & Tech Blueprints Routes
  if (pathName === '/api/applications' && method === 'GET') {
    return appsController.getAllApplications(req, res);
  }
  if (pathName.startsWith('/api/applications/') && pathName.endsWith('/inquire') && method === 'POST') {
    const appId = pathName.replace('/api/applications/', '').replace('/inquire', '');
    return appsController.submitInquiry(req, res, appId, body);
  }
  if (pathName.startsWith('/api/applications/') && method === 'GET') {
    const appId = pathName.replace('/api/applications/', '');
    return appsController.getApplicationById(req, res, appId);
  }

  // 6. Zero-G Experience & Flight Booking Routes
  if (pathName === '/api/bookings/experiences' && method === 'GET') {
    return bookingsController.getExperiences(req, res);
  }
  if (pathName === '/api/bookings' && method === 'GET') {
    return bookingsController.getAllBookings(req, res);
  }
  if (pathName === '/api/bookings' && method === 'POST') {
    return bookingsController.createBooking(req, res, body);
  }
  if (pathName.startsWith('/api/bookings/') && pathName.endsWith('/cancel') && (method === 'PUT' || method === 'POST')) {
    const bookingId = pathName.replace('/api/bookings/', '').replace('/cancel', '');
    return bookingsController.cancelBooking(req, res, bookingId);
  }
  if (pathName.startsWith('/api/bookings/') && method === 'GET') {
    const bookingId = pathName.replace('/api/bookings/', '');
    return bookingsController.getBookingById(req, res, bookingId);
  }

  // 7. VIP Waitlist Routes
  if (pathName === '/api/waitlist' && method === 'POST') {
    return waitlistController.joinWaitlist(req, res, body);
  }
  if (pathName === '/api/waitlist' && method === 'GET') {
    return waitlistController.getWaitlist(req, res);
  }
  if (pathName.startsWith('/api/waitlist/status/') && method === 'GET') {
    const email = pathName.replace('/api/waitlist/status/', '');
    return waitlistController.checkStatus(req, res, email);
  }

  // 8. Contact & Emergency Incident Reporting
  if (pathName === '/api/contact' && method === 'POST') {
    return contactController.submitContact(req, res, body);
  }
  if (pathName === '/api/contact' && method === 'GET') {
    return contactController.getContacts(req, res);
  }
  if (pathName === '/api/incidents' && method === 'POST') {
    return contactController.reportIncident(req, res, body);
  }
  if (pathName === '/api/incidents' && method === 'GET') {
    return contactController.getIncidents(req, res);
  }

  // 404 Route Not Found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify({
    success: false,
    error: `Quantum route not registered: [${method}] ${pathName}`,
    docs: '/docs'
  }));
}

module.exports = { handleApiRoutes };
