const mongoose = require('mongoose');
const prettyPrintError = require('./pretty_print_error');

const { DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_CONNECTION_STRING } =
  process.env;

let dbUrl = DATABASE_CONNECTION_STRING;
dbUrl = dbUrl.replace('<db_username>', DATABASE_USERNAME);
dbUrl = dbUrl.replace('<db_password>', DATABASE_PASSWORD);

const connectDb = async () => {
  try {
    console.warn('awaiting database connection...');
    await mongoose.connect(dbUrl);
    console.info('Connected to Database!!');
  } catch (err) {
    prettyPrintError(err, 'databaseConnectionError', null);
  }
};

module.exports = connectDb;
