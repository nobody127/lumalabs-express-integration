const { Runware } = require('@runware/sdk-js');
const catchAsync = require('../utils/catch_async');
const AppError = require('../utils/app_error');


// 1. Make sure RUNWARE_API_KEY is being loaded correctly
const { RUNWARE_API_KEY } = process.env;
console.log(
  'RUNWARE_API_KEY: ',
  RUNWARE_API_KEY
    ? 'API key exists (not showing for security)'
    : 'API key is missing',
);

// 2. Verify the API key is valid before initializing
if (!RUNWARE_API_KEY) {
  throw new Error('RUNWARE_API_KEY is not defined in environment variables');
}

// 3. Initialize Runware client
let runwareClient = null;

const getRunwareClient = async () => {
  if (!runwareClient) {
    try {
      runwareClient = new Runware({ apiKey: RUNWARE_API_KEY });
      await runwareClient.ensureConnection();
    } catch (error) {
      console.error('Failed to initialize Runware client:', error);
      throw new Error(`Runware initialization error: ${error.message}`);
    }
  }
  return runwareClient;
};

const generateTextToImage = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const {
      positivePrompt,
      negativePrompt,
      width,
      height,
      model,
      numberResults,
      outputType,
      outputFormat,
      checkNSFW,
      seedImage,
      maskImage,
      strength,
      steps,
      scheduler,
      seed,
      CFGScale,
      clipSkip,
      usePromptWeighting,
      controlNet,
      lora,
      includeCost
    } = req.body;

    // Validate required parameters
    if (!positivePrompt) return next(new AppError('Positive prompt is required', 400));
    if (!width) return next(new AppError('Width is required', 400));
    if (!height) return next(new AppError('Height is required', 400));
    if (!model) return next(new AppError('Model is required', 400));

    // Make the API call with detailed error handling
    let images;
    try {
      images = await client.requestImages({
        positivePrompt,
        negativePrompt,
        width,
        height,
        model,
        numberResults: numberResults || 1,
        outputType: outputType || 'URL',
        outputFormat: outputFormat || 'PNG',
        checkNSFW,
        seedImage,
        maskImage,
        strength,
        steps,
        scheduler,
        seed,
        CFGScale,
        clipSkip,
        usePromptWeighting,
        controlNet,
        lora,
        includeCost: includeCost !== false,
        onPartialImages: (partialImages, error) => {
          if (error) {
            console.error('Partial image error:', error);
          }
        }
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to generate images: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Images generated successfully',
      results: images.length,
      data: images,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`Image generation failed: ${err.message}`, 500));
  }
});

const processImageToText = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const { inputImage, includeCost } = req.body;

    // Validate required parameters
    if (!inputImage) return next(new AppError('Input image is required', 400));

    // Make the API call with error handling
    let imageToText;
    try {
      imageToText = await client.requestImageToText({
        inputImage,
        includeCost
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to process image to text: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Image to text processed successfully',
      data: imageToText,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`Image to text processing failed: ${err.message}`, 500));
  }
});

const removeBackground = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const {
      inputImage,
      outputType,
      outputFormat,
      rgba,
      postProcessMask,
      returnOnlyMask,
      alphaMatting,
      alphaMattingForegroundThreshold,
      alphaMattingBackgroundThreshold,
      alphaMattingErodeSize,
      includeCost
    } = req.body;

    // Validate required parameters
    if (!inputImage) return next(new AppError('Input image is required', 400));

    // Make the API call with error handling
    let backgroundRemoved;
    try {
      backgroundRemoved = await client.removeImageBackground({
        inputImage,
        outputType,
        outputFormat,
        rgba,
        postProcessMask,
        returnOnlyMask,
        alphaMatting,
        alphaMattingForegroundThreshold,
        alphaMattingBackgroundThreshold,
        alphaMattingErodeSize,
        includeCost
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to remove background: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Background removed successfully',
      data: backgroundRemoved,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`Background removal failed: ${err.message}`, 500));
  }
});

