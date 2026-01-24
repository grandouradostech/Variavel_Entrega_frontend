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
      const response = await api.get(`/xadrez/detalhado`, {
        params: { date: dataFiltro }
      });
      // Verifica se veio um erro ou array
      if (response.data && !response.data.error) {
        setViagens(response.data);
      } else {
        setViagens([]);
        if(response.data.error) console.error(response.data.error);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do xadrez:", error);
      setViagens([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Xadrez de Entregas (Diário)</h1>
        
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
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
              <tr>
                {/* Cabeçalho exato conforme solicitado */}
                <th className="px-4 py-3">DATA</th>
                <th className="px-4 py-3">MAPA</th>
                
                <th className="px-4 py-3 border-l border-gray-200">COD (M1)</th>
                <th className="px-4 py-3">MOTORISTA</th>
                
                <th className="px-4 py-3 border-l border-gray-200">COD (M2)</th>
                <th className="px-4 py-3">MOTORISTA 2</th>
                
                <th className="px-4 py-3 border-l border-gray-200 bg-blue-50">COD (AJ1)</th>
                <th className="px-4 py-3 bg-blue-50">AJUDANTE 1</th>
                
                <th className="px-4 py-3 border-l border-gray-200 bg-blue-50">COD (AJ2)</th>
                <th className="px-4 py-3 bg-blue-50">AJUDANTE 2</th>
                
                <th className="px-4 py-3 border-l border-gray-200 bg-blue-50">COD (AJ3)</th>
                <th className="px-4 py-3 bg-blue-50">AJUDANTE 3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Carregando dados...
                    </div>
                  </td>
                </tr>
              ) : viagens.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-6 py-12 text-center text-gray-500">
                    Nenhum registro encontrado para a data {new Date(dataFiltro).toLocaleDateString('pt-BR')}.
                  </td>
                </tr>
              ) : (
                viagens.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                    {/* DATA */}
                    <td className="px-4 py-3 text-gray-600">
                      {item.DATA ? new Date(item.DATA + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                    </td>
                    
                    {/* MAPA */}
                    <td className="px-4 py-3 font-medium text-blue-600">
                      {item.MAPA || '-'}
                    </td>

                    {/* MOTORISTA 1 */}
                    <td className="px-4 py-3 text-gray-500 border-l border-gray-100 font-mono text-xs">
                      {item.COD || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {item.MOTORISTA || '-'}
                    </td>

                    {/* MOTORISTA 2 */}
                    <td className="px-4 py-3 text-gray-500 border-l border-gray-100 font-mono text-xs">
                      {item.COD_2 || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-800">
                      {item.MOTORISTA_2 || '-'}
                    </td>

                    {/* AJUDANTE 1 */}
                    <td className="px-4 py-3 text-gray-500 bg-blue-50/20 border-l border-gray-100 font-mono text-xs">
                      {item.CODJ_1 || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 bg-blue-50/20">
                      {item.AJUDANTE_1 || '-'}
                    </td>

                    {/* AJUDANTE 2 */}
                    <td className="px-4 py-3 text-gray-500 bg-blue-50/20 border-l border-gray-100 font-mono text-xs">
                      {item.CODJ_2 || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 bg-blue-50/20">
                      {item.AJUDANTE_2 || '-'}
                    </td>

                    {/* AJUDANTE 3 */}
                    <td className="px-4 py-3 text-gray-500 bg-blue-50/20 border-l border-gray-100 font-mono text-xs">
                      {item.CODJ_3 || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 bg-blue-50/20">
                      {item.AJUDANTE_3 || '-'}
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