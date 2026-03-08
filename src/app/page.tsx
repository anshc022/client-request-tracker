import { query } from '@/lib/db';
import RequestForm from '@/components/RequestForm';

// Interface for type safety
interface ClientRequest {
  id: number;
  content: string;
  category: string;
  status: string;
  created_at: string;
}

export default async function Home() {
  // Fetch requests
  let requests: ClientRequest[] = [];
  try {
    // Attempt to create table if it doesn't exist (for fresh deployments)
    await query(`
      CREATE TABLE IF NOT EXISTS client_requests (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        category TEXT,
        status TEXT DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const result = await query('SELECT * FROM client_requests ORDER BY created_at DESC');
    requests = result.rows;
  } catch (e) {
    console.error("Failed to fetch requests or init table:", e);
    // Graceful fallback for UI
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="pb-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-bold text-indigo-700 tracking-tight">Client Request Tracker</h1>
                <p className="text-gray-500 mt-2 text-sm">Centralized dashboard for managing client feedback and tasks.</p>
             </div>
             <div className="hidden sm:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Beta v1.0
                </span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <RequestForm />
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-700">Recent Requests</h2>
                <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-sm">
                  {requests.length} items
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full">Details</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.length > 0 ? (
                      requests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">#{req.id}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium mb-1">{req.content}</div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                               <span className={`px-2 py-0.5 rounded-sm bg-gray-100 border border-gray-200 font-medium
                                ${req.category === 'Bug' ? 'text-red-700 bg-red-50 border-red-100' : 
                                  req.category === 'Feature' ? 'text-purple-700 bg-purple-50 border-purple-100' : 
                                  'text-blue-700 bg-blue-50 border-blue-100'}`}>
                                {req.category}
                               </span>
                               <span>&bull;</span>
                               <time dateTime={req.created_at}>{new Date(req.created_at).toLocaleDateString()}</time>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              req.status === 'New' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500 bg-gray-50">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <p className="text-gray-900 font-medium">No requests found</p>
                            <p className="text-gray-500">Get started by creating a new request.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

      </div>
    </main>
  );
}
