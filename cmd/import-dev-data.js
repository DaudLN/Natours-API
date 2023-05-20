const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

dotenv.config({ path: `${__dirname}/../config.env` });

// Connection to database
const DB_LOCAL = process.env.DATABASE_URL;
const PASSWORD = process.env.ALTAS_PASSWORD;
const DATABASE = process.env.DATABASE_ATLAS.replace('<PASSWORD>', PASSWORD);
mongoose
  .connect(DATABASE, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB Connected');
  });
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours.json`, { encoding: 'utf-8' })
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, { encoding: 'utf-8' })
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/data/reviews.json`, { encoding: 'utf-8' })
);

// IMPORT DATA

const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log('Data inserted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
