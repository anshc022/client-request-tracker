import React from 'react';

interface StatusBadgeProps {
  isConnected: boolean;
  errorMessage?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isConnected, errorMessage }) => {
  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm border ${
      isConnected 
        ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200' 
        : 'bg-red-50/80 text-red-700 border-red-200'
    }`}
    title={errorMessage || (isConnected ? 'Database Connected' : 'Disconnected')}
    >
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
      <span>{isConnected ? 'Database Connected' : 'Database Error'}</span>
    </div>
  );
};
