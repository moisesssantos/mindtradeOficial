
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideProps } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType<LucideProps>;
}

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const activeClassName = "bg-gray-700 text-white";
  const inactiveClassName = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <span className="text-xl font-bold">MindTrade</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive ? activeClassName : inactiveClassName
              }`
            }
          >
            <item.icon className="mr-3 h-6 w-6" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
