import React from 'react';
import type { Pessoa, NovaPessoa, CertidoesLinhagem } from '../../../types/budget';
import { InteractiveFamilyTree } from '../components/InteractiveFamilyTree';
import { grausParentesco } from '../../../utils/budgetData';
import { Plus } from 'lucide-react';

interface LinhagemSectionProps {
  pessoas: Pessoa[];
  novaPessoa: NovaPessoa;
  certidoesLinhagem: CertidoesLinhagem;
  handleNovaPessoaChange: (campo: keyof NovaPessoa, valor: any) => void;
  adicionarPessoa: () => void;
  removerPessoa: (id: string) => void;
  alterarPropriedadePessoa: (id: string, propriedade: keyof NovaPessoa, valor: any) => void;
}

export function LinhagemSection({
  pessoas,
  novaPessoa,
  handleNovaPessoaChange,
  adicionarPessoa,
  removerPessoa,
  alterarPropriedadePessoa
}: LinhagemSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Configurar Linhagem</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grau de Parentesco</label>
            <select
              value={novaPessoa.grauParentesco}
              onChange={(e) => handleNovaPessoaChange('grauParentesco', e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
            >
              <option value="">Selecione...</option>
              {grausParentesco.map((grau) => (
                <option key={grau} value={grau}>{grau}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={novaPessoa.casou}
                onChange={(e) => handleNovaPessoaChange('casou', e.target.checked)}
                className="rounded text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">Casou?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={novaPessoa.faleceu}
                onChange={(e) => handleNovaPessoaChange('faleceu', e.target.checked)}
                className="rounded text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">Faleceu?</span>
            </label>
          </div>

          <button
            onClick={adicionarPessoa}
            disabled={!novaPessoa.grauParentesco}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003366] text-white rounded-lg hover:bg-[#004080] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={18} />
            Adicionar Pessoa
          </button>
        </div>
      </div>

      <InteractiveFamilyTree
        pessoas={pessoas}
        onRemovePessoa={removerPessoa}
        onUpdatePessoa={alterarPropriedadePessoa}
      />
    </div>
  );
}
