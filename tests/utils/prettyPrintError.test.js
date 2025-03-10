const prettyPrintError = require('../../src/utils/pretty_print_error');

describe('prettyPrintError', () => {
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
  const mockConsoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should print the correct error message for uncaughtException', () => {
    const error = new Error('Test Error');
    prettyPrintError(error, 'uncaughtException');

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Something Unexpected Happend!!',
    );
    expect(mockConsoleError).toHaveBeenCalledWith({
      type: 'uncaughtException',
      name: 'Error',
      message: 'Test Error',
      stack: error.stack,
    });
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('should shut down the server gracefully when a server instance is provided', () => {
    const error = new Error('Server Error');
    const mockServer = {
      close: jest.fn((callback) => callback()),
    };

    prettyPrintError(error, 'MongoServerError', mockServer);

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Unable to connect to database. Shutting down server!!',
    );
    expect(mockServer.close).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
