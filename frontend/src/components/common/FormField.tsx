import React from 'react';
import { Input } from './Input';
import { Select } from './Select';
import type { SelectOption } from './Select';

interface BaseFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

interface TextFieldProps extends BaseFieldProps {
  type: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  autoComplete?: string;
}

interface SelectFieldProps extends BaseFieldProps {
  type: 'select';
  options: SelectOption[];
  placeholder?: string;
}

type FormFieldProps = TextFieldProps | SelectFieldProps;

export const FormField: React.FC<FormFieldProps> = (props) => {
  const { label, name, error, required, helperText } = props;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-secondary-900"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {helperText && (
          <span className="text-xs text-secondary-500">{helperText}</span>
        )}
      </div>

      <div className="touch-manipulation">
        {props.type === 'select' ? (
          <Select
            id={name}
            name={name}
            options={props.options}
            value={null}
            onChange={() => {}}
            error={error}
            placeholder={props.placeholder}
            className="min-h-[44px]"
          />
        ) : (
          <Input
            id={name}
            name={name}
            type={props.type}
            placeholder={props.placeholder}
            autoComplete={props.autoComplete}
            error={error}
            className="min-h-[44px]"
            aria-describedby={error ? `${name}-error` : undefined}
          />
        )}
      </div>

      {error && (
        <p
          id={`${name}-error`}
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}; 