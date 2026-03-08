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

  const statuses = ['Pending', 'In Progress', 'Done'];

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
    <div className="flex bg-gray-100 rounded-md p-0.5 space-x-0.5">
      {statuses.map((s) => (
        <button
          key={s}
          onClick={() => handleStatusChange(s)}
          disabled={loading}
          className={`
            px-2 py-1 text-xs font-medium rounded-sm transition-all
            ${status === s 
              ? 'bg-white text-indigo-700 shadow-sm border border-gray-200' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {s === 'In Progress' ? 'Active' : s}
        </button>
      ))}
    </div>
  );
}
