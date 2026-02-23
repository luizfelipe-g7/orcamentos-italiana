import React from 'react';
import type { InfoAncestral, CertidoesNecessariasItaliano, CustosCertidoes } from '../../../types/budget';
import { grausParentesco } from '../../../utils/budgetData';

interface ItalianoSectionProps {
  grauParentesco: string;
  infoAncestral: InfoAncestral;
  certidoesNecessarias: CertidoesNecessariasItaliano;
  custosCertidoes: CustosCertidoes;
  handleGrauParentescoChange: (grau: string) => void;
  handleInfoAncestralChange: (campo: keyof InfoAncestral) => void;
  nomeFamilia: string;
  onNomeFamiliaChange: (nome: string) => void;
}

export function ItalianoSection({
  grauParentesco,
  infoAncestral,
  handleGrauParentescoChange,
  handleInfoAncestralChange,
  nomeFamilia,
  onNomeFamiliaChange
}: ItalianoSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-3">Informações da Família</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome da Família (Dante Causa)</label>
            <input
              type="text"
              value={nomeFamilia}
              onChange={(e) => onNomeFamiliaChange(e.target.value)}
              placeholder="Ex: Rossi"
              className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-3">Grau de Parentesco</h3>
        <select
          value={grauParentesco}
          onChange={(e) => handleGrauParentescoChange(e.target.value)}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none"
        >
          <option value="">Selecione o grau de parentesco do Dante Causa</option>
          {grausParentesco.map((grau) => (
            <option key={grau} value={grau}>{grau}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Nascimento / Batismo</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={infoAncestral.nasceuItalia}
                onChange={() => handleInfoAncestralChange('nasceuItalia')}
                className="rounded text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">Nasceu na Itália</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={infoAncestral.batizado}
                onChange={() => handleInfoAncestralChange('batizado')}
                className="rounded text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">Foi Batizado (Igreja)</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Casamento</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={infoAncestral.casouItalia}
                onChange={() => handleInfoAncestralChange('casouItalia')}
                className="rounded text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">Casou na Itália</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={infoAncestral.casouBrasil}
                onChange={() => handleInfoAncestralChange('casouBrasil')}
                className="rounded text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">Casou no Brasil</span>
            </label>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-3">Óbito</h4>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={infoAncestral.faleceuItalia}
                onChange={() => handleInfoAncestralChange('faleceuItalia')}
                className="rounded text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">Faleceu na Itália</span>
            </label>
            <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={infoAncestral.faleceuBrasil}
                onChange={() => handleInfoAncestralChange('faleceuBrasil')}
                className="rounded text-[#003366] focus:ring-[#003366]"
              />
              <span className="text-sm text-gray-700">Faleceu no Brasil</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
