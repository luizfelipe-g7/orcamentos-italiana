import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Save, Users, Wallet } from 'lucide-react';
import { Header } from '../components/layout/Header';
import api from '../services/api';

type OrcamentoDetalheData = {
  id: number;
  nome_familia: string;
  cidadania: 'IT';
  status: 'ABERTO' | 'EM_ANDAMENTO' | 'FECHADO' | 'CANCELADO';
  valor_total?: number;
  num_parcelas?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
};

type Membro = {
  id: number;
  orcamento_id?: number;
  nome: string;
  parentesco?: string;
  email?: string;
  telefone?: string;
  created_at: string;
};

type Documento = {
  id: number;
  membro_id: number;
  tipo: string;
  subtipo?: string;
  nome_original?: string;
  url_s3: string;
  status: 'PENDENTE' | 'ENVIADO' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | 'VENCIDO';
  observacoes?: string;
  created_at: string;
};

type Honorario = {
  id: number;
  descricao: string;
  valor: number;
  quantidade: number;
  desconto: number;
  valor_final: number;
};

type Parcela = {
  id: number;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  valor_pago?: number;
};

type Pagante = {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  valor_total: number;
  num_parcelas: number;
  parcelas: Parcela[];
};

type Tab = 'geral' | 'membros' | 'documentos' | 'financeiro';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function resolveBackendUrl(url?: string) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
  return url.startsWith('/') ? `${backendOrigin}${url}` : url;
}

