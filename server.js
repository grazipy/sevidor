require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // necessário para Railway
});

app.use(cors());

// Configuração multer para upload em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { originalname, buffer } = req.file;
    const titulo = req.body.titulo || originalname;

    // Salvar PDF no banco como BYTEA
    const query = `
      INSERT INTO pdfs (titulo, arquivo) VALUES ($1, $2) RETURNING id
    `;
    const values = [titulo, buffer];

    const result = await pool.query(query, values);

    res.json({ success: true, id: result.rows[0].id, url: `/pdf/${result.rows[0].id}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/pdf/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT titulo, arquivo FROM pdfs WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('PDF não encontrado');
    }

    const pdf = result.rows[0];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.titulo}"`);
    res.send(pdf.arquivo);
  } catch (error) {
    res.status(500).send('Erro ao buscar PDF');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
