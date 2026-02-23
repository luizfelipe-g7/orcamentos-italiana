import React from 'react';
import { DollarSign, Calendar } from 'lucide-react';

export function PaymentConfigSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Configuração de Pagamento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" className="text-[#003366] focus:ring-[#003366]" defaultChecked />
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-green-600" />
                  <span className="font-medium text-gray-700">À Vista (5% de desconto)</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" className="text-[#003366] focus:ring-[#003366]" />
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#003366]" />
                  <span className="font-medium text-gray-700">Parcelado</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de Parcelas</label>
            <select className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none">
              {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
                <option key={num} value={num}>{num}x Sem Juros</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
