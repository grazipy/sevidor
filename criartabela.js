// criarTabela.js
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:kagDZGaIuNoAMzxRVYLCgHCoFYfxOndB@caboose.proxy.rlwy.net:20905/railway';

async function criarTabela() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  const query = `
    CREATE TABLE IF NOT EXISTS pdfs (
      id SERIAL PRIMARY KEY,
      titulo VARCHAR(255),
      url TEXT
    );
  `;

  await client.query(query);
  console.log('Tabela criada com sucesso!');

  await client.end();
}

criarTabela().catch(console.error);
