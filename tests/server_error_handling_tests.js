const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Server Error Handling Tests', () => {
  let mongoServer;
  let originalEnv;

  beforeAll(() => {
    // Backup original env variables
    originalEnv = { ...process.env };
    // Silence console logs during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore original env variables
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  afterEach(async () => {
    if (mongoServer) {
      await mongoServer.stop();
    }
    await mongoose.disconnect();
  });

  // Test 1: Database Connection Error
  test('should handle invalid database connection string', async () => {
    process.env.DATABASE_CONNECTION_STRING = 'mongodb://invalid:27017';
    process.env.DATABASE_USERNAME = 'test';
    process.env.DATABASE_PASSWORD = 'test';

    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error');

    require('../server'); // Your server file path

    // Wait for connection attempt to fail
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to connect to database'),
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  // Test 2: Uncaught Exception
  test('should handle uncaught exceptions', async () => {
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error');

    require('../server');

    process.emit('uncaughtException', new Error('Test uncaught exception'));

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'Uncaught Exception',
        message: 'Test uncaught exception',
      }),
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  // Test 3: Unhandled Rejection
  test('should handle unhandled rejections', async () => {
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error');

    require('../server');

    process.emit('unhandledRejection', new Error('Test unhandled rejection'));

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'Unhandled Rejection',
        message: 'Test unhandled rejection',
      }),
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  // Test 4: MongoDB Error
  test('should handle MongoDB server errors', async () => {
    const processExitSpy = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error');

    require('../server');

    process.emit('MongoServerError', new Error('Test MongoDB error'));

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MongoDB Error',
        message: 'Test MongoDB error',
      }),
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  // Test 5: Successful Server Start
  test('should start server successfully with valid database connection', async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    process.env.DATABASE_CONNECTION_STRING = mongoUri;
    process.env.DATABASE_USERNAME = 'test';
    process.env.DATABASE_PASSWORD = 'test';

    const consoleSpy = jest.spyOn(console, 'log');

    require('../server');

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(consoleSpy).toHaveBeenCalledWith('Connected to database');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Server listening on port'),
    );
  });
});
