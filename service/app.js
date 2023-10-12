require('dotenv').config();
require('../dataAccessLayer/db.js');
const morgan = require('morgan');
const cors = require('cors');

const express = require('express');
const app = express();
const userRoutes = require('./routes/user.routes.js');

//Middlewares

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use('/api/reactions', userRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

