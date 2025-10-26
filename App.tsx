
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TradingList from './pages/TradingList';
import TradingForm from './pages/TradingForm';
import Reports from './pages/Reports';
import Cadastros from './pages/Cadastros';
import { DataType } from './types';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pre-analise" element={<TradingList mode="pre-analysis" />} />
          <Route path="/operacoes" element={<TradingList mode="operation" />} />
          <Route path="/trading/new" element={<TradingForm />} />
          <Route path="/trading/edit/:id" element={<TradingForm />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/cadastros/:type" element={<Cadastros />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
