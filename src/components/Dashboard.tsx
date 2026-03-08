"use client";

import { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Filter, 
  Inbox, 
  Layout, 
  Search, 
  Settings,
  MoreHorizontal,
  ArrowUpRight,
  Menu,
  X
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Status rotation logic
  const rotateStatus = async (current: string, id: number) => {
    const map: Record<string, string> = {
      'Pending': 'In Progress',
      'In Progress': 'Done',
      'Done': 'Pending'
    };
    const next = map[current] || 'Pending';
    
    // Optimistic update would go here in a real app
    // For now we just reload to reflect DB state changes managed by parent/server actions
    // But since this component receives props, we'd ideally need a server action passed down
    // For this implementation, we'll assume the parent handles data refreshment or we'd add an API call here.
    
    try {
      await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: next })
      });
      window.location.reload(); 
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredRequests = useMemo(() => {
    let data = [...initialRequests];

    // 1. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(r => 
        r.content.toLowerCase().includes(q) || 
        r.id.toString().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    }

    // 2. Tab Filter
    if (activeTab === 'Inbox') {
       // Show all non-done
       data = data.filter(r => r.status !== 'Done');
    } else if (activeTab === 'Active') {
       data = data.filter(r => r.status === 'In Progress' || r.status === 'Pending');
    } else if (activeTab === 'Done') {
       data = data.filter(r => r.status === 'Done');
    }

    // 3. Sort
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [initialRequests, activeTab, searchQuery]);

  const StatusIcon = ({ status, className = "" }: { status: string, className?: string }) => {
    if (status === 'Done') return <CheckCircle2 className={`w-4 h-4 text-indigo-500 ${className}`} />;
    if (status === 'In Progress') return <Clock className={`w-4 h-4 text-orange-500 ${className}`} />;
    return <Circle className={`w-4 h-4 text-gray-400 ${className}`} />;
  };

  const CategoryBadge = ({ category }: { category: string }) => {
    const styles = {
      'Bug': 'bg-red-100 text-red-700 border-red-200',
      'Feature': 'bg-purple-100 text-purple-700 border-purple-200',
      'Other': 'bg-gray-100 text-gray-700 border-gray-200'
    }[category] || 'bg-gray-100 text-gray-700 border-gray-200';

    return (
      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded border ${styles}`}>
        {category}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#1A1C1E] text-gray-400 border-r border-gray-800">
        <div className="p-4 flex items-center gap-3 border-b border-gray-800/50">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <span className="text-gray-100 font-semibold tracking-tight">LinearTrack</span>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          <button 
            onClick={() => setActiveTab('Inbox')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${activeTab === 'Inbox' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-gray-200'}`}
          >
            <Inbox className="w-4 h-4" />
            Inbox
          </button>
          <button 
            onClick={() => setActiveTab('Active')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${activeTab === 'Active' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-gray-200'}`}
          >
            <Layout className="w-4 h-4" />
            Active
          </button>
          <button 
            onClick={() => setActiveTab('Done')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
            ${activeTab === 'Done' ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-gray-200'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Done
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800/50">
          <button className="flex items-center gap-3 text-sm font-medium hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#1A1C1E] z-50 flex items-center justify-between px-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-white text-xs font-bold">L</div>
          <span className="text-white font-semibold">LinearTrack</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-400">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm pt-14">
          <div className="bg-[#1A1C1E] p-4 space-y-2 border-b border-gray-800 text-gray-300">
            {['Inbox', 'Active', 'Done'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-md font-medium ${activeTab === tab ? 'bg-white/10 text-white' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 md:bg-white bg-gray-50 pt-14 md:pt-0">
        
        {/* Header */}
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-sm font-semibold text-gray-900 hidden md:block">{activeTab}</h1>
            <div className="h-4 w-px bg-gray-200 hidden md:block"></div>
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border-transparent rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="border-b border-gray-100">
              {filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Inbox className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">No requests found</p>
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <div 
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="group flex items-center gap-3 px-4 md:px-6 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); rotateStatus(req.status, req.id); }}
                      className="flex-shrink-0 hover:scale-110 transition-transform"
                    >
                      <StatusIcon status={req.status} />
                    </button>
                    
                    <span className="text-xs font-mono text-gray-400 w-10 shrink-0">#{req.id}</span>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate pr-4 ${req.status === 'Done' ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-900 font-medium'}`}>
                        {req.content}
                      </p>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      <CategoryBadge category={req.category} />
                      <span className="text-xs text-gray-400 w-16 text-right">
                        {new Date(req.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Side Sheet Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={() => setSelectedRequest(null)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            
            {/* Modal Header */}
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6">
              <div className="flex items-center gap-3 text-gray-500">
                <span className="font-mono text-xs">#{selectedRequest.id}</span>
                <span className="text-gray-300">/</span>
                <span className="text-xs font-medium uppercase tracking-wide">{selectedRequest.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-snug">
                {selectedRequest.content}
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <button 
                    onClick={() => rotateStatus(selectedRequest.status, selectedRequest.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-sm hover:border-gray-300 transition-colors"
                  >
                    <StatusIcon status={selectedRequest.status} />
                    <span className="font-medium">{selectedRequest.status || 'Pending'}</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedRequest.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="pt-8">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Description</h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed">
                    No additional description provided.
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-400">
              <span>Press ESC to close</span>
              <button className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                Open full view <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around z-30 pb-safe">
        <button onClick={() => setActiveTab('Inbox')} className={`flex flex-col items-center gap-1 ${activeTab === 'Inbox' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Inbox className="w-5 h-5" />
          <span className="text-[10px] font-medium">Inbox</span>
        </button>
        <button onClick={() => setActiveTab('Active')} className={`flex flex-col items-center gap-1 ${activeTab === 'Active' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <Layout className="w-5 h-5" />
          <span className="text-[10px] font-medium">Active</span>
        </button>
        <button onClick={() => setActiveTab('Done')} className={`flex flex-col items-center gap-1 ${activeTab === 'Done' ? 'text-indigo-600' : 'text-gray-400'}`}>
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Done</span>
        </button>
      </div>
    </div>
  );
}
