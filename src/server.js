const dotenv = require('dotenv');
const prettyPrintError = require('./utils/pretty_print_error');
const connectDb = require('./utils/mongodb_connect');

process.on('uncaughtException', (err) => {
  prettyPrintError(err, 'uncaughtException', null);
});

dotenv.config();
const app = require('./app');

const { PORT } = process.env;
const port = PORT || 5002;

const startServer = async () => {
  try {
    await connectDb();
    const server = app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

    process.on('MongoServerError', (err) => {
      prettyPrintError(err, 'MongoServerError', server);
    });

    process.on('unhandledRejection', (err) => {
      prettyPrintError(err, 'unhandledRejection', server);
    });
  } catch (err) {
    prettyPrintError(err, 'uncaughtException', server);
  }
};

startServer();
