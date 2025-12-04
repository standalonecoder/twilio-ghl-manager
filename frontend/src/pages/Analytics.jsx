import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';
import LoadingBanner from '../components/LoadingBanner';
import { 
  Phone,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Loader2,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';

export default function CallAnalytics() {
  const [selectedDays, setSelectedDays] = useState(1); // Changed from 7 to 1 (Today)
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDataUpdated, setShowDataUpdated] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate actual days to fetch based on selection
  const getDaysToFetch = () => {
    if (selectedDays === 'custom') {
      // Calculate days between custom dates
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays || 7;
      }
      return 7; // Default if custom dates not set
    }
    return parseInt(selectedDays);
  };

  // Fetch overview analytics with smart caching
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['call-analytics', getDaysToFetch(), customStartDate, customEndDate],
    queryFn: async () => {
      const response = await analyticsApi.getOverview(getDaysToFetch());
      console.log('Analytics response:', response.data);
      return response.data?.data || response.data;
    },
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes (matching backend)
  });

  // Fetch details for selected number
  const { data: numberDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['number-analytics', selectedNumber?.phoneNumber, selectedDays],
    queryFn: async () => {
      if (!selectedNumber) return null;
      const response = await analyticsApi.getNumberAnalytics(
        encodeURIComponent(selectedNumber.phoneNumber),
        selectedDays
      );
      return response.data?.data || response.data;
    },
    enabled: !!selectedNumber,
  });

  // Show "Data updated" banner for 3 seconds after refresh
  useEffect(() => {
    if (!isFetching && dataUpdatedAt) {
      setShowDataUpdated(true);
      const timer = setTimeout(() => setShowDataUpdated(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFetching, dataUpdatedAt]);

  // Show error only if no data at all
  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading analytics: {error.message}</p>
        <p className="text-sm text-red-600 mt-2">Make sure your Twilio account has call logs.</p>
      </div>
    );
  }

  const numbers = data?.numbers || [];
  const summary = data?.summary || {};

  // Helper to determine role
  const getNumberRole = (phoneNumber) => {
    if (phoneNumber.includes('510')) return 'setter';
    if (phoneNumber.includes('650')) return 'closer';
    return 'state';
  };

  // Filter by role
  const setters = numbers.filter(n => getNumberRole(n.phoneNumber) === 'setter');
  const closers = numbers.filter(n => getNumberRole(n.phoneNumber) === 'closer');
  const states = numbers.filter(n => getNumberRole(n.phoneNumber) === 'state');

  // Get high-risk numbers (spam flagged)
  const highRiskNumbers = numbers.filter(n => n.spamRisk === 'high');

  return (
    <div className="space-y-6">
      {/* Loading Banner - shows while keeping data visible */}
      <LoadingBanner 
        isLoading={isLoading && !data}
        isFetching={isFetching}
        isError={!!error}
        lastUpdated={showDataUpdated}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Call Performance Analytics</h2>
          <p className="mt-2 text-gray-600">Track call success rates and identify spam-flagged numbers</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={selectedDays}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'custom') {
                setShowCustomDate(true);
                setSelectedDays('custom');
              } else {
                setShowCustomDate(false);
                setSelectedDays(parseInt(value)); // Parse to number
              }
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Today</option>
            <option value={2}>Yesterday</option>
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {/* Custom Date Range Inputs */}
          {showCustomDate && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Start Date"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="End Date"
              />
            </div>
          )}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Spam Detection Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-blue-900">
              📊 How Spam Detection Works
            </h3>
            <p className="text-sm text-blue-800 mt-1">
              Numbers are flagged based on <strong>answer rate</strong> (completed calls ÷ total calls):
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                <span className="text-blue-900"><strong>High Risk (Spam):</strong> Answer rate &lt; 30% with 10+ calls → Likely flagged by carriers</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                <span className="text-blue-900"><strong>Medium Risk (Warning):</strong> Answer rate 30-50% → Monitor closely</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-blue-900"><strong>Good:</strong> Answer rate &gt; 50% → Healthy number</span>
              </div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              <strong>Note:</strong> "No Answer" includes busy signals, voicemail, and connection failures. Failed calls may indicate carrier blocking.
            </p>
          </div>
        </div>
      </div>

      {/* Alert for High-Risk Numbers */}
      {highRiskNumbers.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800">
                ⚠️ {highRiskNumbers.length} Number{highRiskNumbers.length > 1 ? 's' : ''} Flagged as High Risk
              </h3>
              <p className="text-sm text-red-700 mt-1">
                These numbers have answer rates below 30% and may be marked as spam. Consider replacing them to improve pickup rates.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {highRiskNumbers.slice(0, 5).map(n => (
                  <span key={n.phoneNumber} className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                    {n.phoneNumber} ({n.answerRate}%)
                  </span>
                ))}
                {highRiskNumbers.length > 5 && (
                  <span className="text-xs text-red-600">+{highRiskNumbers.length - 5} more</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning: Hit Call Limit */}
      {summary.hitLimit && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div className="ml-3">
              <h3 className="text-sm font-bold text-yellow-800">
                📊 Call Data Limited
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Showing 20,000 most recent calls. Your account has more calls than displayed. 
                To see all data, reduce the time range or contact support to increase the limit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Calls */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Calls</p>
              <p className="text-4xl font-bold mt-2">{summary.totalCalls || 0}</p>
              <p className="text-blue-100 text-xs mt-2">
                {typeof data?.period === 'string' ? data.period : `${selectedDays} days`}
              </p>
            </div>
            <Activity className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        {/* High Risk Numbers */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">High Risk (Spam)</p>
              <p className="text-4xl font-bold mt-2">{summary.highRiskNumbers || 0}</p>
              <p className="text-red-100 text-xs mt-2">Answer rate &lt; 30%</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-200 opacity-80" />
          </div>
        </div>

        {/* Medium Risk */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Medium Risk</p>
              <p className="text-4xl font-bold mt-2">{summary.mediumRiskNumbers || 0}</p>
              <p className="text-yellow-100 text-xs mt-2">Answer rate 30-50%</p>
            </div>
            <TrendingDown className="h-12 w-12 text-yellow-200 opacity-80" />
          </div>
        </div>

        {/* Good Numbers */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Good Numbers</p>
              <p className="text-4xl font-bold mt-2">{summary.goodNumbers || 0}</p>
              <p className="text-green-100 text-xs mt-2">Answer rate &gt; 50%</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Performance by Role */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setters */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Setters (510)</h3>
            <span className="text-2xl font-bold text-purple-600">{setters.length}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">High Risk:</span>
              <span className="font-bold text-red-600">
                {setters.filter(n => n.spamRisk === 'high').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Calls:</span>
              <span className="font-bold text-gray-900">
                {setters.reduce((sum, n) => sum + n.totalCalls, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Closers */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Closers (650)</h3>
            <span className="text-2xl font-bold text-orange-600">{closers.length}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">High Risk:</span>
              <span className="font-bold text-red-600">
                {closers.filter(n => n.spamRisk === 'high').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Calls:</span>
              <span className="font-bold text-gray-900">
                {closers.reduce((sum, n) => sum + n.totalCalls, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* State Numbers */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">State Numbers</h3>
            <span className="text-2xl font-bold text-indigo-600">{states.length}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">High Risk:</span>
              <span className="font-bold text-red-600">
                {states.filter(n => n.spamRisk === 'high').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total Calls:</span>
              <span className="font-bold text-gray-900">
                {states.reduce((sum, n) => sum + n.totalCalls, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Number Performance Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Number Performance Details</h3>
          <p className="text-sm text-gray-600 mt-1">Sorted by spam risk (high risk first)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Calls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Answered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No Answer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Answer Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {numbers.map((number) => {
                const role = getNumberRole(number.phoneNumber);
                const roleColors = {
                  setter: 'bg-purple-100 text-purple-700',
                  closer: 'bg-orange-100 text-orange-700',
                  state: 'bg-indigo-100 text-indigo-700'
                };
                const roleLabels = {
                  setter: 'Setter',
                  closer: 'Closer',
                  state: 'State'
                };

                return (
                  <tr key={number.phoneNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-mono text-sm font-medium text-gray-900">
                          {number.phoneNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {number.friendlyName || 'No name'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${roleColors[role]}`}>
                        {roleLabels[role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {number.totalCalls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {number.completedCalls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                      {number.noAnswerCalls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {number.failedCalls}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-bold ${
                          number.answerRate >= 50 ? 'text-green-600' :
                          number.answerRate >= 30 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {number.answerRate}%
                        </span>
                        {number.answerRate >= 50 ? (
                          <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-400" />
                        {number.avgDuration}s
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {number.spamRisk === 'high' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          High Risk
                        </span>
                      )}
                      {number.spamRisk === 'medium' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠️ Warning
                        </span>
                      )}
                      {number.spamRisk === 'good' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Good
                        </span>
                      )}
                      {number.spamRisk === 'no-data' && (
                        <span className="text-xs text-gray-400">No data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedNumber(number);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {number.spamRisk === 'high' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Replace ${number.phoneNumber}?\n\nThis number has low answer rate (${number.answerRate}%) and may be spam-flagged. Consider releasing it and purchasing a new one.`)) {
                                // TODO: Implement release
                                alert('Release functionality coming soon!');
                              }
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Replace Number"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {numbers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No call data available for the selected period.</p>
              <p className="text-sm mt-2">Make some calls from your Twilio numbers to see analytics here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Insights & Recommendations */}
      {numbers.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights & Recommendations</h3>
          <div className="space-y-2 text-sm text-gray-700">
            {highRiskNumbers.length > 0 && (
              <p>
                • <strong className="text-red-600">{highRiskNumbers.length} numbers are flagged as high risk</strong> with answer rates below 30%. 
                Consider replacing these numbers to improve your pickup rate.
              </p>
            )}
            {summary.mediumRiskNumbers > 0 && (
              <p>
                • <strong className="text-yellow-600">{summary.mediumRiskNumbers} numbers show warning signs</strong> with answer rates between 30-50%. 
                Monitor these closely.
              </p>
            )}
            {summary.goodNumbers > 0 && (
              <p>
                • <strong className="text-green-600">{summary.goodNumbers} numbers are performing well</strong> with answer rates above 50%. 
                Keep using these!
              </p>
            )}
            {summary.noDataNumbers > 0 && (
              <p>
                • <strong>{summary.noDataNumbers} numbers have no call data</strong> in the selected period. 
                Start using them to track performance.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedNumber.phoneNumber}</h3>
                  <p className="text-sm text-gray-600">{selectedNumber.friendlyName || 'No name'}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-xs text-blue-600 font-medium">Total Calls</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{numberDetails?.totalCalls || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs text-green-600 font-medium">Answered</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{numberDetails?.completedCalls || 0}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-xs text-yellow-600 font-medium">Answer Rate</p>
                      <p className="text-2xl font-bold text-yellow-900 mt-1">{numberDetails?.answerRate || 0}%</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-xs text-purple-600 font-medium">Avg Duration</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">{numberDetails?.avgDuration || 0}s</p>
                    </div>
                  </div>

                  {/* Recent Calls */}
                  {numberDetails?.calls && numberDetails.calls.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Recent Calls</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {numberDetails.calls.map((call, idx) => (
                          <div key={call.sid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-mono text-sm text-gray-900">To: {call.to}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(call.startTime).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                call.status === 'completed' && call.duration > 0
                                  ? 'bg-green-100 text-green-800'
                                  : call.status === 'no-answer'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {call.status}
                              </span>
                              <span className="text-sm text-gray-600">{call.duration}s</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}