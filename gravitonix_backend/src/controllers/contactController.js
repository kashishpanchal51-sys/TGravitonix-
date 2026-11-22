const { contactsStore, incidentsStore } = require('../models/storage');

const contactController = {
  submitContact(req, res, body) {
    if (!body || !body.name || !body.email || !body.message) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Required fields: name, email, message' }));
    }

    const contact = {
      id: 'CNT-' + Date.now(),
      name: body.name,
      email: body.email,
      organization: body.organization || 'Unspecified',
      subject: body.subject || 'General Inquiry',
      message: body.message,
      status: 'RECEIVED',
      submittedAt: new Date().toISOString()
    };

    contactsStore.insert(contact);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Transmission received by Gravitonix Advanced Spacetime Division.',
      data: contact
    }));
  },

  getContacts(req, res) {
    const list = contactsStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: list.length, data: list }));
  },

  reportIncident(req, res, body) {
    if (!body || !body.title) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Incident title is required' }));
    }

    const incident = {
      id: 'INC-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      title: body.title,
      severity: body.severity || 'MEDIUM',
      component: body.component || 'Quantum Containment',
      description: body.description || 'Anomalous flux signature logged.',
      reportedBy: body.reportedBy || 'Chamber Sensor Array',
      status: 'INVESTIGATING',
      timestamp: new Date().toISOString()
    };

    incidentsStore.insert(incident);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Emergency incident logged into Gravitonix Security Matrix',
      data: incident
    }));
  },

  getIncidents(req, res) {
    const list = incidentsStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: list.length, data: list }));
  }
};

module.exports = contactController;
