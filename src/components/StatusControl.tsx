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
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'Done', label: 'Done', color: 'bg-green-100 text-green-800' }
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
    <div className="flex bg-gray-50 rounded-md p-1 gap-1 border border-gray-100">
      {statuses.map((s) => {
        const isActive = status === s.value;
        return (
          <button
            key={s.value}
            onClick={() => handleStatusChange(s.value)}
            disabled={loading}
            className={`
              px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide rounded-md transition-all flex-1
              ${isActive 
                ? `${s.color} shadow-sm ring-1 ring-black/5` 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
              ${loading ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
