import React from 'react';
import type { Requerente } from '../../../types/budget';
import { Plus, Trash2, User, Users } from 'lucide-react';

interface RequerentesSectionProps {
  requerentes: Requerente[];
  adicionarRequerente: (tipo: 'Requerente' | 'Menor') => void;
  removerRequerente: (id: string) => void;
}

export function RequerentesSection({ requerentes, adicionarRequerente, removerRequerente }: RequerentesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button
          onClick={() => adicionarRequerente('Requerente')}
          className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-[#003366] hover:bg-blue-50 transition-all group"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors">
            <User size={20} />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-gray-800">Adicionar Requerente</h4>
            <p className="text-xs text-gray-500">Maior de 18 anos</p>
          </div>
        </button>

        <button
          onClick={() => adicionarRequerente('Menor')}
          className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-[#003366] hover:bg-blue-50 transition-all group"
        >
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Users size={20} />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-gray-800">Adicionar Menor</h4>
            <p className="text-xs text-gray-500">Filho(a) menor de idade</p>
          </div>
        </button>
      </div>

      <div className="space-y-3">
        {requerentes.map((req, index) => (
          <div key={req.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                req.tipo === 'Requerente' ? 'bg-blue-100 text-[#003366]' : 'bg-green-100 text-green-700'
              }`}>
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{req.tipo}</h4>
                <p className="text-xs text-gray-500">Solicitante da cidadania</p>
              </div>
            </div>
            <button
              onClick={() => removerRequerente(req.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        
        {requerentes.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
            Nenhum requerente adicionado.
          </div>
        )}
      </div>
    </div>
  );
}
