"use client";

import { useState } from 'react';
import { updateStatus } from '../app/actions';

interface StatusControlProps {
  id: number;
  currentStatus: string;
}

export default function StatusControl({ id, currentStatus }: StatusControlProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  // Map backend status strings to display labels
  const statuses = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' }
  ];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    
    setLoading(true);
    try {
      await updateStatus(id, newStatus);
      setStatus(newStatus);
    } catch (e) {
      console.error("Failed to update status", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-100 rounded-md p-1 gap-1">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() => handleStatusChange(s.value)}
          disabled={loading}
          className={`
            px-2 py-1 text-[10px] font-medium rounded transition-all flex-1
            ${status === s.value 
              ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}
            ${loading ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
