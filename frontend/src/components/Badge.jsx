/**
 * Modern Badge Component
 * For status indicators, tags, and labels
 */

export function Badge({ 
  children, 
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  dot = false,
  className = '' 
}) {
  const variants = {
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    brand: 'bg-brand-100 text-brand-700 border-brand-200',
    accent: 'bg-accent-100 text-accent-700 border-accent-200',
    success: 'bg-success-100 text-success-700 border-success-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    danger: 'bg-danger-100 text-danger-700 border-danger-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotColors = {
    neutral: 'bg-neutral-500',
    brand: 'bg-brand-500',
    accent: 'bg-accent-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColors[variant]}`}></span>
      )}
      {Icon && (
        <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} strokeWidth={2.5} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status, size = 'md' }) {
  const statusConfig = {
    active: { variant: 'success', label: 'Active', dot: true },
    inactive: { variant: 'neutral', label: 'Inactive', dot: true },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    error: { variant: 'danger', label: 'Error', dot: true },
    completed: { variant: 'success', label: 'Completed', dot: false },
    failed: { variant: 'danger', label: 'Failed', dot: false },
    spam: { variant: 'danger', label: 'Spam Risk', dot: true },
    warning: { variant: 'warning', label: 'Warning', dot: true },
    good: { variant: 'success', label: 'Good', dot: true },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Badge variant={config.variant} size={size} dot={config.dot}>
      {config.label}
    </Badge>
  );
}

export function CountBadge({ count, variant = 'neutral', size = 'md', max = 99 }) {
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <Badge variant={variant} size={size}>
      {displayCount}
    </Badge>
  );
}