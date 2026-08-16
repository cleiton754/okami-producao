import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

let pool = null;
let isFallback = false;

// Em-memory fallback store for when MySQL server is not accessible
const fallbackStore = {
  usuarios: [],
  pedidos: [],
  arquivos: [],
  historico: []
};

// Seed initial fallback data
(async () => {
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const producaoPasswordHash = await bcrypt.hash('producao123', 10);
  
  fallbackStore.usuarios = [
    {
      id: 1,
      nome: 'Administrador Okami',
      email: 'admin@okami.com',
      senha_hash: adminPasswordHash,
      cargo: 'admin',
      ativo: 1,
      criado_em: new Date().toISOString()
    },
    {
      id: 2,
      nome: 'Operador Produção',
      email: 'producao@okami.com',
      senha_hash: producaoPasswordHash,
      cargo: 'producao',
      ativo: 1,
      criado_em: new Date().toISOString()
    }
  ];

  fallbackStore.pedidos = [
    {
      id: 1,
      numero_pedido: 'PED-1001',
      titulo: 'Bloquinhos Personalizados Ana Maria',
      loja: 'Okami',
      produto: 'Bloquinho',
      quantidade: 50,
      data_pedido: new Date().toISOString().slice(0, 10),
      tipo_espiral: 'Preto',
      frente_verso: 1,
      observacoes: 'Capa laminada fosca',
      status: 'Aguardando Impressão',
      criado_por: 1,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    },
    {
      id: 2,
      numero_pedido: 'PED-1002',
      titulo: 'Caderneta de Anotações Universo',
      loja: 'Universo',
      produto: 'Caderneta',
      quantidade: 20,
      data_pedido: new Date().toISOString().slice(0, 10),
      tipo_espiral: 'Transparente',
      frente_verso: 0,
      observacoes: 'Entrega urgente',
      status: 'Impresso',
      criado_por: 1,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    }
  ];

  fallbackStore.historico = [
    {
      id: 1,
      pedido_id: 1,
      usuario_id: 1,
      acao: 'Pedido #PED-1001 criado por Administrador Okami.',
      data_hora: new Date().toISOString()
    },
    {
      id: 2,
      pedido_id: 2,
      usuario_id: 1,
      acao: 'Pedido #PED-1002 alterado para Impresso por Administrador Okami.',
      data_hora: new Date().toISOString()
    }
  ];
})();

export async function initDatabase() {
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    };

    const tempConnection = await mysql.createConnection(config);
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'okami_producao'}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConnection.end();

    pool = mysql.createPool({
      ...config,
      database: process.env.DB_NAME || 'okami_producao',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Create tables if not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        cargo ENUM('admin', 'producao') NOT NULL DEFAULT 'producao',
        ativo BOOLEAN DEFAULT TRUE,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero_pedido VARCHAR(100) NOT NULL UNIQUE,
        titulo VARCHAR(255) NOT NULL,
        loja ENUM('Okami', 'Universo') NOT NULL,
        produto ENUM('Bloquinho', 'Caderneta', 'Agenda') NOT NULL,
        quantidade INT NOT NULL DEFAULT 1,
        data_pedido DATE NOT NULL,
        tipo_espiral VARCHAR(100) NOT NULL,
        frente_verso BOOLEAN DEFAULT FALSE,
        observacoes TEXT,
        status ENUM('Aguardando Impressão', 'Impresso', 'Cortado', 'Montado', 'Pronto', 'Enviado', 'Arquivado') DEFAULT 'Aguardando Impressão',
        criado_por INT NOT NULL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_pedidos_criado_por FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS arquivos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        tipo ENUM('frente', 'verso', 'extra') NOT NULL,
        formato VARCHAR(50),
        CONSTRAINT fk_arquivos_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS historico (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT NOT NULL,
        usuario_id INT NOT NULL,
        acao TEXT NOT NULL,
        data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_historico_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure default admin exists
    const [existingUsers] = await pool.query('SELECT * FROM usuarios WHERE email = ?', ['admin@okami.com']);
    if (existingUsers.length === 0) {
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO usuarios (nome, email, senha_hash, cargo, ativo) VALUES (?, ?, ?, ?, ?)',
        ['Administrador Okami', 'admin@okami.com', adminPasswordHash, 'admin', 1]
      );
      const producaoPasswordHash = await bcrypt.hash('producao123', 10);
      await pool.query(
        'INSERT INTO usuarios (nome, email, senha_hash, cargo, ativo) VALUES (?, ?, ?, ?, ?)',
        ['Operador Produção', 'producao@okami.com', producaoPasswordHash, 'producao', 1]
      );
    }

    console.log('✅ Conexão MySQL estabelecida com sucesso!');
    isFallback = false;
  } catch (error) {
    console.warn('⚠️ Não foi possível conectar ao servidor MySQL local. Ativando Fallback em memória para desenvolvimento continuo sem erros.');
    console.warn('Detalhe:', error.message);
    isFallback = true;
  }
}

export const db = {
  isFallback: () => isFallback,
  getFallbackStore: () => fallbackStore,
  query: async (sql, params = []) => {
    if (!isFallback && pool) {
      return pool.query(sql, params);
    }
    // Fallback executor interface
    throw new Error('Using fallback mode - calls handled by controllers directly.');
  }
};
