
import React from 'react';
import Sidebar from './Sidebar';
import { BarChart, BookOpen, Settings, Target, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Pré-Análise', path: '/pre-analise', icon: BookOpen },
    { name: 'Operações', path: '/operacoes', icon: Target },
    { name: 'Relatórios', path: '/reports', icon: BarChart },
    { name: 'Cadastros', path: '/cadastros/teams', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">MindTrade</h1>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
