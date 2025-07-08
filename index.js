const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log("Usuario conectado");

  socket.on('chat-message', (data) => {
    io.emit('chat-message', data); // reenvía a todos los conectados
  });
});

app.post('/upload', upload.single('image'), (req, res) => {
  cloudinary.uploader.upload(req.file.path, function (err, result) {
    if (err) return res.status(500).json({ error: 'Error al subir imagen' });
    res.json({ url: result.secure_url });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});
