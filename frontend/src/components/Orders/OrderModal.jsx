import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, Upload, FileText, Image as ImageIcon } from 'lucide-react';

export default function OrderModal({ isOpen, onClose, orderToEdit, onSaved }) {
  const [formData, setFormData] = useState({
    numero_pedido: '',
    titulo: '',
    loja: 'Okami',
    produto: 'Bloquinho',
    quantidade: 1,
    data_pedido: new Date().toISOString().slice(0, 10),
    tipo_espiral: 'Preto',
    frente_verso: false,
    observacoes: ''
  });

  const [arteFrente, setArteFrente] = useState(null);
  const [arteVerso, setArteVerso] = useState(null);
  const [arquivosExtras, setArquivosExtras] = useState([]);
  
  const [previewFrente, setPreviewFrente] = useState(null);
  const [previewVerso, setPreviewVerso] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderToEdit) {
      setFormData({
        numero_pedido: orderToEdit.numero_pedido || '',
        titulo: orderToEdit.titulo || '',
        loja: orderToEdit.loja || 'Okami',
        produto: orderToEdit.produto || 'Bloquinho',
        quantidade: orderToEdit.quantidade || 1,
        data_pedido: orderToEdit.data_pedido ? orderToEdit.data_pedido.split('T')[0] : new Date().toISOString().slice(0, 10),
        tipo_espiral: orderToEdit.tipo_espiral || 'Preto',
        frente_verso: !!orderToEdit.frente_verso,
        observacoes: orderToEdit.observacoes || ''
      });

      const frente = orderToEdit.arquivos?.find(a => a.tipo === 'frente');
      const verso = orderToEdit.arquivos?.find(a => a.tipo === 'verso');

      setPreviewFrente(frente ? frente.url : null);
      setPreviewVerso(verso ? verso.url : null);
    } else {
      setFormData({
        numero_pedido: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
        titulo: '',
        loja: 'Okami',
        produto: 'Bloquinho',
        quantidade: 1,
        data_pedido: new Date().toISOString().slice(0, 10),
        tipo_espiral: 'Preto',
        frente_verso: false,
        observacoes: ''
      });
      setArteFrente(null);
      setArteVerso(null);
      setArquivosExtras([]);
      setPreviewFrente(null);
      setPreviewVerso(null);
    }
    setError('');
  }, [orderToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      if (file.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview('PDF');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (arteFrente) data.append('arte_frente', arteFrente);
      if (arteVerso && formData.frente_verso) data.append('arte_verso', arteVerso);
      
      if (arquivosExtras.length > 0) {
        for (let i = 0; i < arquivosExtras.length; i++) {
          data.append('arquivos_extras', arquivosExtras[i]);
        }
      }

      if (orderToEdit) {
        await api.put(`/pedidos/${orderToEdit.id}`, data);
      } else {
        await api.post('/pedidos', data);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar o pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="order-modal-overlay">
      <div className="modal-content" id="order-modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {orderToEdit ? 'Editar Pedido' : 'Novo Pedido de Produção'}
          </h3>
          <button className="btn btn-secondary" style={{ padding: 6 }} onClick={onClose} id="btn-close-order-modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.85rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Nº do Pedido *</label>
              <input 
                type="text" 
                name="numero_pedido" 
                value={formData.numero_pedido} 
                onChange={handleChange} 
                className="form-control" 
                required 
                id="input-numero-pedido"
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Título do Pedido *</label>
              <input 
                type="text" 
                name="titulo" 
                placeholder="Ex: 50 Bloquinhos Ana Maria" 
                value={formData.titulo} 
                onChange={handleChange} 
                className="form-control" 
                required 
                id="input-titulo-pedido"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Loja *</label>
              <select name="loja" value={formData.loja} onChange={handleChange} className="form-control" id="select-modal-loja">
                <option value="Okami">Okami</option>
                <option value="Universo">Universo</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Produto *</label>
              <select name="produto" value={formData.produto} onChange={handleChange} className="form-control" id="select-modal-produto">
                <option value="Bloquinho">Bloquinho</option>
                <option value="Caderneta">Caderneta</option>
                <option value="Agenda">Agenda</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Quantidade *</label>
              <input 
                type="number" 
                name="quantidade" 
                min="1" 
                value={formData.quantidade} 
                onChange={handleChange} 
                className="form-control" 
                required 
                id="input-modal-quantidade"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Data do Pedido *</label>
              <input 
                type="date" 
                name="data_pedido" 
                value={formData.data_pedido} 
                onChange={handleChange} 
                className="form-control" 
                required 
                id="input-modal-data"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Tipo de Espiral *</label>
              <input 
                type="text" 
                name="tipo_espiral" 
                placeholder="Ex: Preto, Transparente, Wire-o" 
                value={formData.tipo_espiral} 
                onChange={handleChange} 
                className="form-control" 
                required 
                id="input-modal-espiral"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
            <input 
              type="checkbox" 
              name="frente_verso" 
              id="checkbox-frente-verso" 
              checked={formData.frente_verso} 
              onChange={handleChange}
              style={{ width: 18, height: 18 }}
            />
            <label htmlFor="checkbox-frente-verso" style={{ fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
              Impressão Frente e Verso?
            </label>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Observações da Produção</label>
            <textarea 
              name="observacoes" 
              rows="2" 
              value={formData.observacoes} 
              onChange={handleChange} 
              className="form-control"
              placeholder="Instruções especiais de corte, laminação, embalagem..."
              id="textarea-modal-obs"
            />
          </div>

          {/* File Upload Section */}
          <div style={{ background: 'var(--bg-primary)', padding: 14, borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Upload size={16} /> Upload de Arquivos da Arte (JPG, PNG, PDF)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Arte da Frente</label>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.pdf" 
                  onChange={(e) => handleFileChange(e, setArteFrente, setPreviewFrente)} 
                  className="form-control"
                  id="file-arte-frente"
                />
                {previewFrente && (
                  <div style={{ marginTop: 6 }}>
                    {previewFrente.startsWith('blob:') || previewFrente.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <img src={previewFrente} alt="Preview Frente" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={14} /> Arquivo PDF selecionado
                      </div>
                    )}
                  </div>
                )}
              </div>

              {formData.frente_verso && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Arte do Verso</label>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.pdf" 
                    onChange={(e) => handleFileChange(e, setArteVerso, setPreviewVerso)} 
                    className="form-control"
                    id="file-arte-verso"
                  />
                  {previewVerso && (
                    <div style={{ marginTop: 6 }}>
                      {previewVerso.startsWith('blob:') || previewVerso.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <img src={previewVerso} alt="Preview Verso" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FileText size={14} /> Arquivo PDF selecionado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Arquivos Extras</label>
              <input 
                type="file" 
                multiple 
                accept=".jpg,.jpeg,.png,.pdf" 
                onChange={(e) => setArquivosExtras(Array.from(e.target.files))} 
                className="form-control"
                id="file-arquivos-extras"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} id="btn-cancel-modal">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="btn-submit-order-modal">
              {loading ? 'Salvando...' : 'Salvar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
