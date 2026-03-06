import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Orcamentos } from './pages/Orcamentos';
import { NovoOrcamento } from './pages/NovoOrcamento';
import { OrcamentoDetalhe } from './pages/OrcamentoDetalhe';
import { Membros } from './pages/Membros';
import { Configuracoes } from './pages/Configuracoes';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute check:', { isAuthenticated, loading, user, path: location.pathname });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!isAuthenticated) {
    console.log('Não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Rotas protegidas dentro do Layout */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orcamentos" element={<Orcamentos />} />
        <Route path="/orcamentos/novo" element={<NovoOrcamento />} />
        <Route path="/orcamentos/:id" element={<OrcamentoDetalhe />} />
        <Route path="/membros" element={<Membros />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
