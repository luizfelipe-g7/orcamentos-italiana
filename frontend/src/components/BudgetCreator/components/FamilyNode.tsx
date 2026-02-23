import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Heart, Skull, Trash2 } from 'lucide-react';
import type { Pessoa } from '../../../types/budget';

interface FamilyNodeProps {
  data: {
    pessoa: Pessoa;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: string, value: any) => void;
  };
}

export const FamilyNode = memo(({ data }: FamilyNodeProps) => {
  const { pessoa, onRemove, onUpdate } = data;
  const isDanteCausa = pessoa.grauParentesco === 'Dante Causa';

  return (
    <div className={`relative w-64 bg-white rounded-xl shadow-md border-2 ${isDanteCausa ? 'border-[#003366]' : 'border-gray-200'} transition-all hover:shadow-lg group`}>
      {/* Input Handle (Top) - for receiving connections from parents */}
      {!isDanteCausa && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-gray-400 !border-2 !border-white"
        />
      )}

      <div className="p-4">
        {/* Header / Badge */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isDanteCausa 
              ? 'bg-[#003366] text-white' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {pessoa.grauParentesco}
          </span>
        </div>

        {/* Content */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDanteCausa ? 'bg-blue-50 text-[#003366]' : 'bg-gray-50 text-gray-500'
            }`}>
              <User size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800">
                {pessoa.quantidade} {pessoa.quantidade === 1 ? 'Pessoa' : 'Pessoas'}
              </div>
              <div className="text-xs text-gray-500">
                {isDanteCausa ? 'Raiz da Família' : 'Descendente'}
              </div>
            </div>
          </div>

          {/* Actions (Only for non-Dante) */}
          {!isDanteCausa && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag start
                onRemove(pessoa.id);
              }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remover"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Toggles */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdate(pessoa.id, 'casou', !pessoa.casou)}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
              pessoa.casou 
                ? 'bg-pink-50 text-pink-600 border border-pink-100' 
                : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
            }`}
          >
            <Heart size={12} className={pessoa.casou ? 'fill-current' : ''} />
            {pessoa.casou ? 'Casado(a)' : 'Solteiro(a)'}
          </button>

          <button
            onClick={() => onUpdate(pessoa.id, 'faleceu', !pessoa.faleceu)}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
              pessoa.faleceu 
                ? 'bg-gray-800 text-white border border-gray-700' 
                : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
            }`}
          >
            <Skull size={12} className={pessoa.faleceu ? 'fill-current' : ''} />
            {pessoa.faleceu ? 'Falecido' : 'Vivo'}
          </button>
        </div>
      </div>

      {/* Output Handle (Bottom) - for connecting to children */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 !border-2 !border-white"
      />
    </div>
  );
});

FamilyNode.displayName = 'FamilyNode';
