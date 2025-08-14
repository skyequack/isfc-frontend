'use client'

import { useState } from 'react'

interface QueryResult {
  [key: string]: unknown;
}

export default function SQLPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<QueryResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const executeQuery = async () => {
    try {
      const response = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setResult(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setResult(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">SQL Query Interface</h1>
      
      <div className="space-y-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-40 p-4 bg-gray-800 text-gray-100 font-mono border border-gray-600 rounded-lg"
          placeholder="Enter your SQL query..."
          spellCheck="false"
        />
        
        <button
          onClick={executeQuery}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Execute Query
        </button>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {Object.keys(result[0] || {}).map((key) => (
                    <th key={key} className="p-4 bg-gray-50 border-b">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.map((row: QueryResult, i: number) => (
                  <tr key={i}>
                    {Object.values(row).map((value: unknown, j: number) => (
                      <td key={j} className="p-4 border-b">
                        {JSON.stringify(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
