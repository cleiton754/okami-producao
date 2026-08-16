import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';

export async function getUsers(req, res) {
  try {
    if (db.isFallback()) {
      const store = db.getFallbackStore();
      const usuarios = store.usuarios.map(({ senha_hash, ...u }) => u);
      return res.json(usuarios);
    }

    const [rows] = await db.query('SELECT id, nome, email, cargo, ativo, criado_em FROM usuarios ORDER BY criado_em DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
}

export async function createUser(req, res) {
  try {
    const { nome, email, senha, cargo } = req.body;

    if (!nome || !email || !senha || !cargo) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (!['admin', 'producao'].includes(cargo)) {
      return res.status(400).json({ message: 'Cargo inválido. Escolha admin ou producao.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const criadoEm = new Date().toISOString();

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      const existing = store.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ message: 'Email já cadastrado.' });
      }

      const newId = Date.now();
      const newUser = {
        id: newId,
        nome,
        email,
        senha_hash: senhaHash,
        cargo,
        ativo: 1,
        criado_em: criadoEm
      };
      store.usuarios.push(newUser);
      return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: newId });
    }

    const [result] = await db.query(
      'INSERT INTO usuarios (nome, email, senha_hash, cargo, ativo) VALUES (?, ?, ?, ?, 1)',
      [nome, email, senhaHash, cargo]
    );

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email já cadastrado no sistema.' });
    }
    res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, cargo, ativo, senha } = req.body;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      const user = store.usuarios.find(u => u.id === Number(id));
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

      if (nome) user.nome = nome;
      if (email) user.email = email;
      if (cargo && ['admin', 'producao'].includes(cargo)) user.cargo = cargo;
      if (ativo !== undefined) user.ativo = ativo ? 1 : 0;
      if (senha) user.senha_hash = await bcrypt.hash(senha, 10);

      return res.json({ message: 'Usuário atualizado com sucesso!' });
    }

    const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });

    let sql = 'UPDATE usuarios SET nome = ?, email = ?, cargo = ?, ativo = ?';
    const params = [nome, email, cargo, ativo ? 1 : 0];

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      sql += ', senha_hash = ?';
      params.push(senhaHash);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await db.query(sql, params);
    res.json({ message: 'Usuário atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      const user = store.usuarios.find(u => u.id === Number(id));
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

      user.ativo = user.ativo === 1 ? 0 : 1;
      return res.json({ message: `Usuário ${user.ativo ? 'ativado' : 'desativado'} com sucesso!`, ativo: user.ativo });
    }

    const [rows] = await db.query('SELECT ativo FROM usuarios WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const novoAtivo = rows[0].ativo ? 0 : 1;
    await db.query('UPDATE usuarios SET ativo = ? WHERE id = ?', [novoAtivo, id]);

    res.json({ message: `Usuário ${novoAtivo ? 'ativado' : 'desativado'} com sucesso!`, ativo: novoAtivo });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao alterar status do usuário.' });
  }
}
