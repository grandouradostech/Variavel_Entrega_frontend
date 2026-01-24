import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Search } from 'lucide-react';

const Xadrez = () => {
  // Define datas iniciais (Mês atual)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(firstDay);
  const [dataFim, setDataFim] = useState(currentDay);
  const [busca, setBusca] = useState(''); // Estado para o filtro de texto
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarXadrez();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataInicio, dataFim]);

  const carregarXadrez = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/xadrez/detalhado`, {
        params: { 
            data_inicio: dataInicio,
            data_fim: dataFim
        }
      });
      
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

  // Lógica de Filtro Local (Nome do Motorista ou Ajudante)
  const viagensFiltradas = viagens.filter((item) => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    
    // Verifica se o termo existe em qualquer um dos campos de nome
    return (
        (item.MOTORISTA && item.MOTORISTA.toLowerCase().includes(termo)) ||
        (item.MOTORISTA_2 && item.MOTORISTA_2.toLowerCase().includes(termo)) ||
        (item.AJUDANTE_1 && item.AJUDANTE_1.toLowerCase().includes(termo)) ||
        (item.AJUDANTE_2 && item.AJUDANTE_2.toLowerCase().includes(termo)) ||
        (item.AJUDANTE_3 && item.AJUDANTE_3.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Xadrez de Entregas</h1>
            <p className="text-sm text-gray-500">Acompanhamento diário de mapas e equipes</p>
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Início</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16} />
                <input 
                  type="date" 
                  className="pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Fim</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16} />
                <input 
                  type="date" 
                  className="pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={() => carregarXadrez()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium h-[38px]"
            >
              Filtrar
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa por Texto */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por Motorista ou Ajudante..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
              <tr>
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
              ) : viagensFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-6 py-12 text-center text-gray-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                viagensFiltradas.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                    {/* DATA */}
                    <td className="px-4 py-3 text-gray-600 font-medium">
                      {item.DATA ? new Date(item.DATA + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                    </td>
                    
                    {/* MAPA */}
                    <td className="px-4 py-3 font-bold text-blue-600">
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