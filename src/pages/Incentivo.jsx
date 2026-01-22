import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Search, Filter, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const Incentivo = () => {
  const [data, setData] = useState({ motoristas: [], ajudantes: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('motoristas');

  // Filtros
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [search, setSearch] = useState('');

  const fetchIncentivo = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      
      // O endpoint espera formato ISO ou YYYY-MM-DD. O input type="date" já fornece YYYY-MM-DD
      // Se não houver datas, o backend assume o mês atual
      if (!dataInicio || !dataFim) {
          // Opcional: definir datas padrão aqui se o backend exigir
          const hoje = new Date();
          const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
          const fim = hoje.toISOString().split('T')[0];
          params.append('data_inicio', inicio);
          params.append('data_fim', fim);
      }

      const response = await api.get(`/incentivo/?${params.toString()}`);
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setData({
            motoristas: response.data.motoristas || [],
            ajudantes: response.data.ajudantes || []
        });
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados de incentivo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Define datas iniciais padrão para os inputs
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const fim = hoje.toISOString().split('T')[0];
    setDataInicio(inicio);
    setDataFim(fim);
  }, []);

  // Dispara a busca quando as datas mudam (ou no clique do botão filtrar)
  const handleFilter = (e) => {
    e.preventDefault();
    fetchIncentivo();
  };

  // Filtra a lista localmente pelo nome/cpf
  const filterList = (list) => {
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(item => 
        (item.nome && item.nome.toLowerCase().includes(s)) || 
        (item.cpf && item.cpf.includes(s)) ||
        (item.cod && String(item.cod).includes(s))
    );
  };

  const renderStatusIcon = (valStr) => {
     // Lógica visual simples: se tiver valor é "analisado", se N/A é cinza
     if (valStr === 'N/A' || valStr === null) return <span className="text-gray-400">-</span>;
     return <span className="font-medium text-gray-800">{valStr}</span>;
  };
  
  const renderPremio = (valor) => {
      const v = parseFloat(valor) || 0;
      return (
          <span className={`font-bold ${v > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
      );
  };

  const listaAtual = activeTab === 'motoristas' ? data.motoristas : data.ajudantes;
  const listaFiltrada = filterList(listaAtual);

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            Incentivo e KPIs
          </h1>
          <p className="text-gray-500 text-sm">Acompanhamento de devoluções, rating e refugo</p>
        </div>

        <form onSubmit={handleFilter} className="flex flex-wrap gap-2 items-end">
            <div>
                <label className="block text-xs text-gray-500 mb-1">Início</label>
                <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16}/>
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
                    <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16}/>
                    <input 
                        type="date" 
                        className="pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                    />
                </div>
            </div>
            <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors h-[38px]"
                title="Atualizar Dados"
            >
                <Filter size={20} />
            </button>
        </form>
      </div>

      {/* Abas e Busca */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full md:w-auto">
            <button
                onClick={() => setActiveTab('motoristas')}
                className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'motoristas' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
                Motoristas
            </button>
            <button
                onClick={() => setActiveTab('ajudantes')}
                className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'ajudantes' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
                Ajudantes
            </button>
        </div>

        <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            <input 
                type="text" 
                placeholder="Buscar por nome..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Tabela (Desktop) */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                
                <th className="py-3 px-4 text-center bg-blue-50/30 border-l">Dev. PDV</th>
                <th className="py-3 px-4 text-right bg-blue-50/30 text-blue-700">Prêmio</th>
                
                <th className="py-3 px-4 text-center border-l">Rating</th>
                <th className="py-3 px-4 text-right text-blue-700">Prêmio</th>
                
                <th className="py-3 px-4 text-center bg-blue-50/30 border-l">Refugo</th>
                <th className="py-3 px-4 text-right bg-blue-50/30 text-blue-700">Prêmio</th>
                
                <th className="py-3 px-4 text-right font-bold text-gray-800 border-l bg-gray-50">Total KPIs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="py-8 text-center text-gray-500">Calculando indicadores...</td></tr>
              ) : listaFiltrada.length === 0 ? (
                <tr><td colSpan="8" className="py-8 text-center text-gray-500">Nenhum registro encontrado. Clique em filtrar para carregar.</td></tr>
              ) : (
                listaFiltrada.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{row.nome}</div>
                        <div className="text-xs text-gray-400">COD: {row.cod}</div>
                    </td>
                    
                    {/* Dev PDV */}
                    <td className="py-3 px-4 text-center bg-blue-50/10 border-l border-gray-100">
                        {renderStatusIcon(row.dev_pdv_val)}
                    </td>
                    <td className="py-3 px-4 text-right bg-blue-50/10">
                        {renderPremio(row.dev_pdv_premio_val)}
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-4 text-center border-l border-gray-100">
                        {renderStatusIcon(row.rating_val)}
                    </td>
                    <td className="py-3 px-4 text-right">
                        {renderPremio(row.rating_premio_val)}
                    </td>

                    {/* Refugo */}
                    <td className="py-3 px-4 text-center bg-blue-50/10 border-l border-gray-100">
                        {renderStatusIcon(row.refugo_val)}
                    </td>
                    <td className="py-3 px-4 text-right bg-blue-50/10">
                        {renderPremio(row.refugo_premio_val)}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-right font-bold text-blue-800 border-l border-gray-100 bg-gray-50">
                        {renderPremio(row.total_premio)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card View (Mobile) */}
      <div className="md:hidden space-y-4">
         {loading ? (
           <div className="text-center text-gray-500 py-8">Calculando...</div>
         ) : listaFiltrada.length === 0 ? (
           <div className="text-center text-gray-500 py-8">Nenhum registro encontrado.</div>
         ) : (
           listaFiltrada.map((row, index) => (
             <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
               <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                 <div>
                    <h3 className="font-bold text-gray-800">{row.nome}</h3>
                    <div className="text-xs text-gray-500">COD: {row.cod}</div>
                 </div>
                 <div className="text-right">
                    <span className="text-xs text-gray-500 uppercase block">Total KPIs</span>
                    {renderPremio(row.total_premio)}
                 </div>
               </div>

               <div className="space-y-3 pt-2">
                  {/* Item KPI */}
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-600">Dev. PDV</span>
                     <div className="flex items-center gap-3">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{row.dev_pdv_val || '-'}</span>
                        {renderPremio(row.dev_pdv_premio_val)}
                     </div>
                  </div>
                  
                  {/* Item KPI */}
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-600">Rating</span>
                     <div className="flex items-center gap-3">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{row.rating_val || '-'}</span>
                        {renderPremio(row.rating_premio_val)}
                     </div>
                  </div>

                  {/* Item KPI */}
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-600">Refugo</span>
                     <div className="flex items-center gap-3">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{row.refugo_val || '-'}</span>
                        {renderPremio(row.refugo_premio_val)}
                     </div>
                  </div>
               </div>
             </div>
           ))
         )}
      </div>
    </div>
  );
};

export default Incentivo;