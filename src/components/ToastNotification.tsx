import React from 'react';
import { useStore } from '@nanostores/react';
import { toastStore } from '../stores/toastStore';
import { clsx } from 'clsx';

export default function ToastNotification() {
  const toast = useStore(toastStore);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up">
      <div className={clsx(
        "flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border",
        toast.type === 'success' && "bg-gray-900 text-white border-gray-800",
        toast.type === 'error' && "bg-red-600 text-white border-red-700",
        toast.type === 'info' && "bg-blue-600 text-white border-blue-700"
      )}>
        {toast.type === 'success' && (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
           </svg>
        )}
        <span className="font-medium text-sm">{toast.message}</span>
      </div>
    </div>
  );
}
