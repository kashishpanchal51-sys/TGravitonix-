const { chamberStore } = require('../models/storage');

function calculateClassification(gVal) {
  if (gVal < -0.4) {
    return {
      status: 'NEGATIVE MASS INVERSION [UPWARD THRUST]',
      badgeClass: 'bg-pink-950/60 border-pink-500/50 text-pink-300',
      description: 'Inverted spacetime tensor. Local matter experiences upward acceleration toward upper containment bounds.'
    };
  } else if (gVal >= -0.4 && gVal <= 0.08) {
    return {
      status: 'TRUE ZERO-G WEIGHTLESS DRIFT [EQUILIBRIUM]',
      badgeClass: 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300',
      description: 'Microgravity null-state achieved. Inertia is preserved without gravitational potential well.'
    };
  } else if (gVal > 0.08 && gVal <= 0.5) {
    return {
      status: 'LUNAR / LOW-GRAVITY FIELD [0.16G - 0.38G]',
      badgeClass: 'bg-sky-950/60 border-sky-500/50 text-sky-300',
      description: 'Sub-planetary gravitational gradient. High mobility, gentle parabolic descent.'
    };
  } else if (gVal > 0.5 && gVal <= 1.3) {
    return {
      status: 'SOL-3 EARTH BASELINE [1.00G TERRESTRIAL]',
      badgeClass: 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300',
      description: 'Standard terrestrial gravity field. High-restitution floor bouncing with standard friction.'
    };
  } else {
    return {
      status: 'HYPER-GRAVITY CRUSHING TENSOR [2.0G - 3.0G]',
      badgeClass: 'bg-amber-950/60 border-amber-500/50 text-amber-300',
      description: 'Extreme gravitational gradient. Micro-singularity tidal forces compress all matter downward.'
    };
  }
}

