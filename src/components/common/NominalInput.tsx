import React, { useState, useEffect } from 'react';

interface NominalInputProps {
  value: number | undefined | null;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  formatThousands?: boolean;
  ariaLabel?: string;
}

export const NominalInput: React.FC<NominalInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  min,
  max,
  allowNegative = false,
  className = '',
  id,
  name,
  required = false,
  autoFocus = false,
  disabled = false,
  formatThousands = true,
  ariaLabel
}) => {
  // Format numeric value into human-readable string (e.g. 1500000 -> "1.500.000")
  const formatVal = (num: number | undefined | null): string => {
    if (num === null || num === undefined || num === 0) return '';
    if (isNaN(num)) return '';
    if (!formatThousands) return String(num);

    const isNeg = num < 0;
    const abs = Math.abs(num);
    const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return isNeg ? `-${formatted}` : formatted;
  };

  const [text, setText] = useState<string>(() => formatVal(value));

  // Sync internal text when external value changes
  useEffect(() => {
    if (value === 0 && text === '') {
      // Keep empty if user explicitly cleared it
      return;
    }
    const currentParsed = parseRaw(text);
    if (currentParsed !== (value ?? 0)) {
      setText(formatVal(value));
    }
  }, [value]);

  const parseRaw = (str: string): number => {
    if (!str || str.trim() === '') return 0;
    // Strip dots, spaces, "Rp", etc.
    const cleanStr = str.replace(/[^\d-]/g, '');
    if (cleanStr === '' || cleanStr === '-') return 0;
    const parsed = parseInt(cleanStr, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // If completely cleared (backspace until empty):
    if (rawInput === '' || rawInput.trim() === '') {
      setText('');
      onChange(0);
      return;
    }

    // Handle minus sign for negative values
    const isNegativeInput = allowNegative && rawInput.startsWith('-');
    const digitsOnly = rawInput.replace(/\D/g, '');

    if (digitsOnly === '') {
      if (isNegativeInput) {
        setText('-');
        onChange(0);
      } else {
        setText('');
        onChange(0);
      }
      return;
    }

    let numericVal = parseInt(digitsOnly, 10);
    if (isNaN(numericVal)) numericVal = 0;
    if (isNegativeInput) numericVal = -numericVal;

    // Apply min/max constraints if specified
    if (min !== undefined && numericVal < min) {
      // Allow intermediate typing if min is positive and user is starting from small number
    }
    if (max !== undefined && numericVal > max) {
      numericVal = max;
    }

    // Format display string
    let formattedText = '';
    if (formatThousands) {
      const absFormatted = Math.abs(numericVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      formattedText = numericVal < 0 ? `-${absFormatted}` : absFormatted;
    } else {
      formattedText = String(numericVal);
    }

    setText(formattedText);
    onChange(numericVal);
  };

  const handleBlur = () => {
    // On blur, format cleanly
    if (text === '' || text === '-') {
      setText('');
      onChange(0);
    } else {
      const parsed = parseRaw(text);
      setText(formatVal(parsed));
      onChange(parsed);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      id={id}
      name={name}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      onWheel={(e) => e.currentTarget.blur()}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      disabled={disabled}
      aria-label={ariaLabel}
      autoComplete="off"
      className={`${className} appearance-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
    />
  );
};
