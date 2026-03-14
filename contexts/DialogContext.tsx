import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface DialogContextType {
  confirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  prompt: (message: string, defaultValue: string, onConfirm: (value: string) => void, onCancel?: () => void) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<{
    type: 'confirm' | 'prompt';
    message: string;
    defaultValue?: string;
    onConfirm: (value?: string) => void;
    onCancel?: () => void;
  } | null>(null);

  const [inputValue, setInputValue] = useState('');

  const confirm = useCallback((message: string, onConfirm: () => void, onCancel?: () => void) => {
    setDialog({ type: 'confirm', message, onConfirm, onCancel });
  }, []);

  const prompt = useCallback((message: string, defaultValue: string, onConfirm: (value: string) => void, onCancel?: () => void) => {
    setInputValue(defaultValue);
    setDialog({ type: 'prompt', message, defaultValue, onConfirm, onCancel });
  }, []);

  const handleConfirm = () => {
    if (dialog) {
      if (dialog.type === 'prompt') {
        dialog.onConfirm(inputValue);
      } else {
        dialog.onConfirm();
      }
      setDialog(null);
    }
  };

  const handleCancel = () => {
    if (dialog && dialog.onCancel) {
      dialog.onCancel();
    }
    setDialog(null);
  };

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-4">{dialog.type === 'confirm' ? 'Confirm Action' : 'Input Required'}</h3>
            <p className="text-zinc-300 mb-6">{dialog.message}</p>
            
            {dialog.type === 'prompt' && (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white mb-6 focus:outline-none focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                  if (e.key === 'Escape') handleCancel();
                }}
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all"
              >
                {dialog.type === 'confirm' ? 'Confirm' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
