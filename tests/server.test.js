const connectDb = require('../src/utils/mongodb_connect');
const mongoose = require('mongoose');

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('Server Tests', () => {
  const dbUrl = 'mongodb://fake-db-url';
  let consoleWarnSpy, consoleInfoSpy, consoleErrorSpy, processExitSpy;

  beforeAll(() => {
    // Mock console functions
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock process.exit
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore original implementations
    jest.restoreAllMocks();
  });

  afterEach(() => {
    // Clear mocks after each test
    jest.clearAllMocks();
  });

  describe('MongoDB Connection Tests', () => {
    it('should connect to the database successfully', async () => {
      mongoose.connect.mockResolvedValueOnce('Connected');
      await expect(connectDb(dbUrl)).resolves.not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'awaiting database connection...',
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith('Connected to Database!!');
      expect(mongoose.connect).toHaveBeenCalledWith(dbUrl);
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });

    it('should handle database connection failure', async () => {
      const error = new Error('Connection failed');
      mongoose.connect.mockRejectedValueOnce(error);

      await expect(connectDb(dbUrl)).rejects.toThrow('Connection failed');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'awaiting database connection...',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unable to connect to database!!',
      );
      expect(mongoose.connect).toHaveBeenCalledWith(dbUrl);
      expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Process Exception Handling', () => {
    it('should handle uncaught exceptions', () => {
      const uncaughtExceptionHandler = jest.fn();
      process.on('uncaughtException', uncaughtExceptionHandler);

      const error = new Error('Unhandled exception');
      process.emit('uncaughtException', error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Caught an unhandled exception:',
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should exit gracefully on uncaught exception', () => {
      const error = new Error('Unhandled exception');
      process.emit('uncaughtException', error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
