const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./db'); // Assuming you have a database connection file

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
const authRoutes = require('./routes/authRoute');
const orgRoutes = require('./routes/orgRoutes');
const userRoutes = require('./routes/users');

app.use('/auth', authRoutes);
app.use('/api/organisations', orgRoutes);
app.use('/api/users', userRoutes);

// Start server
db.sync() // Sync models with the database
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

  module.exports = app; // Export the app for testing purposes  