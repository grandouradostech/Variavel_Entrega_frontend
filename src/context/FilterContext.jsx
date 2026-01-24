import { createContext, useState, useContext } from 'react';
import api from '../services/api';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  // Define datas iniciais (Dia 1 do mês até Hoje)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];

  // Estado global dos filtros
  const [filters, setFilters] = useState({
    start: firstDay,
    end: currentDay
  });

  // Cache para guardar os resultados das tabelas
  const [cache, setCache] = useState({});

  // CORREÇÃO: Agora aceita 'usedParams' para garantir que salvamos o cache com a data correta da requisição
  const updateCache = (key, data, usedParams) => {
    setCache(prev => ({
      ...prev,
      [key]: { 
        data, 
        params: usedParams || { ...filters } // Usa os params passados ou fallback para o atual
      }
    }));
  };

  const getCachedData = (key) => {
    const cached = cache[key];
    // Só retorna o cache se as datas forem as mesmas da última busca
    if (cached && 
        cached.params.start === filters.start && 
        cached.params.end === filters.end) {
      return cached.data;
    }
    return null;
  };

  // Função para limpar cache local e remoto
  const refreshApp = async () => {
    setCache({});
    console.log("Cache Frontend limpo.");

    try {
        await api.post('/refresh');
        console.log("Cache Backend limpo.");
    } catch (error) {
        console.error("Erro ao limpar cache do backend:", error);
    }
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, updateCache, getCachedData, refreshApp }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => useContext(FilterContext);