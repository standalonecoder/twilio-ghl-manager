import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Phone, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Target, 
  Waves,
  Activity
} from 'lucide-react';
import Badge from './Badge';

/**
 * DEEP OCEAN THEMED LAYOUT
 * Professional glassmorphism navigation with ocean gradients
 */
export default function Layout() {
  const navItems = [
    { to: '/', icon: Activity, label: 'Dashboard', exact: true },
    { to: '/bulk-purchase', icon: ShoppingCart, label: 'Bulk Purchase' },
    { to: '/numbers', icon: Phone, label: 'Active Numbers' },
    { to: '/ghl', icon: Users, label: 'GHL Integration' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/setters', icon: Target, label: 'Setter Performance' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-950 via-ocean-900 to-ocean-800 relative overflow-x-hidden">
      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-ocean-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Glassmorphism Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 glass-strong border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <motion.div 
                className="relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-ocean-500 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-gradient-to-br from-ocean-600 to-cyan-500 p-2.5 rounded-xl shadow-ocean-lg">
                  <Phone className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold gradient-text-ocean">
                  Twilio-GHL Manager
                </h1>
                <p className="text-xs text-white/60 font-medium">
                  Enterprise Phone Management System
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Badge variant="success" dot pulse size="md">
                System Online
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Glassmorphism Navigation */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-[72px] z-40 glass border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
            {navItems.map(({ to, icon: Icon, label, exact }, index) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <NavLink
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-ocean-600 to-cyan-500 text-white shadow-ocean-md'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon 
                        className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} 
                        strokeWidth={2.5} 
                      />
                      <span>{label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-ocean-600 to-cyan-500 rounded-lg -z-10"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Ocean Wave Footer */}
      <footer className="relative z-10 mt-16 glass-dark border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Waves className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Twilio-GHL Manager
                </p>
                <p className="text-xs text-white/60">
                  © 2024 All rights reserved
                </p>
              </div>
            </div>

            {/* Status Info */}
            <div className="flex items-center gap-6 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-success-500 rounded-full animate-pulse" />
                <span>Production</span>
              </div>
              <span>•</span>
              <span>v1.0.0</span>
              <span>•</span>
              <span className="hidden sm:inline">Deep Ocean Theme</span>
            </div>

            {/* Social/Links (placeholder) */}
            <div className="flex items-center gap-4">
              <motion.a
                href="#"
                className="text-white/60 hover:text-cyan-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </motion.a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}