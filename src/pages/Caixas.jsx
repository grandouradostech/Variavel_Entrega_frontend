import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Search, Package } from 'lucide-react';
import { useFilters } from '../context/FilterContext'; // <--- IMPORTAR CONTEXTO

const Caixas = () => {
  const { filters, setFilters, updateCache, getCachedData } = useFilters(); // <--- USAR CONTEXTO
  const [activeTab, setActiveTab] = useState('motoristas');
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({ motoristas: [], ajudantes: [] });
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [search, setSearch] = useState(''); // Estado para busca textual

  // Função para buscar dados da API
  const fetchDados = async (force = false) => {
    if (new Date(filters.start) > new Date(filters.end)) {
      setValidationError('A data de início não pode ser maior que a data de fim.');
      return;
    }

    // Verifica Cache antes de buscar
    if (!force) {
        const cached = getCachedData('caixas');
        if (cached) {
            setDados(cached);
            return;
        }
    }

    setValidationError('');
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/caixas', {
        params: { 
          data_inicio: filters.start, 
          data_fim: filters.end 
        }
      });
      setDados(response.data);
      updateCache('caixas', response.data); // Salva no cache
    } catch (err) {
      setError('Erro ao carregar dados. Verifique se o Backend está a correr.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carrega os dados ao abrir a página ou mudar filtros
  useEffect(() => {
    fetchDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Reage a mudanças no filtro global

  const handleDateChange = (field, value) => {
      setFilters(prev => ({ ...prev, [field]: value }));
  };

  const listaAtual = activeTab === 'motoristas' ? dados.motoristas : dados.ajudantes;
  
  // Filtragem local
  const filteredList = listaAtual.filter(item => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (item.nome && item.nome.toLowerCase().includes(term)) ||
      (item.cpf && item.cpf.includes(term)) ||
      (item.cod && String(item.cod).includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="text-blue-600" />
              Bónus Caixas
            </h1>
            <p className="text-sm text-gray-500">Cálculo baseado na antiguidade e volume de caixas.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">De:</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16} />
                <input 
                  type="date" 
                  value={filters.start}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Até:</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16} />
                <input 
                  type="date" 
                  value={filters.end}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <button 
              onClick={() => fetchDados(true)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 h-[38px]"
            >
              <Search size={18} />
              {loading ? 'A carregar...' : 'Filtrar'}
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* --- SELEÇÃO DE TIPO (MOTORISTA / AJUDANTE) --- */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit shadow-inner">
        <button
            onClick={() => setActiveTab('motoristas')}
            className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === 'motoristas' 
                ? 'bg-white shadow text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            Motoristas
        </button>
        <button
            onClick={() => setActiveTab('ajudantes')}
            className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${
                activeTab === 'ajudantes' 
                ? 'bg-white shadow text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            Ajudantes
        </button>
      </div>

      {validationError && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg border border-yellow-200">
          {validationError}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Tabela de Dados (Desktop) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">CPF</th>
                <th className="px-6 py-4 font-semibold text-gray-700">CÓD</th>
                <th className="px-6 py-4 font-semibold text-gray-700">NOME</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">ANTIGUIDADE</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">TOTAL CAIXAS</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">VALOR / CX</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">PRÉMIO TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      A carregar dados...
                    </td>
                 </tr>
              ) : filteredList.length > 0 ? (
                filteredList.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{item.cpf}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono">{item.cod}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{item.nome}</td>
                    <td className="px-6 py-4 text-gray-600 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${item.antiguidade_dias > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.antiguidade_dias} dias
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 text-right font-medium">
                      {item.total_caixas.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-right">
                      {item.valor_por_caixa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-600">
                      {item.total_premio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Nenhum registo de {activeTab === 'motoristas' ? 'motoristas' : 'ajudantes'} encontrado para este período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card View (Mobile) */}
      <div className="md:hidden space-y-4">
         {loading ? (
           <div className="text-center text-gray-500 py-8">Carregando dados...</div>
         ) : filteredList.length === 0 ? (
           <div className="text-center text-gray-500 py-8">Nenhum registo encontrado.</div>
         ) : (
           filteredList.map((item, index) => (
             <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
               <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                 <div>
                    <h3 className="font-bold text-gray-800">{item.nome}</h3>
                    <div className="text-xs text-gray-500">COD: {item.cod} | CPF: {item.cpf}</div>
                 </div>
                 <div className="text-right">
                    <span className="text-xs text-gray-500 block">Prêmio Total</span>
                    <span className="font-bold text-green-600 text-lg">
                      {item.total_premio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="text-center">
                    <span className="block text-xs text-gray-500">Antiguidade</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${item.antiguidade_dias > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.antiguidade_dias} dias
                    </span>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <span className="block text-xs text-gray-500">Total Caixas</span>
                    <span className="font-medium text-gray-800">{item.total_caixas.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="text-center border-l border-gray-100">
                    <span className="block text-xs text-gray-500">Valor/Cx</span>
                    <span className="font-medium text-gray-600">{item.valor_por_caixa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
               </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};

export default Caixas;