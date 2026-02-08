import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, fullWidth, children, ...props }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center font-medium rounded-xl',
      'transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.98] touch-manipulation select-none'
    );

    const variants = {
      primary: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 focus:ring-emerald-500 font-semibold shadow-sm',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-emerald-500 bg-transparent text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 focus:ring-emerald-500',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500 shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-sm min-h-[44px]',
      lg: 'px-6 py-3.5 text-base min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
