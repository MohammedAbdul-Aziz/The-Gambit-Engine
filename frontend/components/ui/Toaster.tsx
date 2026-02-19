
import { Toaster as RadToaster } from 'sonner';

export function Toaster() {
  return (
    <RadToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#f0f0f0',
          border: '1px solid #3a3a3a',
        },
      }}
    />
  );
}
