/**
 * ═══════════════════════════════════════════════════════════════════
 * GRAVITONIX JAVASCRIPT FRONTEND CLIENT SDK
 * Drop-in library to connect Gravitonix frontend to the backend API
 * ═══════════════════════════════════════════════════════════════════
 */

class GravitonixClient {
  constructor(baseUrl = 'http://localhost:5000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = localStorage.getItem('gravitonix_token') || null;
    this.eventSource = null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('gravitonix_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('gravitonix_token');
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  }

  // 1. Health
  async getHealth() {
    return this.request('/api/health');
  }

  // 2. Chamber
  async getChamberState() {
    return this.request('/api/chamber');
  }

  async setGravity(gravity) {
    return this.request('/api/chamber/gravity', {
      method: 'POST',
      body: JSON.stringify({ gravity })
    });
  }

  async spawnObject(objData) {
    return this.request('/api/chamber/objects', {
      method: 'POST',
      body: JSON.stringify(objData)
    });
  }

  async triggerPulse(originX, originY, maxRadius = 220) {
    return this.request('/api/chamber/pulse', {
      method: 'POST',
      body: JSON.stringify({ x: originX, y: originY, maxRadius })
    });
  }

  async toggleVortex(active, coordinates = null) {
    return this.request('/api/chamber/vortex', {
      method: 'POST',
      body: JSON.stringify({ active, coordinates })
    });
  }

  async resetChamber() {
    return this.request('/api/chamber/reset', { method: 'POST' });
  }

  // 3. Telemetry
  async getLiveTelemetry() {
    return this.request('/api/telemetry/live');
  }

  subscribeTelemetry(onUpdate, onError) {
    if (this.eventSource) {
      this.eventSource.close();
    }
    this.eventSource = new EventSource(`${this.baseUrl}/api/telemetry/stream`);
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onUpdate) onUpdate(data);
      } catch (err) {
        if (onError) onError(err);
      }
    };
    this.eventSource.onerror = (err) => {
      if (onError) onError(err);
    };
    return this.eventSource;
  }

  // 4. Applications & Blueprints
  async getApplications() {
    return this.request('/api/applications');
  }

  async submitApplicationInquiry(appId, details) {
    return this.request(`/api/applications/${appId}/inquire`, {
      method: 'POST',
      body: JSON.stringify(details)
    });
  }

  // 5. Flight Bookings
  async getExperiences() {
    return this.request('/api/bookings/experiences');
  }

  async createBooking(bookingData) {
    return this.request('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async getBooking(bookingId) {
    return this.request(`/api/bookings/${bookingId}`);
  }

  // 6. VIP Waitlist
  async joinWaitlist(name, email, targetInterest) {
    return this.request('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({ name, email, targetInterest })
    });
  }

  // 7. Contact
  async sendContactMessage(name, email, message, organization = '') {
    return this.request('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name, email, message, organization })
    });
  }
}

// Global export for script tag inclusion
if (typeof window !== 'undefined') {
  window.GravitonixClient = GravitonixClient;
  window.GravitonixAPI = new GravitonixClient();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GravitonixClient;
}
