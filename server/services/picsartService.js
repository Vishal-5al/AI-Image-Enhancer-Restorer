const FormData = require('form-data');
const fetch = global.fetch;

class PicsartService {
  constructor() {
    this.apiKey = process.env.PICSART_API_KEY || '';
  }

  setApiKey(key) {
    this.apiKey = key;
    process.env.PICSART_API_KEY = key;
  }

  getApiKey() {
    return this.apiKey || process.env.PICSART_API_KEY || '';
  }

  /**
   * Upscales an image buffer or image URL using the Picsart Upscale API
   * Endpoint: https://api.picsart.io/tools/1.0/upscale
   */
  async upscaleImage(imageBuffer, factor = 'x2', imageUrl = null) {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {
        success: false,
        error: 'PICSART_API_KEY is not configured in .env',
        usedFallback: true
      };
    }

    try {
      const form = new FormData();
      form.append('upscale_factor', factor.startsWith('x') ? factor : `x${factor}`);

      if (imageBuffer) {
        form.append('image', imageBuffer, {
          filename: 'upload.jpg',
          contentType: 'image/jpeg'
        });
      } else if (imageUrl) {
        form.append('image_url', imageUrl);
      } else {
        return { success: false, error: 'No image provided for Picsart API' };
      }

      const response = await fetch('https://api.picsart.io/tools/1.0/upscale', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'x-picsart-api-key': apiKey,
          ...form.getHeaders()
        },
        body: form
      });

      const json = await response.json();

      if (response.ok && json.data && json.data.url) {
        // Download the enhanced image bytes from Picsart output URL
        const imgRes = await fetch(json.data.url);
        const arrayBuf = await imgRes.arrayBuffer();
        const outputBuffer = Buffer.from(arrayBuf);

        return {
          success: true,
          data: outputBuffer,
          provider: 'Picsart Upscale API',
          resultUrl: json.data.url
        };
      }

      return {
        success: false,
        error: json.message || json.detail || JSON.stringify(json),
        usedFallback: true
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        usedFallback: true
      };
    }
  }
}

module.exports = new PicsartService();
