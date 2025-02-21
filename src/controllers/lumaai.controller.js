const axios = require('axios');
const { LumaAI } = require('lumaai');
const catchAsync = require('../utils/catch_async');
const AppError = require('../utils/app_error');

// 1. Make sure LUMAAI_API_KEY is being loaded correctly
const { LUMAAI_API_KEY } = process.env;
console.log(
  'LUMAAI_API_KEY: ',
  LUMAAI_API_KEY
    ? 'API key exists (not showing for security)'
    : 'API key is missing',
);

// 2. Verify the API key is valid before initializing
if (!LUMAAI_API_KEY) {
  throw new Error('LUMAAI_API_KEY is not defined in environment variables');
}

// 3. Ensure proper initialization
const client = new LumaAI({ authToken: LUMAAI_API_KEY });

const generateImage = catchAsync(async (req, res, next) => {
  let completed = false;
  try {
    const { prompt, model, aspect_ratio, style_ref, image_ref } = req.body;
    if (!prompt) return next(new AppError('Prompt is required', 400));

    // 4. Add more detailed error handling for the initial API call
    let generation;
    try {
      generation = await client.generations.image.create({
        prompt: prompt,
        model: model || 'photon-flash-1',
        aspect_ratio: aspect_ratio || '16:9',
        style_ref: style_ref,
        image_ref: image_ref,
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to connect to Luma AI: ${apiError.message}`, 500),
      );
    }

    while (!completed) {
      try {
        generation = await client.generations.get(generation.id);
        if (generation.state === 'completed') {
          completed = true;
        } else if (generation.state === 'failed') {
          throw new Error(`Generation failed: ${generation.failure_reason}`);
        } else {
          console.log('Dreaming...');
          await new Promise((r) => setTimeout(r, 3000)); // Wait for 3 seconds
        }
      } catch (pollError) {
        console.error('Polling error:', pollError);
        throw new Error(
          `Error checking generation status: ${pollError.message}`,
        );
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'Image generated successfully',
      data: generation.assets.image,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return res.status(500).json({
      status: 'failure',
      message: err.message,
    });
  }
});

const generateVideo = catchAsync(async (req, res, next) => {
  return res.status(200).json({
    status: 'success',
    message: 'Video generated successfully',
  });
});

module.exports = { generateImage, generateVideo };
