require('dotenv').config();
require('../dataAccessLayer/db.js');
const morgan = require('morgan');
const cors = require('cors');

const express = require('express');
const app = express();

const userRoutes = require('./routes/user.routes.js');
const colorRoutes = require('./routes/color.routes.js');
const messageRoutes = require('./routes/message.routes.js');

//Middlewares

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use('/api/reactions', userRoutes);
app.use("/api/colors", colorRoutes);
app.use("/api/messages", messageRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

