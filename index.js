// index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());


// المسارات
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('API is running. Visit /api-docs for Swagger documentation.');
  });
  
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
