
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addRequest } from '@/app/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
    >
      {pending ? 'Submitting...' : 'Submit Request'}
    </button>
  );
}

export default function RequestForm() {
  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}
