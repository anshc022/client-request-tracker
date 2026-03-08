"use client";

import { useState, useMemo } from 'react';
import StatusControl from './StatusControl';

interface ClientRequest {
  id: number;
  content: string;
  category: string;
  status: string;
  created_at: string;
}

interface DashboardProps {
  initialRequests: ClientRequest[];
}

export default function Dashboard({ initialRequests }: DashboardProps) {
  // Filters State
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // Filter & Sort Logic
  const filteredGroups = useMemo(() => {
    let processed = [...initialRequests];

    // 1. Filter
    if (statusFilter.length > 0) {
      processed = processed.filter(r => statusFilter.includes(r.status || 'Pending'));
    }
    if (categoryFilter.length > 0) {
      processed = processed.filter(r => categoryFilter.includes(r.category));
    }

    // 2. Separate Active vs Completed (older than 24h)
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    const groups: Record<string, ClientRequest[]> = {
      'Today': [],
      'Yesterday': [],
      'Older': [],
      'Completed': []
    };

    processed.forEach(req => {
      const createdAt = new Date(req.created_at);
      const isDone = req.status === 'Done';
      const timeDiff = now.getTime() - createdAt.getTime();
      
      // Smart Sorting: "Done" tasks > 24h go to Completed
      if (isDone && timeDiff > oneDayMs) {
        groups['Completed'].push(req);
        return;
      }

      // Date Grouping
      const today = new Date();
      today.setHours(0,0,0,0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const reqDate = new Date(createdAt);
      reqDate.setHours(0,0,0,0);

      if (reqDate.getTime() === today.getTime()) {
        groups['Today'].push(req);
      } else if (reqDate.getTime() === yesterday.getTime()) {
        groups['Yesterday'].push(req);
      } else {
        groups['Older'].push(req);
      }
    });

    // 3. Sort within groups: "Done" tasks to bottom, otherwise new first
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        // Primary: Status (Done at bottom)
        const aDone = a.status === 'Done';
        const bDone = b.status === 'Done';
        if (aDone && !bDone) return 1;
        if (!aDone && bDone) return -1;

        // Secondary: Date (Newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });

    return groups;
  }, [initialRequests, statusFilter, categoryFilter]);

  const toggleFilter = (filter: string[], setFilter: (val: string[]) => void, value: string) => {
    if (filter.includes(value)) {
      setFilter(filter.filter(item => item !== value));
    } else {
      setFilter([...filter, value]);
    }
  };

  const sections = ['Today', 'Yesterday', 'Older', 'Completed'];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
          <div className="space-y-2">
            {['Pending', 'In Progress', 'Done'].map(status => (
              <label key={status} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={statusFilter.includes(status)}
                  onChange={() => toggleFilter(statusFilter, setStatusFilter, status)}
                  className="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition duration-150 ease-in-out"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h3>
          <div className="space-y-2">
            {['Bug', 'Feature', 'Other'].map(cat => (
              <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={categoryFilter.includes(cat)}
                  onChange={() => toggleFilter(categoryFilter, setCategoryFilter, cat)}
                  className="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition duration-150 ease-in-out"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Task List */}
      <div className="flex-1 space-y-8">
        {sections.map(section => {
          const tasks = filteredGroups[section];
          if (tasks.length === 0) return null;

          return (
            <div key={section}>
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                {section} 
                <span className="ml-2 bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full">{tasks.length}</span>
              </h2>
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
                {tasks.map(req => (
                  <div key={req.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors ${req.status === 'Done' ? 'bg-gray-50/50' : ''}`}>
                    
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0
                        ${req.category === 'Bug' ? 'bg-red-400' : 
                          req.category === 'Feature' ? 'bg-purple-400' : 'bg-blue-400'}`} 
                        title={req.category}
                      />
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-mono ${req.status === 'Done' ? 'text-gray-400' : 'text-gray-500'}`}>#{req.id}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border
                             ${req.category === 'Bug' ? 'bg-red-50 text-red-700 border-red-100' : 
                               req.category === 'Feature' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                               'bg-blue-50 text-blue-700 border-blue-100'}`}>
                            {req.category}
                          </span>
                        </div>
                        <p className={`text-sm leading-snug break-words ${req.status === 'Done' ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}>
                          {req.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-auto w-full pl-6 sm:pl-0">
                      <time className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                      <div className="w-32 flex-shrink-0">
                         <StatusControl id={req.id} currentStatus={req.status || 'Pending'} />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {Object.values(filteredGroups).every(g => g.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No tasks match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
