'use client';

type InputElementType = HTMLInputElement | HTMLTextAreaElement;

interface InputProps extends Omit<React.InputHTMLAttributes<InputElementType>, 'className'> {
  label?: string;
  error?: string;
  className?: string;
  as?: 'input' | 'textarea';
}

export function Input({ 
  label, 
  error, 
  className = '', 
  as = 'input',
  ...props 
}: InputProps) {
  const Component = as;
  
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-sm font-medium text-white/90">
          {label}
        </label>
      )}
      <Component
        className={`input-field ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}