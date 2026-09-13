'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function handle(result: boolean) {
    setOptions(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div
          className="fixed inset-0 z-[110] bg-black/70 flex items-end sm:items-center justify-center"
          onClick={() => handle(false)}
        >
          <div
            className="bg-paper border border-line rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-bold text-fg mb-2">{options.title}</h2>
            {options.description && (
              <p className="text-sm text-muted leading-relaxed mb-6">{options.description}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => handle(false)}
                className="flex-1 bg-mist border border-line text-fg text-sm font-semibold rounded-xl py-3 active:scale-[0.98] transition-transform"
              >
                {options.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={() => handle(true)}
                className={`flex-1 text-sm font-semibold rounded-xl py-3 active:scale-[0.98] transition-transform ${
                  options.danger ? 'bg-red-500 text-white' : 'bg-blue text-black'
                }`}
              >
                {options.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
