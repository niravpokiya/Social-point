const express = require('express');
const app = express();

// Test basic route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
