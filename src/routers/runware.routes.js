const express = require('express');
const {
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
} = require('../controllers/runware.controller');

const router = express.Router();

// Text to image generation route
router.route('/image').post(generateTextToImage);

// Image to text processing route
router.route('/imageToText').post(processImageToText);

// Background removal route
router.route('/removeBackground').post(removeBackground);

// Image upscaling route
router.route('/upscale').post(upscaleImage);

// Text prompt enhancement route
router.route('/enhancePrompt').post(enhanceTextPrompt);

// ControlNet preprocessing route
router.route('/preprocessControlNet').post(preprocessControlNet);

// Model upload route
router.route('/uploadModel').post(uploadModel);

// PhotoMaker generation route
router.route('/photoMaker').post(generatePhotoMaker);

// Model search route
router.route('/searchModels').post(searchModels);

// Image mask processing route
router.route('/imageMask').post(processImageMask);

// Client disconnection route
router.route('/disconnect').post(disconnectClient);

module.exports = router;
