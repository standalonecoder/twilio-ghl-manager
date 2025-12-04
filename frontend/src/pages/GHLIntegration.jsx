import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { numbersApi } from '../services/api';
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Phone
} from 'lucide-react';

export default function GHLIntegration() {
  const [copiedNumber, setCopiedNumber] = useState(null);

  // Fetch numbers with GHL status
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['numbers-with-ghl-status'],
    queryFn: async () => {
      const response = await numbersApi.getNumbersWithGHLStatus();
      return response.data;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const numbers = data?.numbers || [];
  const summary = data?.summary || { total: 0, inGHL: 0, notInGHL: 0 };

  // Filter numbers not in GHL
  const numbersNotInGHL = numbers.filter(n => !n.inGHL);
  const numbersInGHL = numbers.filter(n => n.inGHL);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading sync status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading sync status: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">GHL Integration</h2>
          <p className="mt-2 text-gray-600">Sync status and manual sync workflow</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Numbers</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
              <p className="mt-1 text-xs text-gray-500">In Twilio account</p>
            </div>
            <Phone className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Synced to GHL</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{summary.inGHL}</p>
              <p className="mt-1 text-xs text-gray-500">
                {summary.total > 0 ? `${Math.round((summary.inGHL / summary.total) * 100)}% synced` : '0% synced'}
              </p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Need Manual Sync</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{summary.notInGHL}</p>
              <p className="mt-1 text-xs text-gray-500">Not yet in GHL</p>
            </div>
            <XCircle className="h-12 w-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Alert Box if numbers need syncing */}
      {summary.notInGHL > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Action Required: {summary.notInGHL} number{summary.notInGHL > 1 ? 's' : ''} need{summary.notInGHL === 1 ? 's' : ''} to be added to GHL
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                These numbers are in Twilio but not in GoHighLevel. Follow the manual sync instructions below to add them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success message if all synced */}
      {summary.notInGHL === 0 && summary.total > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                All numbers synced! ✅
              </h3>
              <p className="mt-2 text-sm text-green-700">
                All {summary.total} Twilio numbers are present in GoHighLevel.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Sync Instructions */}
      {summary.notInGHL > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              Manual Sync Instructions
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 mb-4">
                Since GHL API doesn't support automatic number addition, follow these steps to manually add numbers:
              </p>
              
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold mr-3 mt-0.5">1</span>
                  <div>
                    <span className="font-medium">Open GHL Phone System</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Go to <a href="https://app.gohighlevel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                        GoHighLevel Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                      </a> → Settings → Phone Numbers
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold mr-3 mt-0.5">2</span>
                  <div>
                    <span className="font-medium">Add Each Number</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Click "Add Number" and enter each number from the list below. Use the copy button for easy pasting.
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold mr-3 mt-0.5">3</span>
                  <div>
                    <span className="font-medium">Verify Sync</span>
                    <p className="text-sm text-gray-600 mt-1">
                      After adding numbers in GHL, click "Refresh Status" button above to verify they appear as synced.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Numbers NOT in GHL */}
      {numbersNotInGHL.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              Numbers Missing from GHL ({numbersNotInGHL.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              These numbers need to be manually added to GoHighLevel
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Friendly Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {numbersNotInGHL.map((number) => (
                  <tr key={number.sid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {number.phoneNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {number.friendlyName || 'No name'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => copyToClipboard(number.phoneNumber)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        {copiedNumber === number.phoneNumber ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Numbers IN GHL (Success List) */}
      {numbersInGHL.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              Successfully Synced to GHL ({numbersInGHL.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              These numbers are present in both Twilio and GoHighLevel
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {numbersInGHL.map((number) => (
                <div
                  key={number.sid}
                  className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium text-gray-900 truncate">
                      {number.phoneNumber}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {number.friendlyName || 'No friendly name'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last checked: {new Date().toLocaleString()} • Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}