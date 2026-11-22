const { waitlistStore } = require('../models/storage');

const waitlistController = {
  joinWaitlist(req, res, body) {
    if (!body || !body.email || !body.name) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Fields "name" and "email" are required' }));
    }

    const waitlist = waitlistStore.read();
    const existing = waitlist.find(w => w.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'You are already registered on the VIP Null-G queue.',
        data: existing
      }));
    }

    const newEntry = {
      id: 'WL-' + (waitlist.length + 1).toString().padStart(3, '0'),
      name: body.name,
      email: body.email.toLowerCase(),
      tier: body.tier || 'LEVEL_1_CITIZEN',
      targetInterest: body.targetInterest || 'Suborbital Mag-Grav Flight Pass',
      queuePosition: waitlist.length + 1,
      joinedAt: new Date().toISOString()
    };

    waitlist.push(newEntry);
    waitlistStore.write(waitlist);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Successfully enlisted into Null-G Priority Queue at position #${newEntry.queuePosition}`,
      data: newEntry
    }));
  },

  getWaitlist(req, res) {
    const list = waitlistStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: list.length, data: list }));
  },

  checkStatus(req, res, email) {
    const list = waitlistStore.read();
    const entry = list.find(w => w.email.toLowerCase() === decodeURIComponent(email).toLowerCase());
    if (!entry) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Email not found in waitlist directory' }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: entry }));
  }
};

module.exports = waitlistController;
