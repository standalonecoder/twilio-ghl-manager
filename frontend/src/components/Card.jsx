import { motion } from 'framer-motion';
import { forwardRef } from 'react';

/**
 * DEEP OCEAN THEME - CARD COMPONENTS
 * Professional glassmorphism cards with advanced animations
 */

/**
 * Main Card Component
 */
export const Card = forwardRef(({ 
  children, 
  className = '', 
  hover = true,
  stacked = false,
  variant = 'default', // default, glass, glass-strong, glass-dark, solid
  animate = false,
  onClick,
  ...props 
}, ref) => {
  const baseClasses = 'rounded-xl transition-all duration-400 ease-smooth';
  
  const variantClasses = {
    default: 'ocean-card',
    glass: 'glass p-6',
    'glass-strong': 'glass-strong p-6',
    'glass-dark': 'glass-dark p-6',
    solid: 'bg-white/10 border border-white/15 p-6',
  };

  const hoverClasses = hover 
    ? 'hover-lift cursor-pointer' 
    : '';

  const stackedClasses = stacked ? 'stacked-cards' : '';

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${stackedClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    hover: {
      y: -6,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  if (animate) {
    return (
      <motion.div
        ref={ref}
        className={combinedClasses}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={hover ? "hover" : undefined}
        onClick={onClick}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-white/10 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Body/Content Component
 */
export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Footer Component
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Title Component
 */
export function CardTitle({ children, className = '', gradient = false }) {
  return (
    <h3 className={`
      text-lg font-semibold
      ${gradient ? 'gradient-text-ocean' : 'text-white'}
      ${className}
    `}>
      {children}
    </h3>
  );
}

/**
 * Card Description Component
 */
export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-white/60 mt-1 ${className}`}>
      {children}
    </p>
  );
}

/**
 * Stat Card - Ocean themed with animated counters
 */
export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'ocean',
  animate = true 
}) {
  const colorClasses = {
    ocean: 'bg-gradient-to-br from-ocean-600 to-ocean-500',
    cyan: 'bg-gradient-to-br from-cyan-600 to-cyan-500',
    success: 'bg-gradient-to-br from-success-600 to-success-500',
    warning: 'bg-gradient-to-br from-warning-600 to-warning-500',
    danger: 'bg-gradient-to-br from-danger-600 to-danger-500',
  };

  const trendColors = {
    up: 'text-success-400',
    down: 'text-danger-400',
  };

  const CardWrapper = animate ? motion.div : 'div';
  const cardProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    whileHover: { y: -4, transition: { duration: 0.3 } }
  } : {};

  return (
    <CardWrapper className="ocean-card p-6" {...cardProps}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-white">
            {value}
          </p>
          
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-medium ${trendColors[trend]}`}>
              <span className="mr-1">{trend === 'up' ? '↑' : '↓'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`${colorClasses[color]} p-3 rounded-xl shadow-lg`}>
            <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
        )}
      </div>
    </CardWrapper>
  );
}

/**
 * Alert Card - Ocean themed notifications
 */
export function AlertCard({ 
  type = 'info', 
  title, 
  children, 
  icon: Icon, 
  onClose 
}) {
  const typeStyles = {
    info: {
      bg: 'bg-ocean-500/10',
      border: 'border-ocean-400/30',
      text: 'text-ocean-100',
      icon: 'text-ocean-400',
    },
    success: {
      bg: 'bg-success-500/10',
      border: 'border-success-400/30',
      text: 'text-success-100',
      icon: 'text-success-400',
    },
    warning: {
      bg: 'bg-warning-500/10',
      border: 'border-warning-400/30',
      text: 'text-warning-100',
      icon: 'text-warning-400',
    },
    danger: {
      bg: 'bg-danger-500/10',
      border: 'border-danger-400/30',
      text: 'text-danger-100',
      icon: 'text-danger-400',
    },
  };

  const styles = typeStyles[type];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`${styles.bg} ${styles.border} border backdrop-blur-md rounded-xl p-4`}
    >
      <div className="flex items-start">
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
        )}
        <div className={`${Icon ? 'ml-3' : ''} flex-1`}>
          {title && (
            <h3 className={`text-sm font-semibold ${styles.text}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.text} ${title ? 'mt-1' : ''} opacity-90`}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 ${styles.icon} hover:opacity-70 transition-opacity`}
          >
            <span className="text-xl">×</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Metric Card - Large display card for key metrics
 */
export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  animate = true 
}) {
  const CardWrapper = animate ? motion.div : 'div';
  const cardProps = animate ? {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  } : {};

  return (
    <CardWrapper className="ocean-card p-8" {...cardProps}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-white/60 mb-2">{title}</p>
          <h2 className="text-4xl font-bold gradient-text-ocean">
            {value}
          </h2>
        </div>
        {Icon && (
          <div className="bg-cyan-500/20 p-3 rounded-xl">
            <Icon className="h-8 w-8 text-cyan-400" strokeWidth={2} />
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-white/50">{subtitle}</p>
      )}
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-success-400' : 'text-danger-400'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-sm text-white/40 ml-2">vs last period</span>
        </div>
      )}
    </CardWrapper>
  );
}

export default Card;