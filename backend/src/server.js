import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static directory for uploaded artwork and extra files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes API REST
app.use('/api/auth', authRoutes);
app.use('/api/pedidos', orderRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/historico', historyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Sistema de Gestão de Produção Okami & Universo',
    timestamp: new Date().toISOString()
  });
});

// Start database and server
initDatabase().then(() => {
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Okami Backend executando na porta ${PORT}`);
      console.log(`📡 URL API: http://localhost:${PORT}/api`);
    });
  }
}).catch(err => {
  console.error('Erro crítico na inicialização do servidor:', err);
});

export default app;

