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

  // Cache para guardar os resultados das tabelas e evitar recarregamento
  const [cache, setCache] = useState({});

  const updateCache = (key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: { 
        data, 
        params: { ...filters } // Guarda quais datas geraram esses dados
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
    // 1. Limpa cache local
    setCache({});
    console.log("Cache Frontend limpo.");

    // 2. Chama endpoint para limpar cache do backend
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