import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:  'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary:'border-2 border-primary-600 text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
      danger:   'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost:    'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };

    const sizes = {
      sm: 'text-sm px-4 py-2',
      md: 'text-sm px-5 py-2.5',
      lg: 'text-base px-6 py-3',
    };

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="w-4 h-4 mr-2 animate-spin text-current"
            viewBox="0 0 24 24"
            fill="none"
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
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
