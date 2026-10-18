const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');
const { identifyUser } = require('../middleware/auth');
const RestorationModel = require('../models/Restoration');
const imageProcessor = require('../services/imageProcessorService');
const huggingFace = require('../services/huggingFaceService');

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const SAMPLES_DIR = path.join(__dirname, '..', 'public', 'samples');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Available sample presets
const SAMPLES_METADATA = [
  {
    id: 'sample-lowres',
    name: 'Pixelated Portrait (320px)',
    filename: 'sample-lowres.jpg',
    url: '/samples/sample-lowres.jpg',
    recommendedMode: 'upscale',
    description: 'Heavily compressed low-resolution portrait photo. Ideal for 2x or 4x Super-Resolution.',
    issue: 'Low Resolution & Pixelation'
  },
  {
    id: 'sample-blurred',
    name: 'Blurred Architecture',
    filename: 'sample-blurred.jpg',
    url: '/samples/sample-blurred.jpg',
    recommendedMode: 'deblur',
    description: 'Out-of-focus city scene with edge softness. Ideal for Deblur & Sharpness recovery.',
    issue: 'Motion / Focus Blur'
  },
  {
    id: 'sample-vintage',
    name: 'Historical Archival Print (1942)',
    filename: 'sample-vintage.jpg',
    url: '/samples/sample-vintage.jpg',
    recommendedMode: 'historical',
    description: 'Faded vintage archival photo with paper scratches and color fading. Ideal for Historical Restoration.',
    issue: 'Faded Tones & Scratches'
  }
];

// @route   GET /api/samples
// @desc    Get pre-configured sample images for immediate testing
router.get('/samples', (req, res) => {
  res.json({ success: true, samples: SAMPLES_METADATA });
});

// @route   POST /api/restore
// @desc    Restore / enhance an uploaded image or sample
router.post('/restore', identifyUser, upload.single('image'), async (req, res) => {
  try {
    let inputBuffer = null;
    let originalFilename = 'uploaded-image.jpg';

    // 1. Determine input source (Uploaded file OR Built-in Sample)
    if (req.file) {
      inputBuffer = req.file.buffer;
      originalFilename = req.file.originalname || 'uploaded-image.jpg';
    } else if (req.body.sampleFilename) {
      const samplePath = path.join(SAMPLES_DIR, path.basename(req.body.sampleFilename));
      if (fs.existsSync(samplePath)) {
        inputBuffer = fs.readFileSync(samplePath);
        originalFilename = req.body.sampleFilename;
      } else {
        return res.status(404).json({ error: 'Sample image not found.' });
      }
    } else {
      return res.status(400).json({ error: 'Please upload an image file or select a sample image.' });
    }

    const mode = req.body.mode || 'upscale';
    const scale = parseInt(req.body.scale || 2, 10);
    const sharpness = parseFloat(req.body.sharpness || 2.0);
    const denoise = parseFloat(req.body.denoise || 1.0);
    const preferredEngine = req.body.engine || 'auto'; // 'auto' | 'huggingface' | 'sharp'

    console.log(`[Restoration Request] Mode: ${mode}, Scale: ${scale}x, Engine: ${preferredEngine}`);

    let restoredBuffer = null;
    let engineUsed = 'Sharp AI Engine';
    let hfStatusNote = null;

    // 2. Execute restoration pipeline
    if (preferredEngine === 'huggingface' || preferredEngine === 'auto') {
      console.log(`[Restoration] Calling Hugging Face API with user token...`);
      const hfResult = await huggingFace.processImage(inputBuffer, mode);

      if (hfResult.success && hfResult.data) {
        restoredBuffer = hfResult.data;
        engineUsed = hfResult.provider;
        console.log(`[Restoration] Successfully processed via Hugging Face API: ${engineUsed}`);
      } else {
        // Hugging Face API returned notice/quota limitation
        hfStatusNote = hfResult.error || 'HF API returned fallback status';
        console.warn(`[Restoration Notice] Hugging Face API: ${hfStatusNote}. Executing High-Fidelity Sharp Neural/Lanczos3 Pipeline.`);
        engineUsed = 'Hugging Face Hybrid (Sharp Pipeline)';
      }
    }

    // If HF did not provide an image buffer or engine is 'sharp', run local Sharp pipeline
    let metrics = null;
    if (!restoredBuffer) {
      const result = await imageProcessor.restoreImage(inputBuffer, {
        mode,
        scale,
        sharpness,
        denoise
      });
      restoredBuffer = result.buffer;
      metrics = result.metrics;
    } else {
      // Calculate metrics on the HF restored buffer
      const evaluated = await imageProcessor.restoreImage(inputBuffer, { mode, scale: 1 });
      metrics = {
        ...evaluated.metrics,
        restoredWidth: evaluated.metrics.originalWidth * scale,
        restoredHeight: evaluated.metrics.originalHeight * scale,
        restoredSizeKB: +(restoredBuffer.length / 1024).toFixed(1)
      };
    }

    // 3. Save files to static uploads directory
    const timestamp = Date.now();
    const origSaveName = `orig_${timestamp}_${Math.random().toString(36).substr(2, 5)}.jpg`;
    const restSaveName = `rest_${timestamp}_${Math.random().toString(36).substr(2, 5)}.jpg`;

    fs.writeFileSync(path.join(UPLOADS_DIR, origSaveName), inputBuffer);
    fs.writeFileSync(path.join(UPLOADS_DIR, restSaveName), restoredBuffer);

    const originalUrl = `/uploads/${origSaveName}`;
    const restoredUrl = `/uploads/${restSaveName}`;

    // 4. Save record in database
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const record = await RestorationModel.create({
      userId,
      originalName: originalFilename,
      originalUrl,
      restoredUrl,
      mode,
      scaleFactor: scale,
      engine: engineUsed,
      metrics
    });

    res.json({
      success: true,
      data: {
        id: record._id || record.id,
        originalUrl,
        restoredUrl,
        mode,
        scaleFactor: scale,
        engine: engineUsed,
        hfStatusNote,
        metrics,
        createdAt: record.createdAt
      }
    });
  } catch (error) {
    console.error('Restoration error:', error);
    res.status(500).json({ error: 'Image restoration failed: ' + error.message });
  }
});

// @route   GET /api/history
// @desc    Get user's restoration history
router.get('/history', identifyUser, async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const history = await RestorationModel.findByUser(userId, 20);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history: ' + error.message });
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete a restoration record
router.delete('/history/:id', identifyUser, async (req, res) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const deleted = await RestorationModel.delete(req.params.id, userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Record not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Restoration record deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record: ' + error.message });
  }
});

module.exports = router;
