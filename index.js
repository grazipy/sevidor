const express = require('express');
const multer = require('multer');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configure multer para armazenar arquivos na pasta "uploads"
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Conexão com PostgreSQL (DATABASE_URL virá do Railway)
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect();

// Endpoint para upload de PDF
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const titulo = req.body.titulo || 'Sem título';
    const url = `/uploads/${req.file.filename}`; // URL do arquivo salvo

    // Salva no banco
    await client.query('INSERT INTO pdfs (titulo, url) VALUES ($1, $2)', [titulo, url]);

    res.json({ message: 'Upload realizado com sucesso!', url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao salvar arquivo' });
  }
});

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
