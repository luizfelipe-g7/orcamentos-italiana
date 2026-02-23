import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { 
  Search, 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Download,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';
import { budgetService } from '../services/budgetService';
import type { BudgetSummary } from '../types/budgetSummaryType';
import { useNavigate } from 'react-router-dom';

export function Orcamentos() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBudget, setEditingBudget] = useState<BudgetSummary | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('ABERTO');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetService.getAll();
      setBudgets(data);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.service.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (budget.clientName && budget.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const openEditModal = (budget: BudgetSummary) => {
    setEditingBudget(budget);
    setEditName(budget.service);
    setEditStatus((budget.status || 'ABERTO').toUpperCase());
  };

  const closeEditModal = () => {
    setEditingBudget(null);
    setEditName('');
    setEditStatus('ABERTO');
  };

  const handleSaveEdit = async () => {
    if (!editingBudget) return;
    if (!editName.trim()) {
      alert('Informe o nome da família.');
      return;
    }

    try {
      setSavingEdit(true);
      await budgetService.update(editingBudget.id, {
        nome_familia: editName.trim(),
        status: editStatus,
      });
      await loadBudgets();
      closeEditModal();
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      alert('Erro ao atualizar orçamento.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (budget: BudgetSummary) => {
    const confirmed = window.confirm(`Deseja excluir o orçamento da família ${budget.service}?`);
    if (!confirmed) return;
    try {
      await budgetService.delete(budget.id);
      setBudgets((prev) => prev.filter((b) => b.id !== budget.id));
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      alert('Não foi possível excluir o orçamento.');
    }
  };

  const handlePdf = (budget: BudgetSummary) => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      alert('Permita pop-ups para gerar o PDF.');
      return;
    }
    win.document.write(`
      <html>
        <head>
          <title>Orçamento - ${budget.service}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h1 { color: #003366; margin-bottom: 8px; }
            .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 16px; }
            .row { margin: 8px 0; }
            .label { font-weight: bold; color: #374151; }
          </style>
        </head>
        <body>
          <h1>Orçamento Italiana</h1>
          <p>Documento gerado pelo sistema.</p>
          <div class="card">
            <div class="row"><span class="label">Família:</span> ${budget.service}</div>
            <div class="row"><span class="label">Valor:</span> ${budget.value}</div>
            <div class="row"><span class="label">Status:</span> ${budget.status}</div>
            <div class="row"><span class="label">Criado em:</span> ${budget.createdAt}</div>
            <div class="row"><span class="label">Responsável:</span> ${budget.clientName || '-'}</div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <>
      <Header title="Orçamentos" subtitle="Gerencie as propostas comerciais" />
      
      <main className="p-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                placeholder="Buscar orçamentos..."
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] w-full shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button 
            onClick={() => navigate('/orcamentos/novo')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#003366] text-white rounded-lg hover:bg-[#004080] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            <span className="font-medium">Novo Orçamento</span>
          </button>
        </div>

        {/* Budgets List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin"></div>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum orçamento encontrado</h3>
            <p className="text-gray-500 mt-1">Tente ajustar sua busca ou crie um novo orçamento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredBudgets.map((budget) => (
              <div key={budget.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group border-l-4 border-l-transparent hover:border-l-[#003366]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#003366] transition-colors">
                        {budget.service}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-100`}>
                        Italiana
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        budget.status === 'Aprovado' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        budget.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                        'bg-gray-50 text-gray-700 border-gray-100'
                      }`}>
                        {budget.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>Criado em {budget.createdAt}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={14} />
                        <span className="font-medium text-gray-700">{budget.value}</span>
                      </div>
                      {budget.clientName && (
                        <div className="flex items-center gap-1.5">
                          <User size={14} />
                          <span>Resp: {budget.clientName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => openEditModal(budget)}
                      className="p-2 text-gray-400 hover:text-[#003366] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handlePdf(budget)}
                      className="p-2 text-gray-400 hover:text-[#003366] hover:bg-blue-50 rounded-lg transition-colors"
                      title="PDF"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(budget)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editingBudget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-200 p-5">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Editar Orçamento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Família</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/20"
                >
                  <option value="ABERTO">ABERTO</option>
                  <option value="EM_ANDAMENTO">EM_ANDAMENTO</option>
                  <option value="FECHADO">FECHADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#004080] disabled:opacity-60"
              >
                {savingEdit ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
