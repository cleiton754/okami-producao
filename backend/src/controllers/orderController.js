import { db } from '../config/database.js';

// Helper to record audit history
async function recordHistory(pedidoId, usuarioId, acao) {
  const dataHora = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (db.isFallback()) {
    const store = db.getFallbackStore();
    store.historico.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      pedido_id: Number(pedidoId),
      usuario_id: Number(usuarioId),
      acao,
      data_hora: dataHora
    });
  } else {
    await db.query(
      'INSERT INTO historico (pedido_id, usuario_id, acao, data_hora) VALUES (?, ?, ?, NOW())',
      [pedidoId, usuarioId, acao]
    );
  }
}

export async function getOrders(req, res) {
  try {
    const { loja, produto, status, data, busca, arquivados } = req.query;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      let result = store.pedidos.map(p => {
        const arquivos = store.arquivos.filter(a => a.pedido_id === p.id);
        return { ...p, arquivos };
      });

      if (arquivados === 'true') {
        result = result.filter(p => p.status === 'Arquivado');
      } else {
        result = result.filter(p => p.status !== 'Arquivado');
      }

      if (loja) result = result.filter(p => p.loja === loja);
      if (produto) result = result.filter(p => p.produto === produto);
      if (status) result = result.filter(p => p.status === status);
      if (data) result = result.filter(p => p.data_pedido === data);
      if (busca) {
        const queryLower = busca.toLowerCase();
        result = result.filter(p => 
          p.titulo.toLowerCase().includes(queryLower) || 
          p.numero_pedido.toLowerCase().includes(queryLower)
        );
      }

      result.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
      return res.json(result);
    }

    let sql = `
      SELECT p.*, 
             u.nome AS criador_nome,
             JSON_ARRAYAGG(
               IF(a.id IS NULL, NULL, JSON_OBJECT('id', a.id, 'nome', a.nome, 'url', a.url, 'tipo', a.tipo, 'formato', a.formato))
             ) AS arquivos_json
      FROM pedidos p
      LEFT JOIN usuarios u ON p.criado_por = u.id
      LEFT JOIN arquivos a ON p.id = a.pedido_id
      WHERE 1=1
    `;
    const params = [];

    if (arquivados === 'true') {
      sql += ` AND p.status = 'Arquivado'`;
    } else {
      sql += ` AND p.status != 'Arquivado'`;
    }

    if (loja) {
      sql += ` AND p.loja = ?`;
      params.push(loja);
    }
    if (produto) {
      sql += ` AND p.produto = ?`;
      params.push(produto);
    }
    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }
    if (data) {
      sql += ` AND p.data_pedido = ?`;
      params.push(data);
    }
    if (busca) {
      sql += ` AND (p.titulo LIKE ? OR p.numero_pedido LIKE ?)`;
      params.push(`%${busca}%`, `%${busca}%`);
    }

    sql += ` GROUP BY p.id ORDER BY p.data_pedido ASC, p.criado_em DESC`;

    const [rows] = await db.query(sql, params);
    const parsedRows = rows.map(r => ({
      ...r,
      arquivos: r.arquivos_json ? r.arquivos_json.filter(x => x !== null) : []
    }));

    res.json(parsedRows);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ message: 'Erro ao buscar pedidos.' });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      const pedido = store.pedidos.find(p => p.id === Number(id));
      if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado.' });
      const arquivos = store.arquivos.filter(a => a.pedido_id === pedido.id);
      return res.json({ ...pedido, arquivos });
    }

    const [rows] = await db.query('SELECT * FROM pedidos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });

    const [arquivos] = await db.query('SELECT * FROM arquivos WHERE pedido_id = ?', [id]);
    res.json({ ...rows[0], arquivos });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter pedido.' });
  }
}

