const { bookingsStore } = require('../models/storage');

const bookingsController = {
  getExperiences(req, res) {
    const data = bookingsStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: data.experiences ? data.experiences.length : 0,
      data: data.experiences || []
    }));
  },

  getAllBookings(req, res) {
    const data = bookingsStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: data.reservations ? data.reservations.length : 0,
      data: data.reservations || []
    }));
  },

  getBookingById(req, res, id) {
    const data = bookingsStore.read();
    const booking = (data.reservations || []).find(b => b.id === id);
    if (!booking) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: `Reservation pass with ID "${id}" not found` }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: booking }));
  },

  createBooking(req, res, body) {
    if (!body || !body.passengerName || !body.email || !body.experienceId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Missing required booking parameters: passengerName, email, experienceId'
      }));
    }

    const data = bookingsStore.read();
    const exp = (data.experiences || []).find(e => e.id === body.experienceId);
    if (!exp) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: `Invalid experienceId: "${body.experienceId}". Choose from: ${data.experiences.map(e => e.id).join(', ')}`
      }));
    }

    const bookingId = 'BK-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const tokenSeed = (body.passengerName.replace(/\s+/g, '').toUpperCase() + '-' + bookingId).substring(0, 24);
    const qrToken = `GV-PASS-${tokenSeed}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newBooking = {
      id: bookingId,
      experienceId: exp.id,
      experienceTitle: exp.title,
      route: exp.route,
      passengerName: body.passengerName,
      email: body.email,
      clearanceLevel: body.clearanceLevel || 'LEVEL_1_CITIZEN',
      date: body.date || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      timeSlot: body.timeSlot || '10:00 UTC',
      seatNumber: body.seatNumber || ('SEAT-' + Math.floor(1 + Math.random() * 20) + (Math.random() > 0.5 ? 'A' : 'B')),
      status: 'CONFIRMED',
      priceUSD: exp.priceUSD,
      qrToken: qrToken,
      medicalClearance: body.medicalClearance !== undefined ? !!body.medicalClearance : true,
      notes: body.notes || 'Standard Zero-G orbital transit protocol.',
      bookedAt: new Date().toISOString()
    };

    if (!data.reservations) data.reservations = [];
    data.reservations.push(newBooking);
    bookingsStore.write(data);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Reservation confirmed for ${exp.title}. Digital Holographic Boarding Pass generated.`,
      data: newBooking
    }));
  },

  cancelBooking(req, res, id) {
    const data = bookingsStore.read();
    const booking = (data.reservations || []).find(b => b.id === id);
    if (!booking) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: `Reservation pass with ID "${id}" not found` }));
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    bookingsStore.write(data);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Reservation [${id}] has been cancelled and refunded to account.`,
      data: booking
    }));
  }
};

module.exports = bookingsController;
