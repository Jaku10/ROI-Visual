import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Calculator, Sparkles, Home } from 'lucide-react';
import { clsx } from 'clsx';

export function Layout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isGeneral = location.pathname === '/general';
  const isHighspot = location.pathname === '/highspot';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">ROI & KPI Modeler</h1>
              <p className="text-xs text-slate-500">Interactive Enterprise Analysis</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <Link
              to="/"
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isLanding ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              <Home className="w-4 h-4" />
              Input
            </Link>
            <Link
              to="/general"
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isGeneral ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              <Calculator className="w-4 h-4" />
              General Model
            </Link>
            <Link
              to="/highspot"
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isHighspot ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              <Sparkles className="w-4 h-4" />
              Highspot Impact
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
