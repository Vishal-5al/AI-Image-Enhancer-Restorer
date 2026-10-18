const express = require('express');
const router = express.Router();
const { getDbStatus } = require('../config/db');
const huggingFace = require('../services/huggingFaceService');

// @route   GET /api/system/status
// @desc    Returns database, Hugging Face API connection, and server status
router.get('/status', async (req, res) => {
  try {
    const dbStatus = getDbStatus();
    const hfStatus = await huggingFace.verifyToken();
    const currentToken = huggingFace.getToken();
    const maskedToken = currentToken
      ? `${currentToken.slice(0, 6)}...${currentToken.slice(-4)}`
      : 'Not configured';

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: dbStatus,
      huggingFace: {
        tokenConfigured: !!currentToken,
        maskedToken,
        verified: hfStatus.valid,
        username: hfStatus.user || null,
        message: hfStatus.message || 'Connected to Hugging Face API'
      },
      models: [
        { name: 'caidas/swin2SR-classical-sr-x2-64', task: 'Super Resolution 2x/4x' },
        { name: 'microsoft/swinir-classical-sr-x2-64', task: 'Image Deblurring & Denoising' },
        { name: 'caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr', task: 'Historical & Vintage Photo Restoration' },
        { name: 'stabilityai/stable-diffusion-x4-upscaler', task: 'Face & Clarity Enhancement' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/system/token
// @desc    Update Hugging Face token in memory and verify
router.post('/token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    huggingFace.setToken(token.trim());
    const verification = await huggingFace.verifyToken();

    res.json({
      success: true,
      verification,
      message: verification.valid
        ? `Token updated and verified for Hugging Face user: ${verification.user}`
        : `Token updated but verification warning: ${verification.message}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
