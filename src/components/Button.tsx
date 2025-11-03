'use client';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn-${variant} relative ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
    </button>
  );
}