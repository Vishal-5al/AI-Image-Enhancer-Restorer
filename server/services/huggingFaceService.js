const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Configurable Hugging Face models for restoration tasks
const HF_MODELS = {
  upscale: 'caidas/swin2SR-classical-sr-x2-64',
  deblur: 'microsoft/swinir-classical-sr-x2-64',
  historical: 'caidas/swin2SR-realworld-sr-x4-64-bsrgan-psnr',
  face_enhance: 'stabilityai/stable-diffusion-x4-upscaler'
};

class HuggingFaceService {
  constructor() {
    this.customToken = null;
  }

  getToken() {
    return this.customToken || process.env.HF_TOKEN || '';
  }

  setToken(newToken) {
    this.customToken = newToken;
    process.env.HF_TOKEN = newToken;
  }

  async verifyToken() {
    const token = this.getToken();
    if (!token) {
      return { valid: false, message: 'No Hugging Face token provided' };
    }
    try {
      const res = await fetch('https://huggingface.co/api/whoami-v2', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return {
          valid: true,
          user: data.name || data.type || 'HuggingFace User',
          type: data.type,
          canPay: data.canPay || false
        };
      } else {
        const err = await res.text();
        return { valid: false, message: `Token invalid: ${err}` };
      }
    } catch (e) {
      return { valid: false, message: `Connection error: ${e.message}` };
    }
  }

  /**
   * Attempts to run inference via Hugging Face API.
   * If HF router returns 402 (quota/credits required), 503 (model loading),
   * or model unsupported by free tier, returns detailed status so hybrid engine seamlessly processes the image.
   */
  async processImage(imageBuffer, mode = 'upscale') {
    const model = HF_MODELS[mode] || HF_MODELS.upscale;
    const startTime = Date.now();

    const token = this.getToken();
    if (!token) {
      return {
        success: false,
        error: 'HF_TOKEN missing in server configuration',
        usedFallback: true,
        latencyMs: 0
      };
    }

    try {
      // 1. Try Hugging Face Inference Router
      const routerUrl = `https://router.huggingface.co/hf-inference/models/${model}`;
      const response = await fetch(routerUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
          'x-wait-for-model': 'true'
        },
        body: imageBuffer
      });

      const contentType = response.headers.get('content-type') || '';

      if (response.ok && contentType.startsWith('image/')) {
        const arrayBuffer = await response.arrayBuffer();
        return {
          success: true,
          data: Buffer.from(arrayBuffer),
          provider: `Hugging Face API (${model})`,
          latencyMs: Date.now() - startTime
        };
      }

      // Read response body for debugging/diagnostic feedback
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (err) {
        errorBody = err.message;
      }

      let parsedErr = errorBody;
      try {
        const json = JSON.parse(errorBody);
        parsedErr = json.error || errorBody;
      } catch (e) {
        // text format
      }

      return {
        success: false,
        statusCode: response.status,
        error: parsedErr,
        modelAttempted: model,
        usedFallback: true,
        latencyMs: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        usedFallback: true,
        latencyMs: Date.now() - startTime
      };
    }
  }
}

module.exports = new HuggingFaceService();