const upscaleImage = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const {
      inputImage,
      upscaleFactor,
      outputType,
      outputFormat,
      includeCost
    } = req.body;

    // Validate required parameters
    if (!inputImage) return next(new AppError('Input image is required', 400));
    if (!upscaleFactor) return next(new AppError('Upscale factor is required', 400));

    // Make the API call with error handling
    let upscaledImage;
    try {
      upscaledImage = await client.upscaleGan({
        inputImage,
        upscaleFactor,
        outputType,
        outputFormat,
        includeCost
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to upscale image: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Image upscaled successfully',
      data: upscaledImage,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`Image upscaling failed: ${err.message}`, 500));
  }
});

const enhanceTextPrompt = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const {
      prompt,
      promptMaxLength,
      promptVersions,
      includeCost
    } = req.body;

    // Validate required parameters
    if (!prompt) return next(new AppError('Prompt is required', 400));

    // Make the API call with error handling
    let enhancedPrompt;
    try {
      enhancedPrompt = await client.enhancePrompt({
        prompt,
        promptMaxLength,
        promptVersions,
        includeCost
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to enhance prompt: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Prompt enhanced successfully',
      data: enhancedPrompt,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`Prompt enhancement failed: ${err.message}`, 500));
  }
});

const preprocessControlNet = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const {
      inputImage,
      preProcessorType,
      height,
      width,
      outputType,
      outputFormat,
      highThresholdCanny,
      lowThresholdCanny,
      includeHandsAndFaceOpenPose,
      includeCost
    } = req.body;

    // Validate required parameters
    if (!inputImage) return next(new AppError('Input image is required', 400));
    if (!preProcessorType) return next(new AppError('Preprocessor type is required', 400));

    // Make the API call with error handling
    let preprocessedImage;
    try {
      preprocessedImage = await client.controlNetPreProcess({
        inputImage,
        preProcessorType,
        height,
        width,
        outputType,
        outputFormat,
        highThresholdCanny,
        lowThresholdCanny,
        includeHandsAndFaceOpenPose,
        includeCost
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to preprocess image for ControlNet: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Image preprocessed for ControlNet successfully',
      data: preprocessedImage,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`ControlNet preprocessing failed: ${err.message}`, 500));
  }
});

const uploadModel = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const {
      category,
      air,
      name,
      downloadURL,
      uniqueIdentifier,
      version,
      format,
      architecture,
      heroImageURL,
      tags,
      shortDescription,
      comment,
      private: isPrivate,
      customTaskUUID,
      // Category-specific fields
      conditioning,
      positiveTriggerWords,
      defaultCFGScale,
      defaultStrength,
      defaultSteps,
      defaultScheduler,
      type,
      defaultWeight
    } = req.body;

    // Validate required parameters
    if (!category) return next(new AppError('Category is required', 400));
    if (!air) return next(new AppError('AIR is required', 400));
    if (!name) return next(new AppError('Name is required', 400));
    if (!downloadURL) return next(new AppError('Download URL is required', 400));
    if (!uniqueIdentifier) return next(new AppError('Unique identifier is required', 400));
    if (!version) return next(new AppError('Version is required', 400));
    if (!format) return next(new AppError('Format is required', 400));
    if (!architecture) return next(new AppError('Architecture is required', 400));
    
    // Check for category-specific required fields
    if (category === 'controlnet' && !conditioning) {
      return next(new AppError('Conditioning is required for ControlNet models', 400));
    }
    if (category === 'checkpoint' && !defaultStrength) {
      return next(new AppError('Default strength is required for checkpoint models', 400));
    }
    if (category === 'lora' && !defaultWeight) {
      return next(new AppError('Default weight is required for LoRA models', 400));
    }

    // Base payload for all model types
    const basePayload = {
      air,
      name,
      downloadURL,
      uniqueIdentifier,
      version,
      format,
      architecture,
      heroImageURL,
      tags,
      shortDescription,
      comment,
      private: isPrivate,
      customTaskUUID,
      onUploadStream: (response, error) => {
        if (error) {
          console.error('Upload stream error:', error);
        }
      }
    };

    // Make the API call with error handling
    let uploadResult;
    try {
      uploadResult = await client.modelUpload({
        ...basePayload,
        category,
        // Add category-specific fields
        ...(category === 'controlnet' && { conditioning }),
        ...(category === 'checkpoint' && { 
          positiveTriggerWords,
          defaultCFGScale,
          defaultStrength,
          defaultSteps,
          defaultScheduler,
          type
        }),
        ...(category === 'lora' && { 
          defaultWeight,
          positiveTriggerWords
        })
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to upload model: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Model uploaded successfully',
      data: uploadResult,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`Model upload failed: ${err.message}`, 500));
  }
});

