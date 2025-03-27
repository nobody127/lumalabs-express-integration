const express = require('express');
const {
  generateImage,
  generateVideo,
} = require('../controllers/lumaai.controller');

const router = express.Router();


router.route('/image').post(generateImage);
router.route('/video').post(generateVideo);

module.exports = router;
