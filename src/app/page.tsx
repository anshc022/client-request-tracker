import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Interface for type safety
interface ClientRequest {
  id: number;
  content: string;
  category: string;
  status: string;
  created_at: string;
}

export default async function Home() {
  // Ensure table exists on first load (simplified migration)
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS client_requests (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        category TEXT,
        status TEXT DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    console.error("Table creation failed (might already exist or connection issue):", e);
  }

  // Fetch requests
  let requests: ClientRequest[] = [];
  try {
    const result = await query('SELECT * FROM client_requests ORDER BY created_at DESC');
    requests = result.rows;
  } catch (e) {
    console.error("Failed to fetch requests:", e);
    // Graceful fallback for UI
  }

  // Server Action for adding requests
  async function addRequest(formData: FormData) {
    'use server';
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    
    if (content && category) {
      try {
        await query(
          'INSERT INTO client_requests (content, category, status) VALUES ($1, $2, $3)',
          [content, category, 'New']
        );
        revalidatePath('/');
      } catch (e) {
        console.error("Failed to add request:", e);
      }
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="border-b pb-4 border-gray-200">
          <h1 className="text-3xl font-bold text-indigo-700">Client Request Tracker</h1>
          <p className="text-gray-500 mt-1">Manage and track incoming client requests efficiently.</p>
        </header>

        {/* Add Request Form */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-l-4 border-indigo-500 pl-3">Add New Request</h2>
          <form action={addRequest} className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Request Details</label>
              <textarea 
                name="content" 
                id="content"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                rows={3}
                placeholder="Describe what the client needs..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  name="category" 
                  id="category"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                >
                  <option value="Feature">Feature Request</option>
                  <option value="Bug">Bug Report</option>
                  <option value="Support">Support Ticket</option>
                  <option value="Inquiry">General Inquiry</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </form>
        </section>

        {/* Request List */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-700">Recent Requests</h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{requests.length} items</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Content</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">#{req.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{req.content}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${req.category === 'Bug' ? 'bg-red-100 text-red-800' : 
                            req.category === 'Feature' ? 'bg-purple-100 text-purple-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {req.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.status === 'New' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 bg-gray-50">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <p className="text-lg">No requests found</p>
                        <p className="text-xs text-gray-400">Add a new request using the form above to get started.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}