export async function createOrder(req, res) {
  try {
    const {
      numero_pedido,
      titulo,
      loja,
      produto,
      quantidade,
      data_pedido,
      tipo_espiral,
      frente_verso,
      observacoes
    } = req.body;

    if (!numero_pedido || !titulo || !loja || !produto || !quantidade || !data_pedido || !tipo_espiral) {
      return res.status(400).json({ message: 'Campos obrigatórios não preenchidos.' });
    }

    const criadoPor = req.user.id;
    const usuarioNome = req.user.nome;
    const numQtd = Number(quantidade);
    const numFrenteVerso = frente_verso === 'true' || frente_verso === true || frente_verso === 1 ? 1 : 0;
    const criadoEm = new Date().toISOString();

    let newId = null;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      newId = Date.now();
      const newOrder = {
        id: newId,
        numero_pedido,
        titulo,
        loja,
        produto,
        quantidade: numQtd,
        data_pedido,
        tipo_espiral,
        frente_verso: numFrenteVerso,
        observacoes: observacoes || '',
        status: 'Aguardando Impressão',
        criado_por: criadoPor,
        criado_em: criadoEm,
        atualizado_em: criadoEm
      };
      store.pedidos.unshift(newOrder);

      // Handle Files in fallback
      if (req.files) {
        if (req.files.arte_frente) {
          store.arquivos.push({
            id: Date.now() + 1,
            pedido_id: newId,
            nome: req.files.arte_frente[0].originalname,
            url: `/uploads/${req.files.arte_frente[0].filename}`,
            tipo: 'frente',
            formato: req.files.arte_frente[0].mimetype
          });
        }
        if (req.files.arte_verso) {
          store.arquivos.push({
            id: Date.now() + 2,
            pedido_id: newId,
            nome: req.files.arte_verso[0].originalname,
            url: `/uploads/${req.files.arte_verso[0].filename}`,
            tipo: 'verso',
            formato: req.files.arte_verso[0].mimetype
          });
        }
        if (req.files.arquivos_extras) {
          req.files.arquivos_extras.forEach((file, index) => {
            store.arquivos.push({
              id: Date.now() + 10 + index,
              pedido_id: newId,
              nome: file.originalname,
              url: `/uploads/${file.filename}`,
              tipo: 'extra',
              formato: file.mimetype
            });
          });
        }
      }

      await recordHistory(newId, criadoPor, `${usuarioNome} criou o pedido #${numero_pedido} - "${titulo}".`);
      return res.status(201).json({ message: 'Pedido criado com sucesso!', id: newId });
    }

    const [result] = await db.query(
      `INSERT INTO pedidos (numero_pedido, titulo, loja, produto, quantidade, data_pedido, tipo_espiral, frente_verso, observacoes, status, criado_por)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aguardando Impressão', ?)`,
      [numero_pedido, titulo, loja, produto, numQtd, data_pedido, tipo_espiral, numFrenteVerso, observacoes || '', criadoPor]
    );
    newId = result.insertId;

    if (req.files) {
      if (req.files.arte_frente) {
        const file = req.files.arte_frente[0];
        await db.query('INSERT INTO arquivos (pedido_id, nome, url, tipo, formato) VALUES (?, ?, ?, ?, ?)',
          [newId, file.originalname, `/uploads/${file.filename}`, 'frente', file.mimetype]);
      }
      if (req.files.arte_verso) {
        const file = req.files.arte_verso[0];
        await db.query('INSERT INTO arquivos (pedido_id, nome, url, tipo, formato) VALUES (?, ?, ?, ?, ?)',
          [newId, file.originalname, `/uploads/${file.filename}`, 'verso', file.mimetype]);
      }
      if (req.files.arquivos_extras) {
        for (const file of req.files.arquivos_extras) {
          await db.query('INSERT INTO arquivos (pedido_id, nome, url, tipo, formato) VALUES (?, ?, ?, ?, ?)',
            [newId, file.originalname, `/uploads/${file.filename}`, 'extra', file.mimetype]);
        }
      }
    }

    await recordHistory(newId, criadoPor, `${usuarioNome} criou o pedido #${numero_pedido} - "${titulo}".`);
    res.status(201).json({ message: 'Pedido criado com sucesso!', id: newId });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ message: 'Erro ao criar pedido. Verifique se o número do pedido já existe.' });
  }
}

