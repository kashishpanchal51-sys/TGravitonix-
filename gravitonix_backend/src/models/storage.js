const fs = require('fs');
const path = require('path');
const config = require('../../config/config');

class JsonStorage {
  constructor(collectionName, defaultData = []) {
    this.collectionName = collectionName;
    this.filePath = path.join(config.DATA_DIR, `${collectionName}.json`);
    this.defaultData = defaultData;
    this.ensureInitialized();
  }

  ensureInitialized() {
    try {
      if (!fs.existsSync(config.DATA_DIR)) {
        fs.mkdirSync(config.DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify(this.defaultData, null, 2), 'utf8');
      }
    } catch (err) {
      console.error(`[STORAGE INIT ERROR] ${this.collectionName}:`, err.message);
    }
  }

  read() {
    try {
      this.ensureInitialized();
      const raw = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error(`[STORAGE READ ERROR] ${this.collectionName}:`, err.message);
      return this.defaultData;
    }
  }

  write(data) {
    try {
      this.ensureInitialized();
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.filePath);
      return true;
    } catch (err) {
      console.error(`[STORAGE WRITE ERROR] ${this.collectionName}:`, err.message);
      return false;
    }
  }

  getAll() {
    return this.read();
  }

  getById(id) {
    const items = this.read();
    return items.find(item => item.id === id || item._id === id);
  }

  findOne(predicate) {
    const items = this.read();
    return items.find(predicate);
  }

  find(predicate) {
    const items = this.read();
    return items.filter(predicate);
  }

  insert(item) {
    const items = this.read();
    if (!item.id) {
      item.id = 'gv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    item.createdAt = item.createdAt || new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    items.push(item);
    this.write(items);
    return item;
  }

  updateById(id, updates) {
    const items = this.read();
    const index = items.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.write(items);
    return items[index];
  }

  deleteById(id) {
    const items = this.read();
    const initialLen = items.length;
    const filtered = items.filter(item => item.id !== id && item._id !== id);
    if (filtered.length === initialLen) return false;
    this.write(filtered);
    return true;
  }
}

// Pre-configured storage instances
module.exports = {
  JsonStorage,
  usersStore: new JsonStorage('users', []),
  bookingsStore: new JsonStorage('bookings', []),
  chamberStore: new JsonStorage('chamber_state', {}),
  applicationsStore: new JsonStorage('applications', []),
  telemetryStore: new JsonStorage('telemetry_history', []),
  waitlistStore: new JsonStorage('waitlist', []),
  incidentsStore: new JsonStorage('incidents', []),
  contactsStore: new JsonStorage('contacts', [])
};
