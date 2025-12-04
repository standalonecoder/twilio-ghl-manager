/**
 * Modern Button Component
 * Professional button styles with variants
 */

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  fullWidth = false
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-medium hover:shadow-large focus:ring-brand-500',
    secondary: 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 shadow-medium hover:shadow-large focus:ring-accent-500',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-medium hover:shadow-large focus:ring-success-500',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 shadow-medium hover:shadow-large focus:ring-warning-500',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white hover:from-danger-600 hover:to-danger-700 shadow-medium hover:shadow-large focus:ring-danger-500',
    ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
    outline: 'border-2 border-brand-500 text-brand-600 hover:bg-brand-50 focus:ring-brand-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {Icon && !loading && iconPosition === 'left' && (
        <Icon className={`${size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${children ? 'mr-2' : ''}`} strokeWidth={2.5} />
      )}
      
      {children}
      
      {Icon && !loading && iconPosition === 'right' && (
        <Icon className={`${size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${children ? 'ml-2' : ''}`} strokeWidth={2.5} />
      )}
    </button>
  );
}

export function IconButton({ 
  icon: Icon, 
  variant = 'ghost', 
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  title
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-medium hover:shadow-large focus:ring-brand-500',
    secondary: 'bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 focus:ring-neutral-500',
    ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      <Icon className={iconSizes[size]} strokeWidth={2.5} />
    </button>
  );
}

export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`inline-flex rounded-xl shadow-soft overflow-hidden ${className}`}>
      {children}
    </div>
  );
}