import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Lethimdo', subtitle = 'Professional API Integration Platform' }) => {
  return (
    <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-white text-blue-600 font-bold text-lg w-10 h-10 rounded-lg flex items-center justify-center">
                L
              </div>
              <div>
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-xs text-blue-200 hidden md:block">{subtitle}</p>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Dashboard
              </Link>
              <Link to="/integrations" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Integrations
              </Link>
              <Link to="/test-api" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                API Test
              </Link>
              <Link to="/docs" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Docs
              </Link>
            </div>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-medium hover:text-blue-200 transition-colors">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bangladesh Agency Badge */}
      <div className="bg-red-600 py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-medium text-white">
            🇧🇩 Proudly Serving Bangladesh Freelance Agencies | Earn in USD, Save 90% on Costs
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;