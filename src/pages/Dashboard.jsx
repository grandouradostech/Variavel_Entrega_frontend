import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Calendar, Filter } from 'lucide-react';
import { useFilters } from '../context/FilterContext';

const Dashboard = () => {
  const { filters, setFilters, updateCache, getCachedData } = useFilters();
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Estado local apenas para busca textual
  const [search, setSearch] = useState('');

  // Carregar dados ao iniciar ou mudar filtros
  const fetchXadrez = async () => {
    const { start: dataInicio, end: dataFim } = filters;

    if (dataInicio && dataFim && new Date(dataInicio) > new Date(dataFim)) {
      setValidationError('A data de início não pode ser maior que a data de fim.');
      return;
    }

    setValidationError('');
    setLoading(true);
    setError('');

    // Tenta obter do cache se não houver busca textual
    if (!search) {
      const cached = getCachedData('dashboard');
      if (cached) {
        setDashboardData(cached);
        setLoading(false);
        return;
      }
    }

    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      if (search) params.append('search_query', search);

      const response = await api.get(`/xadrez/?${params.toString()}`);
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        const data = response.data.dashboard || [];
        setDashboardData(data);
        
        // Atualiza cache se não houver busca, PASSANDO OS FILTROS USADOS
        if (!search) {
          updateCache('dashboard', data, { start: dataInicio, end: dataFim });
        }
        
        // Atualiza datas se vierem do backend (apenas se vazias)
        if (!dataInicio && response.data.data_inicio) {
             setFilters(prev => ({ ...prev, start: response.data.data_inicio }));
        }
        if (!dataFim && response.data.data_fim) {
             setFilters(prev => ({ ...prev, end: response.data.data_fim }));
        }
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados do Xadrez.');
    } finally {
      setLoading(false);
    }
  };

  // CORREÇÃO: Adicionado [filters] para recarregar automaticamente
  useEffect(() => {
    fetchXadrez();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); 

  const handleSearch = (e) => {
    e.preventDefault();
    fetchXadrez();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Xadrez de Equipes</h1>
          <p className="text-gray-500 text-sm">Distribuição de motoristas e ajudantes</p>
        </div>
        
        {/* Barra de Filtros */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 items-end">
            <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="dataInicio">Início</label>
                <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16}/>
                    <input 
                        id="dataInicio"
                        type="date" 
                        className="pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filters.start}
                        onChange={(e) => setFilters(prev => ({ ...prev, start: e.target.value }))}
                        aria-label="Data de início"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1" htmlFor="dataFim">Fim</label>
                <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16}/>
                    <input 
                        id="dataFim"
                        type="date" 
                        className="pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filters.end}
                        onChange={(e) => setFilters(prev => ({ ...prev, end: e.target.value }))}
                        aria-label="Data de fim"
                    />
                </div>
            </div>
            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-gray-500 mb-1" htmlFor="search">Buscar Motorista/Ajudante</label>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input 
                        id="search"
                        type="text" 
                        placeholder="Nome ou código..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Buscar motorista ou ajudante"
                    />
                </div>
            </div>
            <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                title="Filtrar"
                aria-label="Filtrar resultados"
            >
                <Filter size={20} />
            </button>
        </form>
      </div>

      {validationError && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200">
          {validationError}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && dashboardData.length > 0 && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
          Dados carregados com sucesso!
        </div>
      )}

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="py-3 px-4">Motorista (Principal)</th>
                <th className="py-3 px-4">Motorista 2</th>
                <th className="py-3 px-4 bg-blue-50/50">Ajudante 1 (Fixo)</th>
                <th className="py-3 px-4 bg-blue-50/50">Ajudante 2 (Fixo)</th>
                <th className="py-3 px-4 bg-blue-50/50">Ajudante 3 (Fixo)</th>
                <th className="py-3 px-4">Visitantes (Rotativos)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">Carregando dados...</td>
                </tr>
              ) : dashboardData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">Nenhum registro encontrado para o período.</td>
                </tr>
              ) : (
                dashboardData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-800">{row.MOTORISTA}</td>
                    <td className="py-3 px-4 text-gray-600">{row.MOTORISTA_2 || '-'}</td>
                    
                    <td className="py-3 px-4 text-blue-700 bg-blue-50/30 border-l border-gray-100">
                      {row.AJUDANTE_1 || '-'}
                    </td>
                    <td className="py-3 px-4 text-blue-700 bg-blue-50/30">
                      {row.AJUDANTE_2 || '-'}
                    </td>
                    <td className="py-3 px-4 text-blue-700 bg-blue-50/30 border-r border-gray-100">
                      {row.AJUDANTE_3 || '-'}
                    </td>

                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {row.VISITANTES && row.VISITANTES.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.VISITANTES.map((v, i) => (
                            <span key={i} className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
                              {v}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300">Nenhum</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card View (Mobile) - Mantido igual */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Carregando dados...</div>
        ) : dashboardData.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Nenhum registro encontrado.</div>
        ) : (
          dashboardData.map((row, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Motorista Principal</span>
                  <div className="font-bold text-gray-800">{row.MOTORISTA}</div>
                </div>
                {row.MOTORISTA_2 && (
                  <div className="text-right">
                    <span className="text-xs text-gray-500 uppercase font-semibold">Motorista 2</span>
                    <div className="text-gray-700">{row.MOTORISTA_2}</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <span className="text-xs text-blue-600 uppercase font-semibold block">Ajudantes Fixos</span>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {row.AJUDANTE_1 && <div className="bg-blue-50 text-blue-800 px-2 py-1 rounded">{row.AJUDANTE_1}</div>}
                  {row.AJUDANTE_2 && <div className="bg-blue-50 text-blue-800 px-2 py-1 rounded">{row.AJUDANTE_2}</div>}
                  {row.AJUDANTE_3 && <div className="bg-blue-50 text-blue-800 px-2 py-1 rounded">{row.AJUDANTE_3}</div>}
                  {!row.AJUDANTE_1 && !row.AJUDANTE_2 && !row.AJUDANTE_3 && <span className="text-gray-400 italic">Nenhum fixo</span>}
                </div>
              </div>

              {row.VISITANTES && row.VISITANTES.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">Visitantes</span>
                  <div className="flex flex-wrap gap-1">
                    {row.VISITANTES.map((v, i) => (
                      <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 border border-gray-200">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;