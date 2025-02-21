const prettyPrintError = (err, type = 'uncaughtException', server) => {
  const prettyError = {
    type,
    name: err.name,
    message: err.message,
    stack: err.stack,
  };

  console.error(messages[type]);
  console.error(prettyError);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
};

const messages = {
  uncaughtException: 'Something Unexpected Happend!!',
  unhandledRejection: 'Something Unexpected Happend. Shutting down server!!',
  MongoServerError: 'Unable to connect to database. Shutting down server!!',
  databaseConnectionError: 'Unable to connect to database!!',
};

module.exports = prettyPrintError;