const generatePhotoMaker = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const {
      positivePrompt,
      height,
      width,
      numberResults,
      steps,
      inputImages,
      style,
      strength,
      outputFormat,
      includeCost,
      customTaskUUID
    } = req.body;

    // Validate required parameters
    if (!positivePrompt) return next(new AppError('Positive prompt is required', 400));
    if (!height) return next(new AppError('Height is required', 400));
    if (!width) return next(new AppError('Width is required', 400));
    if (!numberResults) return next(new AppError('Number of results is required', 400));
    if (!inputImages || !inputImages.length) return next(new AppError('Input images are required', 400));
    if (!style) return next(new AppError('Style is required', 400));

    // Make the API call with error handling
    let photoMakerResults;
    try {
      photoMakerResults = await client.photoMaker({
        positivePrompt,
        height,
        width,
        numberResults,
        steps,
        inputImages,
        style,
        strength,
        outputFormat,
        includeCost,
        customTaskUUID,
        onPartialImages: (partialImages, error) => {
          if (error) {
            console.error('Partial image error:', error);
          }
        }
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to generate PhotoMaker images: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'PhotoMaker images generated successfully',
      results: photoMakerResults.length,
      data: photoMakerResults,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`PhotoMaker generation failed: ${err.message}`, 500));
  }
});

const searchModels = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const {
      search,
      tags,
      category,
      architecture,
      limit,
      offset,
      owned,
      featured,
      type,
      conditioning,
      private: isPrivate,
      customTaskUUID
    } = req.body;

    // Validate required parameters
    if (!search) return next(new AppError('Search query is required', 400));

    // Make the API call with error handling
    let modelSearchResults;
    try {
      modelSearchResults = await client.modelSearch({
        search,
        tags,
        category,
        architecture,
        limit,
        offset,
        owned,
        featured,
        type,
        conditioning,
        private: isPrivate,
        customTaskUUID
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to search models: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Models searched successfully',
      results: modelSearchResults.totalResults,
      data: modelSearchResults,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`Model search failed: ${err.message}`, 500));
  }
});

const processImageMask = catchAsync(async (req, res, next) => {
  try {
    const client = await getRunwareClient();
    
    const {
      model,
      inputImage,
      confidence,
      maskPadding,
      maskBlur,
      outputFormat,
      outputType,
      includeCost,
      uploadEndpoint,
      customTaskUUID
    } = req.body;

    // Validate required parameters
    if (!model) return next(new AppError('Model is required', 400));
    if (!inputImage) return next(new AppError('Input image is required', 400));

    // Make the API call with error handling
    let imageMaskResult;
    try {
      imageMaskResult = await client.imageMask({
        model,
        inputImage,
        confidence,
        maskPadding,
        maskBlur,
        outputFormat,
        outputType,
        includeCost,
        uploadEndpoint,
        customTaskUUID
      });
    } catch (apiError) {
      console.error('API call error details:', apiError);
      return next(
        new AppError(`Failed to process image mask: ${apiError.message}`, 500),
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Image mask processed successfully',
      data: imageMaskResult,
    });
  } catch (err) {
    console.error('Full error object:', err);
    return next(new AppError(`Image mask processing failed: ${err.message}`, 500));
  }
});

const disconnectClient = catchAsync(async (req, res, next) => {
  try {
    if (runwareClient) {
      await runwareClient.disconnect();
      runwareClient = null;
      return res.status(200).json({
        status: 'success',
        message: 'Runware client disconnected successfully',
      });
    } else {
      return res.status(200).json({
        status: 'success',
        message: 'No Runware client was connected',
      });
    }
  } catch (err) {
    console.error('Disconnect error:', err);
    return next(new AppError(`Failed to disconnect client: ${err.message}`, 500));
  }
});

module.exports = {
  generateTextToImage,
  processImageToText,
  removeBackground,
  upscaleImage,
  enhanceTextPrompt,
  preprocessControlNet,
  uploadModel,
  generatePhotoMaker,
  searchModels,
  processImageMask,
  disconnectClient
};
