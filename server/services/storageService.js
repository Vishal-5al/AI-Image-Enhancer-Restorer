const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data folder and store file exist
const initStorage = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [],
      restorations: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
};

const readData = () => {
  initStorage();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { users: [], restorations: [] };
  }
};

const writeData = (data) => {
  initStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const StorageService = {
  // User operations
  findUserByEmail: async (email) => {
    const data = readData();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById: async (id) => {
    const data = readData();
    return data.users.find(u => u._id === id || u.id === id);
  },

  createUser: async (userData) => {
    const data = readData();
    const newUser = {
      _id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    writeData(data);
    return newUser;
  },

  // Restoration operations
  createRestoration: async (record) => {
    const data = readData();
    const newRecord = {
      _id: 'rst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      ...record,
      createdAt: new Date().toISOString()
    };
    data.restorations.unshift(newRecord);
    writeData(data);
    return newRecord;
  },

  getRestorationsByUser: async (userId, limit = 20) => {
    const data = readData();
    let list = data.restorations;
    if (userId) {
      list = list.filter(r => r.userId === userId || !r.userId);
    }
    return list.slice(0, limit);
  },

  getRestorationById: async (id) => {
    const data = readData();
    return data.restorations.find(r => r._id === id || r.id === id);
  },

  deleteRestoration: async (id, userId) => {
    const data = readData();
    const idx = data.restorations.findIndex(r => r._id === id && (!userId || r.userId === userId));
    if (idx !== -1) {
      data.restorations.splice(idx, 1);
      writeData(data);
      return true;
    }
    return false;
  }
};

module.exports = StorageService;
