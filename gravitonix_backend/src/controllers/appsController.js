const { applicationsStore } = require('../models/storage');

const appsController = {
  getAllApplications(req, res) {
    const apps = applicationsStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: apps.length, data: apps }));
  },

  getApplicationById(req, res, id) {
    const apps = applicationsStore.read();
    const app = apps.find(a => a.id === id);
    if (!app) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: `Technology application "${id}" not found` }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: app }));
  },

  submitInquiry(req, res, id, body) {
    const apps = applicationsStore.read();
    const app = apps.find(a => a.id === id);
    if (!app) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: `Technology application "${id}" not found` }));
    }

    if (!body || !body.email || !body.name) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Fields "name" and "email" are required' }));
    }

    const inquiry = {
      id: 'INQ-' + Date.now(),
      applicationId: id,
      applicationTitle: app.title,
      name: body.name,
      email: body.email,
      organization: body.organization || 'Independent Researcher',
      intendedUse: body.intendedUse || 'Academic evaluation',
      status: 'UNDER_REVIEW',
      clearanceVerified: false,
      submittedAt: new Date().toISOString()
    };

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Research inquiry for [${app.title}] lodged with Null-G Labs Oversight Council`,
      data: inquiry
    }));
  }
};

module.exports = appsController;
