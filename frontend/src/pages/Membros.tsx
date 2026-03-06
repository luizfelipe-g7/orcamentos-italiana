import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Users, Search, UserPlus, X } from 'lucide-react';
import api from '../services/api';
import axios from 'axios';

interface Membro {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  parentesco?: string;
  orcamento_id: number;
  created_at: string;
}

export function Membros() {
  const [membros, setMembros] = useState<Membro[]>([]);
  const [orcamentos, setOrcamentos] = useState<Array<{ id: number; nome_familia: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    orcamento_id: '',
    nome: '',
    email: '',
    telefone: '',
    parentesco: '',
  });

  useEffect(() => {
    loadMembros();
    loadOrcamentos();
  }, []);

  const loadMembros = async () => {
    try {
      setLoading(true);
      const response = await api.get('/membros');
      setMembros(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      // Se der erro (ex: 403 Forbidden se não for ADM), mostrar lista vazia ou mensagem
    } finally {
      setLoading(false);
    }
  };

  const loadOrcamentos = async () => {
    try {
      const response = await api.get('/orcamentos?limit=200&page=1');
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      setOrcamentos(list.map((o: any) => ({ id: o.id, nome_familia: o.nome_familia || `Orçamento #${o.id}` })));
    } catch (error) {
      console.error('Erro ao carregar orçamentos para o formulário:', error);
    }
  };

  const filteredMembros = membros.filter(membro => 
    membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (membro.email && membro.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNovoMembro = async () => {
    const idNum = Number(form.orcamento_id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      alert('ID do orçamento inválido.');
      return;
    }
    if (!form.nome.trim()) {
      alert('Nome do membro é obrigatório.');
      return;
    }

    try {
      setCreating(true);
      const payload: Record<string, unknown> = {
        orcamento_id: idNum,
        nome: form.nome.trim(),
      };

      // Envia apenas campos opcionais preenchidos para evitar erro em bases com schema antigo.
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.telefone.trim()) payload.telefone = form.telefone.trim();
      if (form.parentesco.trim()) payload.parentesco = form.parentesco.trim();

      await api.post('/membros', payload);
      await loadMembros();
      setShowModal(false);
      setForm({ orcamento_id: '', nome: '', email: '', telefone: '', parentesco: '' });
      alert('Membro criado com sucesso.');
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      const serverMessage = axios.isAxiosError(error) ? error.response?.data?.error : '';
      alert(serverMessage || 'Não foi possível criar o membro.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Header title="Membros" subtitle="Gerencie os membros das famílias" />
      
      <main className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Buscar membros..."
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] w-full shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            disabled={creating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#003366] text-white rounded-lg hover:bg-[#004080] transition-all shadow-md hover:shadow-lg disabled:opacity-60"
          >
            <UserPlus size={18} />
            <span className="font-medium">{creating ? 'Criando...' : 'Novo Membro'}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin"></div>
          </div>
        ) : filteredMembros.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum membro encontrado</h3>
            <p className="text-gray-500 mt-1">Os membros são adicionados através dos orçamentos.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parentesco</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembros.map((membro) => (
                  <tr key={membro.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{membro.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{membro.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{membro.telefone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{membro.parentesco || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(membro.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-xl border border-gray-200 shadow-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Novo Membro</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento</label>
                <select
                  value={form.orcamento_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, orcamento_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                >
                  <option value="">Selecione um orçamento</option>
                  {orcamentos.map((o) => (
                    <option key={o.id} value={o.id}>{o.nome_familia} (#{o.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco</label>
                <input
                  value={form.parentesco}
                  onChange={(e) => setForm((prev) => ({ ...prev, parentesco: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  value={form.telefone}
                  onChange={(e) => setForm((prev) => ({ ...prev, telefone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleNovoMembro}
                disabled={creating}
                className="px-4 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#004080] disabled:opacity-60"
              >
                {creating ? 'Salvando...' : 'Salvar Membro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
