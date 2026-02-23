import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';

type OrcamentoRaw = {
  id: number;
  nome_familia: string;
  valor_total?: number | string;
  status: string;
  created_at: string;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [orcamentos, setOrcamentos] = useState<OrcamentoRaw[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orcamentos?limit=200&page=1');
        const list = Array.isArray(response.data?.data) ? response.data.data : [];
        setOrcamentos(list);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        setOrcamentos([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalOrcamentos = orcamentos.length;
    const aguardandoAprovacao = orcamentos.filter((o) => o.status === 'ABERTO' || o.status === 'EM_ANDAMENTO').length;
    const clientesAtivos = new Set(orcamentos.map((o) => o.nome_familia).filter(Boolean)).size;

    const now = new Date();
    const receitaMensal = orcamentos.reduce((acc, o) => {
      const created = new Date(o.created_at);
      if (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      ) {
        const valor = typeof o.valor_total === 'string' ? parseFloat(o.valor_total) : (o.valor_total || 0);
        return acc + (Number.isFinite(valor) ? valor : 0);
      }
      return acc;
    }, 0);

    return [
      {
        label: 'Total de Orçamentos',
        value: `${totalOrcamentos}`,
        trend: 'up',
        icon: FileText,
        color: 'blue',
      },
      {
        label: 'Famílias Ativas',
        value: `${clientesAtivos}`,
        trend: 'up',
        icon: Users,
        color: 'green',
      },
      {
        label: 'Receita Mensal',
        value: `R$ ${receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        trend: 'up',
        icon: TrendingUp,
        color: 'indigo',
      },
      {
        label: 'Aguardando Aprovação',
        value: `${aguardandoAprovacao}`,
        trend: 'down',
        icon: Clock,
        color: 'orange',
      },
    ] as const;
  }, [orcamentos]);

  const recentBudgets = useMemo(() => {
    return orcamentos.slice(0, 6).map((o) => ({
      id: o.id,
      family: o.nome_familia || 'Família Sem Nome',
      type: 'Cidadania Italiana',
      value: `R$ ${Number(o.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      status: o.status,
      date: new Date(o.created_at).toLocaleDateString('pt-BR'),
    }));
  }, [orcamentos]);

  return (
    <>
      <Header title="Dashboard" subtitle="Visão geral do seu desempenho" />
      
      <main className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                  <stat.icon size={24} className={`text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                  Atualizado
                </div>
              </div>
              <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Orçamentos Recentes</h2>
              <button
                onClick={() => navigate('/orcamentos')}
                className="text-sm text-[#003366] font-medium hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Família</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td className="px-6 py-6 text-sm text-gray-500" colSpan={5}>Carregando orçamentos...</td>
                    </tr>
                  ) : recentBudgets.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-sm text-gray-500" colSpan={5}>Nenhum orçamento encontrado.</td>
                    </tr>
                  ) : recentBudgets.map((budget) => (
                    <tr key={budget.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{budget.family}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{budget.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{budget.value}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          budget.status === 'FECHADO' ? 'bg-green-100 text-green-800' :
                          budget.status === 'ABERTO' ? 'bg-yellow-100 text-yellow-800' :
                          budget.status === 'EM_ANDAMENTO' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {budget.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{budget.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orcamentos/novo')}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#003366] hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#003366]/10 p-2 rounded-lg text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors">
                    <Plus size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Novo Orçamento</h3>
                    <p className="text-xs text-gray-500">Criar proposta para cliente</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-[#003366]" />
              </button>

              <button
                onClick={() => navigate('/membros')}
                className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-[#003366] hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#003366]/10 p-2 rounded-lg text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors">
                    <Users size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Cadastrar Cliente</h3>
                    <p className="text-xs text-gray-500">Adicionar novo lead</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-[#003366]" />
              </button>
            </div>

            <div className="mt-8 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500">
                Painel carregado com dados reais do banco. Crie novos orçamentos para atualizar os indicadores.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
