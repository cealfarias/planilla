import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-item ${toast.type || 'success'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {toast.type === 'error' ? <AlertCircle size={20} /> :
             toast.type === 'info' ? <Info size={20} /> : <CheckCircle size={20} />}
            <span>{toast.message}</span>
          </div>
          <button 
            onClick={() => removeToast(toast.id)}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, padding: 0 }}
          >
            <X size={16} />
          </button>
          <div className="toast-progress" />
        </div>
      ))}
    </div>
  );
}
