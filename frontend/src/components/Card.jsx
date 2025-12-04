/**
 * Modern Card Component
 * Provides consistent styling across the application
 */

export function Card({ children, className = '', hover = false, glass = false }) {
  const baseClasses = glass
    ? 'glass rounded-2xl p-6'
    : 'bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-6';
  
  const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', gradient = false }) {
  return (
    <h3 className={`text-lg font-bold ${gradient ? 'gradient-text' : 'text-neutral-900'} ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-neutral-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 pt-4 border-t border-neutral-100 ${className}`}>
      {children}
    </div>
  );
}

// Stat Card - Clean minimal design like Close.com
export function StatCard({ label, value, icon: Icon, trend, trendValue, color = 'brand' }) {
  const colorClasses = {
    brand: 'bg-blue-500',
    accent: 'bg-purple-500',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    danger: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          
          {trend && (
            <div className={`flex items-center mt-1 text-xs font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`${colorClasses[color]} p-2 rounded-md`}>
            <Icon className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}

// Alert Card - for notifications and warnings
export function AlertCard({ type = 'info', title, children, icon: Icon, onClose }) {
  const typeStyles = {
    info: {
      bg: 'bg-brand-50',
      border: 'border-brand-200',
      text: 'text-brand-900',
      icon: 'text-brand-600',
    },
    success: {
      bg: 'bg-success-50',
      border: 'border-success-200',
      text: 'text-success-900',
      icon: 'text-success-600',
    },
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-200',
      text: 'text-warning-900',
      icon: 'text-warning-600',
    },
    danger: {
      bg: 'bg-danger-50',
      border: 'border-danger-200',
      text: 'text-danger-900',
      icon: 'text-danger-600',
    },
  };

  const styles = typeStyles[type];

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-2xl p-4`}>
      <div className="flex items-start">
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
        )}
        <div className={`${Icon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className={`text-sm font-bold ${styles.text}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.text} ${title ? 'mt-1' : ''}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 ${styles.icon} hover:opacity-70`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}