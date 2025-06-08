import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, asChild, ...props }, ref) => {
    // Apple HIG button styles
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800 shadow-md hover:shadow-lg',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 active:bg-gray-300 border border-gray-200',
      tertiary: 'bg-gray-50 text-gray-700 hover:bg-gray-100 focus:ring-gray-400 active:bg-gray-150 border border-gray-150',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400 active:bg-gray-150',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800 shadow-md hover:shadow-lg',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-md min-w-[64px]',
      md: 'h-10 px-4 text-base rounded-lg min-w-[80px]',
      lg: 'h-12 px-6 text-lg rounded-xl min-w-[96px]',
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className,
          (children.props as any).className
        ),
        ...props,
      });
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          loading && 'cursor-wait',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
        <span className={loading ? 'opacity-0' : 'opacity-100'}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
