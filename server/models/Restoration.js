const mongoose = require('mongoose');
const { getDbStatus } = require('../config/db');
const StorageService = require('../services/storageService');

const restorationSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: null,
  },
  originalName: {
    type: String,
    required: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
  restoredUrl: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: ['upscale', 'deblur', 'historical', 'face_enhance', 'auto'],
    default: 'upscale',
  },
  scaleFactor: {
    type: Number,
    default: 2,
  },
  engine: {
    type: String,
    default: 'HuggingFace API / Sharp Pipeline',
  },
  metrics: {
    originalWidth: Number,
    originalHeight: Number,
    restoredWidth: Number,
    restoredHeight: Number,
    originalSizeKB: Number,
    restoredSizeKB: Number,
    sharpnessGainPct: Number,
    psnrEstimateDb: Number,
    ssimEstimate: Number,
    processingTimeMs: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MongooseRestoration = mongoose.models.Restoration || mongoose.model('Restoration', restorationSchema);

class RestorationModel {
  static async create(data) {
    const status = getDbStatus();
    if (status.connected) {
      const record = new MongooseRestoration(data);
      return await record.save();
    }
    return await StorageService.createRestoration(data);
  }

  static async findByUser(userId, limit = 30) {
    const status = getDbStatus();
    if (status.connected) {
      let query = {};
      if (userId) {
        query = { $or: [{ userId }, { userId: null }] };
      }
      return await MongooseRestoration.find(query).sort({ createdAt: -1 }).limit(limit);
    }
    return await StorageService.getRestorationsByUser(userId, limit);
  }

  static async findById(id) {
    const status = getDbStatus();
    if (status.connected) {
      return await MongooseRestoration.findById(id);
    }
    return await StorageService.getRestorationById(id);
  }

  static async delete(id, userId) {
    const status = getDbStatus();
    if (status.connected) {
      let query = { _id: id };
      if (userId) query.userId = userId;
      const res = await MongooseRestoration.deleteOne(query);
      return res.deletedCount > 0;
    }
    return await StorageService.deleteRestoration(id, userId);
  }
}

module.exports = RestorationModel;
