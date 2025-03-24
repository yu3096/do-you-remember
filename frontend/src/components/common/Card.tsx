import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-lg bg-white shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border border-secondary-200',
        elevated: 'shadow-md hover:shadow-lg',
        outline: 'border-2 border-primary-500',
      },
      padding: {
        none: '',
        sm: 'p-3 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8',
      },
      layout: {
        default: '',
        responsive: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
        list: 'flex flex-col space-y-4',
      },
      width: {
        auto: '',
        full: 'w-full',
        responsive: 'w-full sm:w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      layout: 'default',
      width: 'auto',
    },
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  as?: keyof JSX.IntrinsicElements;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, layout, width, as: Component = 'div', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cardVariants({ variant, padding, layout, width, className })}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card'; 