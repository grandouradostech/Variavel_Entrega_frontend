import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Xadrez = () => {
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]); // Hoje
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarXadrez();
  }, [dataFiltro]);

  const carregarXadrez = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/xadrez`, {
        params: { date: dataFiltro }
      });
      setViagens(response.data);
    } catch (error) {
      console.error("Erro ao carregar dados do xadrez:", error);
      setViagens([
        { id: 1, mapa: '1050', motorista: 'João Silva', ajudantes: ['Pedro', 'Carlos'], data: dataFiltro },
        { id: 2, mapa: '1051', motorista: 'Marcos Oliveira', ajudantes: ['André'], data: dataFiltro },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Xadrez de Entregas</h1>
        
        <div className="flex items-center gap-2">
          <label className="text-gray-600 font-medium">Data do Mapa:</label>
          <input 
            type="date" 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Data</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Mapa</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Motorista</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ajudantes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Carregando mapas...
                  </td>
                </tr>
              ) : viagens.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    Nenhum mapa encontrado para esta data.
                  </td>
                </tr>
              ) : (
                viagens.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      #{item.mapa}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      {item.motorista}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(item.ajudantes) 
                          ? item.ajudantes.map((ajudante, i) => (
                              <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {ajudante}
                              </span>
                            ))
                          : item.ajudantes
                        }
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Xadrez;