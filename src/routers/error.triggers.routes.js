// src/routers/error-trigger.routes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/trigger-uncaught', (req, res) => {
  throw new Error('Manual uncaught exception');
});

router.get('/trigger-unhandled', (req, res) => {
  new Promise((resolve, reject) => {
    reject(new Error('Manual unhandled rejection'));
  });
  res.send('Triggered unhandled rejection');
});

router.get('/trigger-mongo-error', async (req, res) => {
  try {
    await mongoose.connection.db.collection('').find();
  } catch (err) {
    process.emit('MongoServerError', err);
  }
  res.send('Triggered MongoDB error');
});

module.exports = router;

// src/app.js - Add this line where you define your routes
const errorTriggerRoutes = require('./routers/error-trigger.routes');
app.use('/test', errorTriggerRoutes);

// tests/server_error_handling_tests.js - Update the require path
const server = require('../src/server'); // Update this path based on your server.js location
