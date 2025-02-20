const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const app = require('./app');

const {DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_CONNECTION_STRING} = process.env;

const dbUrl = DATABASE_CONNECTION_STRING.replace(
  '<db_username>',
  DATABASE_USERNAME,
).replace(
  '<db_password>',
  DATABASE_PASSWORD,
);

mongoose
  .connect(dbUrl)
  .then((val) => {
    console.log(`Connected to database`);
  })
  .catch((err) => {
    console.log(`Something went wrong! Can't connect to database`);
    console.log(`Error: ${err}`);
  });

const port = process.env.PORT || 5002;

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
