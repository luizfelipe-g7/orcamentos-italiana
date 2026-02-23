import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Users, Search, UserPlus } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadMembros();
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

  const filteredMembros = membros.filter(membro => 
    membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (membro.email && membro.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNovoMembro = async () => {
    const orcamentoId = window.prompt('ID do orçamento:');
    if (!orcamentoId) return;
    const nome = window.prompt('Nome do membro:');
    if (!nome) return;
    const email = (window.prompt('Email (opcional):') || '').trim();
    const telefone = (window.prompt('Telefone (opcional):') || '').trim();
    const parentesco = (window.prompt('Parentesco (opcional):') || '').trim();

    const idNum = Number(orcamentoId);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      alert('ID do orçamento inválido.');
      return;
    }

    try {
      setCreating(true);
      const payload: Record<string, unknown> = {
        orcamento_id: idNum,
        nome,
      };

      // Envia apenas campos opcionais preenchidos para evitar erro em bases com schema antigo.
      if (email) payload.email = email;
      if (telefone) payload.telefone = telefone;
      if (parentesco) payload.parentesco = parentesco;

      await api.post('/membros', payload);
      await loadMembros();
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
            onClick={handleNovoMembro}
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
    </>
  );
}
