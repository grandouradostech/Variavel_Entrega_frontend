import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import { useContext, lazy, Suspense } from 'react';

// Lazy loading para otimizar o carregamento inicial
const Login = lazy(() => import('./pages/Login'));
const Layout = lazy(() => import('./components/Layout'));
const Caixas = lazy(() => import('./pages/Caixas'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Incentivo = lazy(() => import('./pages/Incentivo'));
const Pagamento = lazy(() => import('./pages/Pagamento'));
const Metas = lazy(() => import('./pages/Metas'));
const Xadrez = lazy(() => import('./pages/Xadrez'));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <FilterProvider> {/* <--- ENVOLVER COM FILTER PROVIDER */}
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/xadrez" element={<Xadrez />} />
                <Route path="/incentivo" element={<Incentivo />} />
                <Route path="/caixas" element={<Caixas />} />
                <Route path="/pagamento" element={<Pagamento />} />
                <Route path="/metas" element={<Metas />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </FilterProvider>
    </AuthProvider>
  );
}

export default App;