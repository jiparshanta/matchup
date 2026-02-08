import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'sport';
  sport?: string;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', sport, children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-emerald-100 text-emerald-700',
      warning: 'bg-yellow-100 text-yellow-700',
      danger: 'bg-red-100 text-red-700',
      info: 'bg-cyan-100 text-cyan-700',
      sport: '',
    };

    const sportColors: Record<string, string> = {
      football: 'bg-emerald-100 text-emerald-700',
      cricket: 'bg-yellow-100 text-yellow-700',
      basketball: 'bg-orange-100 text-orange-700',
      volleyball: 'bg-cyan-100 text-cyan-700',
      badminton: 'bg-purple-100 text-purple-700',
    };

    const badgeClass = variant === 'sport' && sport
      ? sportColors[sport] || variants.default
      : variants[variant];

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          badgeClass,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
