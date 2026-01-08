import { atom } from 'nanostores';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export const toastStore = atom<ToastMessage | null>(null);

let timeoutId: NodeJS.Timeout;

export function showToast(message: string, type: ToastType = 'success') {
  const id = Date.now();
  toastStore.set({ id, message, type });

  if (timeoutId) clearTimeout(timeoutId);
  
  timeoutId = setTimeout(() => {
    toastStore.set(null);
  }, 3000);
}
