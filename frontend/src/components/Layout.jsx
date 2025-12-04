import { Outlet, NavLink } from 'react-router-dom';
import { Phone, ShoppingCart, Users, BarChart3, Target } from 'lucide-react';

export default function Layout() {
  const navItems = [
    { to: '/bulk-purchase', icon: ShoppingCart, label: 'Bulk Purchase' },
    { to: '/numbers', icon: Phone, label: 'Active Numbers' },
    { to: '/ghl', icon: Users, label: 'GHL Integration' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/setters', icon: Target, label: 'Setter Performance' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Twilio-GHL Manager
                </h1>
                <p className="text-xs text-gray-500">Enterprise Phone Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-md border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Minimal Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 mr-2" strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>© 2024 Twilio-GHL Manager</p>
            <div className="flex items-center space-x-3">
              <span>v1.0.0</span>
              <span>•</span>
              <span>Production Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}