export function OrcamentoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orcamento, setOrcamento] = useState<OrcamentoDetalheData | null>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('geral');
  const [errorMessage, setErrorMessage] = useState('');

  const [nomeFamilia, setNomeFamilia] = useState('');
  const [status, setStatus] = useState<OrcamentoDetalheData['status']>('ABERTO');
  const [valorTotal, setValorTotal] = useState('');
  const [numParcelas, setNumParcelas] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [novoMembro, setNovoMembro] = useState({ nome: '', parentesco: '', email: '', telefone: '' });
  const [membroEditando, setMembroEditando] = useState<Membro | null>(null);
  const [salvandoMembro, setSalvandoMembro] = useState(false);

  const [selectedMembroId, setSelectedMembroId] = useState<number | ''>('');
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [uploadingDocumento, setUploadingDocumento] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [subtipoDocumento, setSubtipoDocumento] = useState('');
  const [obsDocumento, setObsDocumento] = useState('');
  const [arquivoDocumento, setArquivoDocumento] = useState<File | null>(null);

  const [honorarios, setHonorarios] = useState<Honorario[]>([]);
  const [pagantes, setPagantes] = useState<Pagante[]>([]);
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(false);
  const [novoHonorario, setNovoHonorario] = useState({ descricao: '', valor: '', quantidade: '1', desconto: '0' });
  const [novoPagante, setNovoPagante] = useState({ nome: '', email: '', telefone: '', valor_total: '', num_parcelas: '1' });

  const totalHonorarios = useMemo(
    () => honorarios.reduce((acc, item) => acc + Number(item.valor_final || 0), 0),
    [honorarios]
  );

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [orcamentoResp, membrosResp] = await Promise.all([
        api.get(`/orcamentos/${id}`),
        api.get(`/membros/orcamento/${id}`),
      ]);

      const orcamentoData = orcamentoResp.data?.data as OrcamentoDetalheData;
      const membrosData = Array.isArray(membrosResp.data?.data) ? membrosResp.data.data : [];

      setOrcamento(orcamentoData);
      setMembros(membrosData);

      setNomeFamilia(orcamentoData?.nome_familia || '');
      setStatus((orcamentoData?.status || 'ABERTO') as OrcamentoDetalheData['status']);
      setValorTotal(String(orcamentoData?.valor_total ?? ''));
      setNumParcelas(String(orcamentoData?.num_parcelas ?? ''));
      setObservacoes(orcamentoData?.observacoes || '');
    } catch (error) {
      console.error('Erro ao carregar detalhes do orçamento:', error);
      setErrorMessage('Erro ao carregar detalhes do orçamento.');
    } finally {
      setLoading(false);
    }
  };

  const loadFinanceiro = async () => {
    if (!id) return;
    try {
      setLoadingFinanceiro(true);
      const [honResp, pagResp] = await Promise.all([
        api.get(`/financeiro/honorarios/${id}`),
        api.get(`/financeiro/pagantes/${id}`),
      ]);
      setHonorarios(Array.isArray(honResp.data?.data) ? honResp.data.data : []);
      setPagantes(Array.isArray(pagResp.data?.data) ? pagResp.data.data : []);
    } catch (error) {
      console.error('Erro ao carregar financeiro:', error);
      setErrorMessage('Erro ao carregar dados financeiros.');
    } finally {
      setLoadingFinanceiro(false);
    }
  };

  const loadDocumentosByMembro = async (membroId: number) => {
    try {
      setLoadingDocumentos(true);
      const resp = await api.get(`/documentos/membro/${membroId}`);
      setDocumentos(Array.isArray(resp.data?.data) ? resp.data.data : []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setErrorMessage('Erro ao carregar documentos do membro.');
    } finally {
      setLoadingDocumentos(false);
    }
  };

  useEffect(() => {
    if (!selectedMembroId) {
      setDocumentos([]);
      return;
    }
    void loadDocumentosByMembro(Number(selectedMembroId));
  }, [selectedMembroId]);

  useEffect(() => {
    if (activeTab === 'financeiro') {
      void loadFinanceiro();
    }
  }, [activeTab]);

  const handleSave = async () => {
    if (!id) return;
    if (!nomeFamilia.trim()) {
      alert('Nome da família é obrigatório.');
      return;
    }
    try {
      setSaving(true);
      setErrorMessage('');
      await api.put(`/orcamentos/${id}`, {
        nome_familia: nomeFamilia.trim(),
        status,
        valor_total: valorTotal ? Number(valorTotal) : undefined,
        num_parcelas: numParcelas ? Number(numParcelas) : undefined,
        observacoes: observacoes || undefined,
      });
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      setErrorMessage('Erro ao atualizar orçamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleSalvarMembro = async () => {
    if (!id || !novoMembro.nome.trim()) return;
    try {
      setSalvandoMembro(true);
      setErrorMessage('');
      await api.post('/membros', {
        orcamento_id: Number(id),
        nome: novoMembro.nome.trim(),
        ...(novoMembro.parentesco ? { parentesco: novoMembro.parentesco.trim() } : {}),
        ...(novoMembro.email ? { email: novoMembro.email.trim() } : {}),
        ...(novoMembro.telefone ? { telefone: novoMembro.telefone.trim() } : {}),
      });
      setNovoMembro({ nome: '', parentesco: '', email: '', telefone: '' });
      await loadData();
    } catch (error: any) {
      console.error('Erro ao criar membro:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao criar membro.');
    } finally {
      setSalvandoMembro(false);
    }
  };

  const handleAtualizarMembro = async () => {
    if (!membroEditando || !membroEditando.nome.trim()) return;
    try {
      setSalvandoMembro(true);
      setErrorMessage('');
      await api.put(`/membros/${membroEditando.id}`, {
        nome: membroEditando.nome.trim(),
        parentesco: membroEditando.parentesco || undefined,
        email: membroEditando.email || undefined,
        telefone: membroEditando.telefone || undefined,
      });
      setMembroEditando(null);
      await loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar membro:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao atualizar membro.');
    } finally {
      setSalvandoMembro(false);
    }
  };

  const handleExcluirMembro = async (membroId: number) => {
    if (!confirm('Deseja realmente excluir este membro?')) return;
    try {
      setErrorMessage('');
      await api.delete(`/membros/${membroId}`);
      await loadData();
      if (selectedMembroId === membroId) {
        setSelectedMembroId('');
      }
    } catch (error: any) {
      console.error('Erro ao excluir membro:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao excluir membro.');
    }
  };

  const handleUploadDocumento = async () => {
    if (!selectedMembroId || !arquivoDocumento || !tipoDocumento.trim()) {
      setErrorMessage('Selecione membro, tipo e arquivo para enviar o documento.');
      return;
    }
    try {
      setUploadingDocumento(true);
      setErrorMessage('');
      const formData = new FormData();
      formData.append('membro_id', String(selectedMembroId));
      formData.append('tipo', tipoDocumento.trim());
      if (subtipoDocumento.trim()) formData.append('subtipo', subtipoDocumento.trim());
      if (obsDocumento.trim()) formData.append('observacoes', obsDocumento.trim());
      formData.append('arquivo', arquivoDocumento);
      await api.post('/documentos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTipoDocumento('');
      setSubtipoDocumento('');
      setObsDocumento('');
      setArquivoDocumento(null);
      await loadDocumentosByMembro(Number(selectedMembroId));
    } catch (error: any) {
      console.error('Erro ao enviar documento:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao enviar documento.');
    } finally {
      setUploadingDocumento(false);
    }
  };

  const handleExcluirDocumento = async (docId: number) => {
    if (!confirm('Deseja remover este documento?')) return;
    try {
      setErrorMessage('');
      await api.delete(`/documentos/${docId}`);
      if (selectedMembroId) await loadDocumentosByMembro(Number(selectedMembroId));
    } catch (error: any) {
      console.error('Erro ao excluir documento:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao excluir documento.');
    }
  };

  const handleAtualizarStatusDocumento = async (docId: number, novoStatus: Documento['status']) => {
    try {
      setErrorMessage('');
      await api.put(`/documentos/${docId}/status`, { status: novoStatus });
      if (selectedMembroId) await loadDocumentosByMembro(Number(selectedMembroId));
    } catch (error: any) {
      console.error('Erro ao atualizar status do documento:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao atualizar status do documento.');
    }
  };

  const handleCriarHonorario = async () => {
    if (!id || !novoHonorario.descricao.trim() || !novoHonorario.valor) return;
    try {
      setErrorMessage('');
      await api.post('/financeiro/honorarios', {
        orcamento_id: Number(id),
        descricao: novoHonorario.descricao.trim(),
        valor: Number(novoHonorario.valor),
        quantidade: Number(novoHonorario.quantidade || 1),
        desconto: Number(novoHonorario.desconto || 0),
      });
      setNovoHonorario({ descricao: '', valor: '', quantidade: '1', desconto: '0' });
      await loadFinanceiro();
    } catch (error: any) {
      console.error('Erro ao criar honorário:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao criar honorário.');
    }
  };

  const handleExcluirHonorario = async (honorarioId: number) => {
    if (!confirm('Deseja excluir este honorário?')) return;
    try {
      await api.delete(`/financeiro/honorarios/${honorarioId}`);
      await loadFinanceiro();
    } catch (error: any) {
      console.error('Erro ao excluir honorário:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao excluir honorário.');
    }
  };

  const handleCriarPagante = async () => {
    if (!id || !novoPagante.nome.trim() || !novoPagante.valor_total) return;
    try {
      setErrorMessage('');
      await api.post('/financeiro/pagantes', {
        orcamento_id: Number(id),
        nome: novoPagante.nome.trim(),
        email: novoPagante.email || undefined,
        telefone: novoPagante.telefone || undefined,
        valor_total: Number(novoPagante.valor_total),
        num_parcelas: Number(novoPagante.num_parcelas || 1),
      });
      setNovoPagante({ nome: '', email: '', telefone: '', valor_total: '', num_parcelas: '1' });
      await loadFinanceiro();
    } catch (error: any) {
      console.error('Erro ao criar pagante:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao criar pagante.');
    }
  };

  const handleExcluirPagante = async (paganteId: number) => {
    if (!confirm('Deseja excluir este pagante?')) return;
    try {
      await api.delete(`/financeiro/pagantes/${paganteId}`);
      await loadFinanceiro();
    } catch (error: any) {
      console.error('Erro ao excluir pagante:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao excluir pagante.');
    }
  };

  const handleAtualizarParcela = async (parcelaId: number, statusParcela: Parcela['status']) => {
    try {
      setErrorMessage('');
      await api.put(`/financeiro/parcelas/${parcelaId}`, { status: statusParcela });
      await loadFinanceiro();
    } catch (error: any) {
      console.error('Erro ao atualizar parcela:', error);
      setErrorMessage(error?.response?.data?.message || 'Erro ao atualizar parcela.');
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Detalhe do Orçamento" subtitle="Carregando..." />
        <main className="p-8">
          <div className="w-10 h-10 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin"></div>
        </main>
      </>
    );
  }

  if (!orcamento) {
    return (
      <>
        <Header title="Detalhe do Orçamento" subtitle="Orçamento não encontrado" />
        <main className="p-8">
          <button onClick={() => navigate('/orcamentos')} className="text-[#003366] underline">
            Voltar para lista
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title={`Orçamento #${orcamento.id}`} subtitle="Detalhe e edição completa" />

      <main className="p-8 space-y-6">
        <button
          onClick={() => navigate('/orcamentos')}
          className="inline-flex items-center gap-2 text-[#003366] hover:underline"
        >
          <ArrowLeft size={16} />
          Voltar para Orçamentos
        </button>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'geral' as Tab, label: 'Geral', icon: Save },
            { key: 'membros' as Tab, label: 'Membros', icon: Users },
            { key: 'documentos' as Tab, label: 'Documentos', icon: FileText },
            { key: 'financeiro' as Tab, label: 'Financeiro', icon: Wallet },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
                activeTab === item.key
                  ? 'border-[#003366] bg-[#003366] text-white'
                  : 'border-gray-300 bg-white text-gray-700'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        {activeTab === 'geral' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Dados do Orçamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Família</label>
              <input
                value={nomeFamilia}
                onChange={(e) => setNomeFamilia(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrcamentoDetalheData['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
              >
                <option value="ABERTO">ABERTO</option>
                <option value="EM_ANDAMENTO">EM_ANDAMENTO</option>
                <option value="FECHADO">FECHADO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
              <input
                type="number"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
              <input
                type="number"
                value={numParcelas}
                onChange={(e) => setNumParcelas(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#004080] disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
        )}

        {activeTab === 'membros' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 inline-flex items-center gap-2">
            <Users size={18} />
            Membros vinculados ({membros.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <input
              value={novoMembro.nome}
              onChange={(e) => setNovoMembro((prev) => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome do membro"
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              value={novoMembro.parentesco}
              onChange={(e) => setNovoMembro((prev) => ({ ...prev, parentesco: e.target.value }))}
              placeholder="Parentesco"
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              value={novoMembro.email}
              onChange={(e) => setNovoMembro((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex gap-2">
              <input
                value={novoMembro.telefone}
                onChange={(e) => setNovoMembro((prev) => ({ ...prev, telefone: e.target.value }))}
                placeholder="Telefone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleSalvarMembro}
                disabled={salvandoMembro}
                className="px-3 py-2 rounded-lg bg-[#003366] text-white text-sm"
              >
                Adicionar
              </button>
            </div>
          </div>

          {membros.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum membro vinculado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parentesco</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {membros.map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-2 text-sm text-gray-800">{m.nome}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{m.parentesco || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{m.email || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{m.telefone || '-'}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setMembroEditando(m)}
                            className="px-2 py-1 rounded border border-gray-300 text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleExcluirMembro(m.id)}
                            className="px-2 py-1 rounded border border-red-300 text-red-600 text-xs"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {activeTab === 'documentos' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Documentos por membro</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={selectedMembroId}
                onChange={(e) => setSelectedMembroId(e.target.value ? Number(e.target.value) : '')}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Selecione um membro</option>
                {membros.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
              <input
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                placeholder="Tipo do documento"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                value={subtipoDocumento}
                onChange={(e) => setSubtipoDocumento(e.target.value)}
                placeholder="Subtipo (opcional)"
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="file"
                onChange={(e) => setArquivoDocumento(e.target.files?.[0] || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <textarea
              value={obsDocumento}
              onChange={(e) => setObsDocumento(e.target.value)}
              rows={2}
              placeholder="Observações do documento (opcional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={handleUploadDocumento}
              disabled={uploadingDocumento}
              className="px-4 py-2 rounded-lg bg-[#003366] text-white text-sm"
            >
              {uploadingDocumento ? 'Enviando...' : 'Enviar documento'}
            </button>

            {loadingDocumentos ? (
              <p className="text-sm text-gray-500">Carregando documentos...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Arquivo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documentos.map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-4 py-2 text-sm">
                          <a
                            href={resolveBackendUrl(doc.url_s3)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#003366] underline"
                          >
                            {doc.nome_original || `Documento #${doc.id}`}
                          </a>
                        </td>
                        <td className="px-4 py-2 text-sm">{doc.tipo}</td>
                        <td className="px-4 py-2 text-sm">
                          <select
                            value={doc.status}
                            onChange={(e) => handleAtualizarStatusDocumento(doc.id, e.target.value as Documento['status'])}
                            className="px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="PENDENTE">PENDENTE</option>
                            <option value="ENVIADO">ENVIADO</option>
                            <option value="EM_ANALISE">EM_ANALISE</option>
                            <option value="APROVADO">APROVADO</option>
                            <option value="REJEITADO">REJEITADO</option>
                            <option value="VENCIDO">VENCIDO</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <button
                            onClick={() => handleExcluirDocumento(doc.id)}
                            className="px-2 py-1 rounded border border-red-300 text-red-600 text-xs"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {documentos.length === 0 && (
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-500" colSpan={4}>
                          Nenhum documento para o membro selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Honorários</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
                <input
                  value={novoHonorario.descricao}
                  onChange={(e) => setNovoHonorario((prev) => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={novoHonorario.valor}
                  onChange={(e) => setNovoHonorario((prev) => ({ ...prev, valor: e.target.value }))}
                  placeholder="Valor"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={novoHonorario.quantidade}
                  onChange={(e) => setNovoHonorario((prev) => ({ ...prev, quantidade: e.target.value }))}
                  placeholder="Quantidade"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={novoHonorario.desconto}
                  onChange={(e) => setNovoHonorario((prev) => ({ ...prev, desconto: e.target.value }))}
                  placeholder="Desconto"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button onClick={handleCriarHonorario} className="px-4 py-2 rounded-lg bg-[#003366] text-white text-sm">
                  Adicionar
                </button>
              </div>
              {loadingFinanceiro ? (
                <p className="text-sm text-gray-500">Carregando financeiro...</p>
              ) : (
                <div className="space-y-2">
                  {honorarios.map((h) => (
                    <div key={h.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                      <p className="text-sm text-gray-700">
                        {h.descricao} - R$ {Number(h.valor_final || 0).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleExcluirHonorario(h.id)}
                        className="px-2 py-1 rounded border border-red-300 text-red-600 text-xs"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                  <p className="text-sm font-medium text-gray-800">Total honorários: R$ {totalHonorarios.toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Pagantes e parcelas</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
                <input
                  value={novoPagante.nome}
                  onChange={(e) => setNovoPagante((prev) => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  value={novoPagante.email}
                  onChange={(e) => setNovoPagante((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  value={novoPagante.telefone}
                  onChange={(e) => setNovoPagante((prev) => ({ ...prev, telefone: e.target.value }))}
                  placeholder="Telefone"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={novoPagante.valor_total}
                  onChange={(e) => setNovoPagante((prev) => ({ ...prev, valor_total: e.target.value }))}
                  placeholder="Valor total"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  value={novoPagante.num_parcelas}
                  onChange={(e) => setNovoPagante((prev) => ({ ...prev, num_parcelas: e.target.value }))}
                  placeholder="Parcelas"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button onClick={handleCriarPagante} className="px-4 py-2 rounded-lg bg-[#003366] text-white text-sm">
                  Adicionar
                </button>
              </div>

              <div className="space-y-4">
                {pagantes.map((p) => (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">
                        {p.nome} - R$ {Number(p.valor_total || 0).toFixed(2)} ({p.num_parcelas} parcelas)
                      </p>
                      <button
                        onClick={() => handleExcluirPagante(p.id)}
                        className="px-2 py-1 rounded border border-red-300 text-red-600 text-xs"
                      >
                        Excluir pagante
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {(p.parcelas || []).map((parcela) => (
                        <div key={parcela.id} className="flex items-center justify-between rounded border border-gray-100 px-3 py-2">
                          <p className="text-xs text-gray-700">
                            Parcela {parcela.numero_parcela} - R$ {Number(parcela.valor || 0).toFixed(2)}
                          </p>
                          <select
                            value={parcela.status}
                            onChange={(e) => handleAtualizarParcela(parcela.id, e.target.value as Parcela['status'])}
                            className="px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="PENDENTE">PENDENTE</option>
                            <option value="PAGO">PAGO</option>
                            <option value="ATRASADO">ATRASADO</option>
                            <option value="CANCELADO">CANCELADO</option>
                          </select>
                        </div>
                      ))}
                      {(!p.parcelas || p.parcelas.length === 0) && (
                        <p className="text-xs text-gray-500">Este pagante ainda não tem parcelas geradas.</p>
                      )}
                    </div>
                  </div>
                ))}
                {pagantes.length === 0 && <p className="text-sm text-gray-500">Nenhum pagante cadastrado.</p>}
              </div>
            </div>
          </div>
        )}

        {membroEditando && (
          <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl space-y-3">
              <h4 className="text-lg font-semibold text-gray-800">Editar membro</h4>
              <input
                value={membroEditando.nome}
                onChange={(e) => setMembroEditando((prev) => (prev ? { ...prev, nome: e.target.value } : prev))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Nome"
              />
              <input
                value={membroEditando.parentesco || ''}
                onChange={(e) => setMembroEditando((prev) => (prev ? { ...prev, parentesco: e.target.value } : prev))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Parentesco"
              />
              <input
                value={membroEditando.email || ''}
                onChange={(e) => setMembroEditando((prev) => (prev ? { ...prev, email: e.target.value } : prev))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Email"
              />
              <input
                value={membroEditando.telefone || ''}
                onChange={(e) => setMembroEditando((prev) => (prev ? { ...prev, telefone: e.target.value } : prev))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Telefone"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setMembroEditando(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAtualizarMembro}
                  disabled={salvandoMembro}
                  className="px-4 py-2 rounded-lg bg-[#003366] text-white text-sm"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

