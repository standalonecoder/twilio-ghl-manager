import { motion } from 'framer-motion';

/**
 * DEEP OCEAN THEME - BADGE COMPONENT
 * Status indicators and labels with ocean styling
 */

export default function Badge({
  children,
  variant = 'default', // default, ocean, cyan, success, warning, danger, outline
  size = 'md', // sm, md, lg
  icon: Icon,
  dot = false,
  pulse = false,
  animate = false,
  className = '',
  ...props
}) {
  
  const baseClasses = 'inline-flex items-center font-medium rounded-md transition-all duration-300';

  // Variant styles
  const variantClasses = {
    default: 'bg-white/10 text-white border border-white/20',
    ocean: 'bg-ocean-500/20 text-ocean-100 border border-ocean-400/30',
    cyan: 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/30',
    success: 'bg-success-500/20 text-success-100 border border-success-400/30',
    warning: 'bg-warning-500/20 text-warning-100 border border-warning-400/30',
    danger: 'bg-danger-500/20 text-danger-100 border border-danger-400/30',
    outline: 'bg-transparent text-white border-2 border-white/40',
  };

  // Size styles
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Animation variants
  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const BadgeComponent = animate ? motion.span : 'span';
  const animationProps = animate ? {
    variants: badgeVariants,
    initial: "hidden",
    animate: "visible"
  } : {};

  return (
    <BadgeComponent
      className={combinedClasses}
      {...animationProps}
      {...props}
    >
      {dot && (
        <span className={`${dotSizes[size]} rounded-full bg-current mr-1.5 ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {Icon && (
        <Icon className={`${iconSizes[size]} mr-1.5`} strokeWidth={2.5} />
      )}
      {children}
    </BadgeComponent>
  );
}

/**
 * Status Badge - Pre-configured badges for common statuses
 */
export function StatusBadge({ status, size = 'md', ...props }) {
  const statusConfig = {
    active: { variant: 'success', dot: true, pulse: true, children: 'Active' },
    inactive: { variant: 'default', dot: true, children: 'Inactive' },
    pending: { variant: 'warning', dot: true, pulse: true, children: 'Pending' },
    failed: { variant: 'danger', dot: true, children: 'Failed' },
    success: { variant: 'success', dot: true, children: 'Success' },
    completed: { variant: 'ocean', dot: true, children: 'Completed' },
    processing: { variant: 'cyan', dot: true, pulse: true, children: 'Processing' },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return <Badge size={size} {...config} {...props} />;
}

/**
 * Count Badge - Show numerical values
 */
export function CountBadge({ 
  count, 
  max = 99, 
  variant = 'danger',
  size = 'sm',
  showZero = false,
  ...props 
}) {
  if (!showZero && (!count || count === 0)) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge 
      variant={variant} 
      size={size}
      className="font-bold min-w-[1.25rem] justify-center"
      {...props}
    >
      {displayCount}
    </Badge>
  );
}

/**
 * Animated Notification Badge
 */
export function NotificationBadge({ 
  count, 
  children,
  position = 'top-right', // top-right, top-left, bottom-right, bottom-left
  ...props 
}) {
  if (!count || count === 0) return children;

  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  };

  return (
    <div className="relative inline-block">
      {children}
      <motion.div
        className={`absolute ${positionClasses[position]}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <CountBadge count={count} {...props} />
      </motion.div>
    </div>
  );
}