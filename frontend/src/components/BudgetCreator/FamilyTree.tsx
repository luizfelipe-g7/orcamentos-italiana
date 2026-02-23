import React from 'react';
import { User, Heart, Skull, Plus, Trash2 } from 'lucide-react';
import type { Pessoa } from '../../types/budget';

interface FamilyTreeProps {
  pessoas: Pessoa[];
  onAddPessoa: () => void;
  onRemovePessoa: (id: string) => void;
  onUpdatePessoa: (id: string, field: string, value: any) => void;
}

export function FamilyTree({ pessoas, onAddPessoa, onRemovePessoa, onUpdatePessoa }: FamilyTreeProps) {
  return (
    <div className="flex flex-col items-center p-8 bg-gray-50 rounded-xl border border-gray-200 min-h-[400px]">
      <h3 className="text-lg font-bold text-[#003366] mb-8">Árvore Genealógica</h3>
      
      <div className="relative flex flex-col items-center space-y-8 w-full max-w-2xl">
        {/* Linha Vertical Central que conecta tudo */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 -z-10 transform -translate-x-1/2"></div>

        {/* Ancestral Italiano (Topo) */}
        <div className="relative z-10 bg-white p-4 rounded-xl shadow-md border-2 border-[#003366] w-64 text-center">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#003366] text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Dante Causa
          </div>
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700">
              <User size={24} />
            </div>
          </div>
          <h4 className="font-bold text-gray-800">Ancestral Italiano</h4>
          <p className="text-xs text-gray-500">Início da Linhagem</p>
        </div>

        {/* Pessoas da Linhagem */}
        {pessoas.map((pessoa, index) => (
          <div key={pessoa.id} className="relative z-10 w-full flex justify-center group">
            {/* Card da Pessoa */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-72 hover:shadow-md transition-all hover:border-blue-300 relative">
              
              {/* Botão Remover (aparece no hover) */}
              <button 
                onClick={() => onRemovePessoa(pessoa.id)}
                className="absolute -right-3 -top-3 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                title="Remover"
              >
                <Trash2 size={14} />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#003366] font-bold text-sm">
                  {index + 1}º
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{pessoa.grauParentesco}</h4>
                  <p className="text-xs text-gray-500">Descendente</p>
                </div>
              </div>

              {/* Controles de Vida */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onUpdatePessoa(pessoa.id, 'casou', !pessoa.casou)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
                    pessoa.casou 
                      ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                      : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <Heart size={12} className={pessoa.casou ? "fill-current" : ""} />
                  {pessoa.casou ? 'Casou' : 'Solteiro'}
                </button>
                
                <button
                  onClick={() => onUpdatePessoa(pessoa.id, 'faleceu', !pessoa.faleceu)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
                    pessoa.faleceu 
                      ? 'bg-gray-800 text-white border border-gray-700' 
                      : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'
                  }`}
                >
                  <Skull size={12} />
                  {pessoa.faleceu ? 'Falecido' : 'Vivo'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Botão Adicionar */}
        {/* <button 
          onClick={onAddPessoa}
          className="relative z-10 flex items-center gap-2 px-4 py-2 bg-white border border-dashed border-gray-300 rounded-full text-gray-500 hover:text-[#003366] hover:border-[#003366] transition-all shadow-sm hover:shadow"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Adicionar Geração</span>
        </button> */}

        {/* Requerente (Base) */}
        <div className="relative z-10 bg-[#003366] p-4 rounded-xl shadow-md border-2 border-[#003366] w-64 text-center text-white mt-4">
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-[#003366] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            Requerente
          </div>
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white">
              <User size={24} />
            </div>
          </div>
          <h4 className="font-bold">Você / Cliente</h4>
          <p className="text-xs text-blue-200">Fim da Linhagem</p>
        </div>
      </div>
    </div>
  );
}