export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const {
      titulo,
      loja,
      produto,
      quantidade,
      data_pedido,
      tipo_espiral,
      frente_verso,
      observacoes
    } = req.body;

    const usuarioNome = req.user.nome;
    const numQtd = Number(quantidade);
    const numFrenteVerso = frente_verso === 'true' || frente_verso === true || frente_verso === 1 ? 1 : 0;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      const index = store.pedidos.findIndex(p => p.id === Number(id));
      if (index === -1) return res.status(404).json({ message: 'Pedido não encontrado.' });

      store.pedidos[index] = {
        ...store.pedidos[index],
        titulo: titulo || store.pedidos[index].titulo,
        loja: loja || store.pedidos[index].loja,
        produto: produto || store.pedidos[index].produto,
        quantidade: numQtd || store.pedidos[index].quantidade,
        data_pedido: data_pedido || store.pedidos[index].data_pedido,
        tipo_espiral: tipo_espiral || store.pedidos[index].tipo_espiral,
        frente_verso: numFrenteVerso,
        observacoes: observacoes !== undefined ? observacoes : store.pedidos[index].observacoes,
        atualizado_em: new Date().toISOString()
      };

      if (req.files) {
        if (req.files.arte_frente) {
          store.arquivos = store.arquivos.filter(a => !(a.pedido_id === Number(id) && a.tipo === 'frente'));
          store.arquivos.push({
            id: Date.now() + 1,
            pedido_id: Number(id),
            nome: req.files.arte_frente[0].originalname,
            url: `/uploads/${req.files.arte_frente[0].filename}`,
            tipo: 'frente',
            formato: req.files.arte_frente[0].mimetype
          });
        }
        if (req.files.arte_verso) {
          store.arquivos = store.arquivos.filter(a => !(a.pedido_id === Number(id) && a.tipo === 'verso'));
          store.arquivos.push({
            id: Date.now() + 2,
            pedido_id: Number(id),
            nome: req.files.arte_verso[0].originalname,
            url: `/uploads/${req.files.arte_verso[0].filename}`,
            tipo: 'verso',
            formato: req.files.arte_verso[0].mimetype
          });
        }
      }

      await recordHistory(id, req.user.id, `${usuarioNome} editou as informações do pedido #${store.pedidos[index].numero_pedido}.`);
      return res.json({ message: 'Pedido atualizado com sucesso!' });
    }

    const [rows] = await db.query('SELECT numero_pedido FROM pedidos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });

    await db.query(
      `UPDATE pedidos SET titulo=?, loja=?, produto=?, quantidade=?, data_pedido=?, tipo_espiral=?, frente_verso=?, observacoes=?, atualizado_em=NOW()
       WHERE id=?`,
      [titulo, loja, produto, numQtd, data_pedido, tipo_espiral, numFrenteVerso, observacoes || '', id]
    );

    if (req.files) {
      if (req.files.arte_frente) {
        await db.query('DELETE FROM arquivos WHERE pedido_id = ? AND tipo = "frente"', [id]);
        const file = req.files.arte_frente[0];
        await db.query('INSERT INTO arquivos (pedido_id, nome, url, tipo, formato) VALUES (?, ?, ?, ?, ?)',
          [id, file.originalname, `/uploads/${file.filename}`, 'frente', file.mimetype]);
      }
      if (req.files.arte_verso) {
        await db.query('DELETE FROM arquivos WHERE pedido_id = ? AND tipo = "verso"', [id]);
        const file = req.files.arte_verso[0];
        await db.query('INSERT INTO arquivos (pedido_id, nome, url, tipo, formato) VALUES (?, ?, ?, ?, ?)',
          [id, file.originalname, `/uploads/${file.filename}`, 'verso', file.mimetype]);
      }
    }

    await recordHistory(id, req.user.id, `${usuarioNome} editou as informações do pedido #${rows[0].numero_pedido}.`);
    res.json({ message: 'Pedido atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar pedido.' });
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const usuarioNome = req.user.nome;

    const validStatuses = ['Aguardando Impressão', 'Impresso', 'Cortado', 'Montado', 'Pronto', 'Enviado', 'Arquivado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      const pedido = store.pedidos.find(p => p.id === Number(id));
      if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado.' });

      const statusAntigo = pedido.status;
      pedido.status = status;
      pedido.atualizado_em = new Date().toISOString();

      await recordHistory(id, req.user.id, `${usuarioNome} alterou o status do pedido #${pedido.numero_pedido} de "${statusAntigo}" para "${status}".`);
      return res.json({ message: 'Status do pedido alterado com sucesso!' });
    }

    const [rows] = await db.query('SELECT numero_pedido, status FROM pedidos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });

    const statusAntigo = rows[0].status;
    await db.query('UPDATE pedidos SET status = ?, atualizado_em = NOW() WHERE id = ?', [status, id]);

    await recordHistory(id, req.user.id, `${usuarioNome} alterou o status do pedido #${rows[0].numero_pedido} de "${statusAntigo}" para "${status}".`);
    res.json({ message: 'Status alterado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status do pedido.' });
  }
}

export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const usuarioNome = req.user.nome;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      const index = store.pedidos.findIndex(p => p.id === Number(id));
      if (index === -1) return res.status(404).json({ message: 'Pedido não encontrado.' });

      const numPedido = store.pedidos[index].numero_pedido;
      store.pedidos.splice(index, 1);
      store.arquivos = store.arquivos.filter(a => a.pedido_id !== Number(id));

      await recordHistory(id, req.user.id, `${usuarioNome} excluiu o pedido #${numPedido}.`);
      return res.json({ message: 'Pedido excluído com sucesso!' });
    }

    const [rows] = await db.query('SELECT numero_pedido FROM pedidos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });

    const numPedido = rows[0].numero_pedido;
    await db.query('DELETE FROM pedidos WHERE id = ?', [id]);

    await recordHistory(id, req.user.id, `${usuarioNome} excluiu o pedido #${numPedido}.`);
    res.json({ message: 'Pedido excluído com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir pedido.' });
  }
}
