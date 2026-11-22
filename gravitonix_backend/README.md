# GRAVITONIX · Null-G Labs Backend Suite
### Enterprise-Grade Sci-Fi REST API & Real-Time Telemetry Engine

Built for **[GRAVITONIX · Defy Physics, Experience Weightlessness](https://gravitonix-null-g-labs-1.vercel.app/)**

---

## ✦ System Architecture & Features

1. **Zero-Dependency Core**: Built with native Node.js (`http`, `url`, `fs`, `path`, `crypto`). Runs instantly with `node server.js` without requiring external package installations.
2. **Interactive Holographic Docs UI**: Built-in visual test console at `http://localhost:5000/docs`.
3. **Real-time Telemetry (SSE)**: Live streaming event source at `/api/telemetry/stream` for HUD sync (Casimir flux, cryo temp, stardate, octa-core status).
4. **2D Gravity Chamber State Engine**: Synchronizes gravity tensor values (-2.00G to +3.00G), impulse shockwaves, singularity vortex coordinate pulling, and object life-cycles.
5. **Zero-G Flight & Chamber Reservation Engine**: Manages commercial suborbital mag-grav transit flights, orbital weightlessness passes, and stratospheric cloud citadel reservations with holographic QR passes.
6. **Applications & Technology Blueprint Catalog**: Delivers all 6 high-tech modules (`space-travel`, `architecture`, `transportation`, `reactor-core`, `bio-synthesis`, `kinetic-shields`) and accepts partnership inquiries.
7. **Security & Clearance Matrix**: JWT and clearance token authentication with 5 security tiers (`LEVEL_1_CITIZEN` through `LEVEL_5_DIRECTOR`).
8. **CORS Configured**: Pre-configured to accept requests from `https://gravitonix-null-g-labs-1.vercel.app/` and local frontends.

---

## ✦ Quick Start

### 1. Launch Server
In the backend directory:
```bash
node server.js
```

The server starts immediately on **`http://localhost:5000`**.

### 2. Open Interactive Documentation & Test Console
Open your browser to:
```
http://localhost:5000/docs
```
You can click any endpoint in the console to execute queries and view live JSON responses.

---

## ✦ API Reference Summary

### 1. Health & Status
- **`GET /api/health`**: Returns system status, active version, stardate, and engine health.

### 2. Telemetry Engine
- **`GET /api/telemetry/live`**: Live snapshot of flux coherence, Kelvin temp, stardate, and core loads.
- **`GET /api/telemetry/stream`**: Server-Sent Events (SSE) stream broadcasting live metrics every 1.5 seconds.
- **`GET /api/telemetry/history`**: Historical time-series telemetry logs.
- **`POST /api/telemetry/log`**: Record an anomaly or system diagnostic event.

### 3. Gravity Chamber Simulator
- **`GET /api/chamber`**: Current chamber state, gravity vector, and active objects.
- **`GET /api/chamber/presets`**: Gravity preset list (Negative Mass, Zero-G, Moon, Mars, Earth, Hyper-G).
- **`POST /api/chamber/gravity`**: Calibrate gravity scalar (`{ "gravity": -1.00 }`).
- **`GET /api/chamber/objects`**: List all physical entities in the chamber.
- **`POST /api/chamber/objects`**: Spawn a new particle/crystal/orb in the chamber.
- **`DELETE /api/chamber/objects/:id`**: Dematerialize an object from the chamber.
- **`POST /api/chamber/pulse`**: Propagate a graviton shockwave (`{ "x": 400, "y": 260, "maxRadius": 220 }`).
- **`POST /api/chamber/vortex`**: Toggle singularity vortex mode (`{ "active": true, "coordinates": { "x": 400, "y": 260 } }`).
- **`POST /api/chamber/reset`**: Reset chamber to baseline specs.

### 4. Zero-G Experience & Flight Bookings
- **`GET /api/bookings/experiences`**: Catalog of suborbital, orbital, and chamber flights.
- **`GET /api/bookings`**: List active reservations.
- **`POST /api/bookings`**: Book a flight pass with digital holographic QR pass token.
  ```json
  {
    "experienceId": "exp-suborbital-express",
    "passengerName": "Captain Jane Miller",
    "email": "jane@spacetime.io",
    "clearanceLevel": "LEVEL_3_RESIDENT"
  }
  ```
- **`GET /api/bookings/:id`**: Retrieve digital boarding pass.
- **`PUT /api/bookings/:id/cancel`**: Cancel or reschedule booking.

### 5. Applications & Technology Blueprints
- **`GET /api/applications`**: Complete list of the 6 core technologies.
- **`GET /api/applications/:id`**: Detailed specs, benchmarks, and research team details.
- **`POST /api/applications/:id/inquire`**: Submit partnership or academic research inquiry.

### 6. VIP Waitlist & Contact
- **`POST /api/waitlist`**: Register for orbital citizenship or flight queue.
- **`GET /api/waitlist/status/:email`**: Check queue rank and priority status.
- **`POST /api/contact`**: Submit inquiry to the Spacetime Division.
- **`POST /api/incidents`**: Report gravitational flux anomaly or containment fault.

---

## ✦ Frontend Integration (How to Hook into the Live Website)

Include the generated SDK script:
```html
<script src="http://localhost:5000/gravitonix-client.js"></script>
```

Or initialize via JavaScript:
```javascript
const client = new GravitonixClient('http://localhost:5000');

// 1. Sync live chamber gravity
await client.setGravity(-1.00);

// 2. Stream real-time telemetry into the HUD
client.subscribeTelemetry((metrics) => {
  document.getElementById('header-g-telemetry').textContent = `${metrics.currentG.toFixed(2)} G`;
  document.getElementById('telemetry-flux').textContent = `${metrics.fluxCoherence}%`;
  document.getElementById('telemetry-temp').textContent = `${metrics.coreTempK} K`;
  document.getElementById('telemetry-stardate').textContent = metrics.stardate;
});

// 3. Book a Zero-G flight
const pass = await client.createBooking({
  experienceId: 'exp-orbital-weightlessness',
  passengerName: 'Commander Alex',
  email: 'alex@null-g-labs.org'
});
console.log('Boarding Pass QR Token:', pass.data.qrToken);
```