const chamberController = {
  getChamberState(req, res) {
    const state = chamberStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: state }));
  },

  getPresets(req, res) {
    const state = chamberStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: state.presets.length, data: state.presets }));
  },

  setGravity(req, res, body) {
    if (!body || typeof body.gravity !== 'number') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Field "gravity" must be a number between -2.00 and +3.00' }));
    }

    const gVal = Math.max(-2.0, Math.min(3.0, parseFloat(body.gravity)));
    const classification = calculateClassification(gVal);

    const state = chamberStore.read();
    state.currentG = gVal;
    state.statusClassification = classification.status;
    state.classificationDetails = classification;
    state.lastUpdated = new Date().toISOString();

    chamberStore.write(state);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Gravitational tensor calibrated to ${gVal > 0 ? '+' : ''}${gVal.toFixed(2)} G`,
      data: {
        currentG: gVal,
        classification: classification.status,
        details: classification,
        lastUpdated: state.lastUpdated
      }
    }));
  },

  getObjects(req, res) {
    const state = chamberStore.read();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: state.objects.length, data: state.objects }));
  },

  spawnObject(req, res, body) {
    const state = chamberStore.read();
    const palettes = [
      { color: '#22d3ee', glow: '#06b6d4', name: 'GRAV-CELL' },
      { color: '#c084fc', glow: '#9333ea', name: 'DARK-MATTER' },
      { color: '#34d399', glow: '#059669', name: 'ION-CORE' },
      { color: '#f472b6', glow: '#db2777', name: 'WARP-RELIC' }
    ];
    const pal = palettes[Math.floor(Math.random() * palettes.length)];

    const newObj = {
      id: body?.id || 'obj-' + Date.now(),
      type: body?.type || (Math.random() > 0.4 ? 'circle' : 'rect'),
      name: body?.name || pal.name,
      x: typeof body?.x === 'number' ? body.x : (200 + Math.random() * 400),
      y: typeof body?.y === 'number' ? body.y : (100 + Math.random() * 100),
      vx: typeof body?.vx === 'number' ? body.vx : ((Math.random() - 0.5) * 4),
      vy: typeof body?.vy === 'number' ? body.vy : ((Math.random() - 0.5) * 3),
      radius: body?.radius || (24 + Math.random() * 12),
      width: body?.width || (55 + Math.random() * 30),
      height: body?.height || (35 + Math.random() * 20),
      mass: body?.mass || (1.5 + Math.random() * 3),
      restitution: body?.restitution || 0.75,
      color: body?.color || pal.color,
      glow: body?.glow || pal.glow,
      icon: body?.icon || (body?.type === 'rect' ? '■' : '◉'),
      spawnedAt: new Date().toISOString()
    };

    state.objects.push(newObj);
    state.lastUpdated = new Date().toISOString();
    chamberStore.write(state);

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Object [${newObj.name}] spawned in Null-G containment chamber`,
      data: newObj
    }));
  },

  deleteObject(req, res, id) {
    const state = chamberStore.read();
    const index = state.objects.findIndex(o => o.id === id);
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: `Object with id "${id}" not found in chamber` }));
    }

    const removed = state.objects.splice(index, 1)[0];
    state.lastUpdated = new Date().toISOString();
    chamberStore.write(state);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Object [${removed.name}] de-materialized from chamber`,
      data: removed
    }));
  },

  triggerPulse(req, res, body) {
    const state = chamberStore.read();
    const maxRadius = body?.maxRadius || 220;
    const originX = body?.x || 400;
    const originY = body?.y || 260;

    // Server-side impulse calculation
    const affectedObjects = [];
    state.objects.forEach(obj => {
      const dx = obj.x - originX;
      const dy = obj.y - originY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < maxRadius * 1.5) {
        const force = (1 - dist / (maxRadius * 1.5)) * 14;
        obj.vx += (dx / dist) * force;
        obj.vy += (dy / dist) * force;
        affectedObjects.push({ id: obj.id, name: obj.name, newVx: obj.vx, newVy: obj.vy });
      }
    });

    state.lastUpdated = new Date().toISOString();
    chamberStore.write(state);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Graviton shockwave pulse propagated across chamber',
      pulse: { originX, originY, maxRadius, affectedCount: affectedObjects.length, affectedObjects }
    }));
  },

  toggleVortex(req, res, body) {
    const state = chamberStore.read();
    state.vortexActive = body?.active !== undefined ? !!body.active : !state.vortexActive;
    if (body?.coordinates) {
      state.vortexCoordinates = body.coordinates;
    }
    state.lastUpdated = new Date().toISOString();
    chamberStore.write(state);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: `Singularity vortex ${state.vortexActive ? 'INITIALIZED' : 'DISSOLVED'}`,
      data: { vortexActive: state.vortexActive, coordinates: state.vortexCoordinates }
    }));
  },

  resetChamber(req, res) {
    const defaultState = {
      currentG: 0.00,
      statusClassification: "TRUE ZERO-G WEIGHTLESS DRIFT [EQUILIBRIUM]",
      vortexActive: false,
      vortexCoordinates: { x: 400, y: 260 },
      presets: [
        { name: "Negative Mass Inversion", value: -1.00, code: "NEG_1G", description: "Spacetime tensor inverted upward thrust" },
        { name: "Deep Space Null-G", value: 0.00, code: "ZERO_G", description: "True zero-g weightless equilibrium" },
        { name: "Lunar Surface", value: 0.16, code: "MOON_016G", description: "Low-gravity gentle parabolic descent" },
        { name: "Martian Standard", value: 0.38, code: "MARS_038G", description: "Martian surface atmospheric gravity" },
        { name: "Earth Sol-3 Baseline", value: 1.00, code: "EARTH_1G", description: "Terrestrial reference 1.00G gravity" },
        { name: "Hyper-Gravity Tensor", value: 2.50, code: "HYPER_25G", description: "Crushing gravity gradient" }
      ],
      objects: [
        {
          id: "core-singularity",
          type: "circle",
          name: "SINGULARITY CORE",
          x: 200,
          y: 180,
          vx: 1.2,
          vy: -0.8,
          radius: 34,
          mass: 4.5,
          restitution: 0.78,
          color: "#a855f7",
          glow: "#7c3aed",
          icon: "✦"
        },
        {
          id: "graviton-rod",
          type: "rect",
          name: "GRAVITON EMITTER",
          x: 400,
          y: 210,
          vx: -1.0,
          vy: 0.5,
          width: 75,
          height: 38,
          radius: 30,
          mass: 2.8,
          restitution: 0.72,
          color: "#06b6d4",
          glow: "#22d3ee",
          icon: "⚡"
        },
        {
          id: "orbital-probe",
          type: "circle",
          name: "AETHER PROBE",
          x: 600,
          y: 150,
          vx: 0.8,
          vy: 1.1,
          radius: 28,
          mass: 2.0,
          restitution: 0.82,
          color: "#38bdf8",
          glow: "#0284c7",
          icon: "🛰"
        },
        {
          id: "heavy-cube",
          type: "rect",
          name: "ANTIMATTER POD",
          x: 300,
          y: 340,
          vx: -0.5,
          vy: -0.4,
          width: 60,
          height: 60,
          radius: 35,
          mass: 5.0,
          restitution: 0.65,
          color: "#ec4899",
          glow: "#db2777",
          icon: "⚠"
        },
        {
          id: "text-zerog",
          type: "tag",
          name: "NULL-MASS",
          text: "ZERO-G",
          x: 520,
          y: 310,
          vx: 0.6,
          vy: -0.9,
          width: 95,
          height: 34,
          radius: 35,
          mass: 1.5,
          restitution: 0.85,
          color: "#10b981",
          glow: "#059669",
          icon: "0.00G"
        },
        {
          id: "data-disk",
          type: "circle",
          name: "QUANTUM DISK",
          x: 680,
          y: 260,
          vx: -0.9,
          vy: 0.7,
          radius: 22,
          mass: 1.8,
          restitution: 0.80,
          color: "#fbbf24",
          glow: "#d97706",
          icon: "◈"
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    chamberStore.write(defaultState);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Null-G containment chamber reset to baseline specs',
      data: defaultState
    }));
  }
};

module.exports = chamberController;
