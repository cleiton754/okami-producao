import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'okami_universo_secret_key_2026_super_segura';

export async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    let user = null;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      user = store.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.ativo);
    } else {
      const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email]);
      if (rows.length > 0) user = rows[0];
    }

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas ou usuário inativo.' });
    }

    const isMatch = await bcrypt.compare(senha, user.senha_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno ao realizar login.' });
  }
}

export async function me(req, res) {
  try {
    const userId = req.user.id;
    let user = null;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      user = store.usuarios.find(u => u.id === userId);
    } else {
      const [rows] = await db.query('SELECT id, nome, email, cargo, ativo, criado_em FROM usuarios WHERE id = ?', [userId]);
      if (rows.length > 0) user = rows[0];
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ usuario: user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil do usuário.' });
  }
}
