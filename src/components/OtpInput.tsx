'use client';

import { useEffect, useRef, useState } from 'react';

interface OtpInputProps {
  length?: number;
  onChange: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}

export default function OtpInput({ length = 6, onChange, onComplete, disabled }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    onChange(digits.join(''));
    if (digits.every((d) => d !== '') && onComplete) {
      onComplete(digits.join(''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  function setDigitAt(index: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleChange(index: number, raw: string) {
    const value = raw.replace(/\D/g, '');
    if (!value) {
      setDigitAt(index, '');
      return;
    }
    // Handle a fast typist or autofill dropping multiple chars into one box
    if (value.length > 1) {
      const chars = value.split('');
      setDigits((prev) => {
        const next = [...prev];
        for (let i = 0; i < chars.length && index + i < length; i++) {
          next[index + i] = chars[i];
        }
        return next;
      });
      const nextIndex = Math.min(index + value.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
      return;
    }
    setDigitAt(index, value);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const chars = pasted.split('');
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < length; i++) {
        next[i] = chars[i] || '';
      }
      return next;
    });
    const focusIndex = Math.min(chars.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div className="flex gap-2 justify-between">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-full aspect-square max-w-12 rounded-xl border border-line bg-white/5 text-center text-xl font-semibold text-fg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-colors disabled:opacity-50"
        />
      ))}
    </div>
  );
}
