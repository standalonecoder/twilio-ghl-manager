import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';
import LoadingBanner from '../components/LoadingBanner';
import { 
  Users,
  Trophy,
  TrendingUp,
  Phone,
  Loader2,
  RefreshCw,
  Calendar,
  Target,
  Activity,
  Eye,
  X,
  Clock
} from 'lucide-react';

export default function SetterPerformance() {
  const [selectedDays, setSelectedDays] = useState(1); // Changed from 7 to 1 (Today)
  const [selectedSetter, setSelectedSetter] = useState(null);
  const [showCallsModal, setShowCallsModal] = useState(false);
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

  const queryClient = useQueryClient();

  // Clear old cache on mount to ensure fresh default
  useEffect(() => {
    // Only clear cache for non-Today values
    queryClient.removeQueries({ queryKey: ['setter-performance', 7] });
    queryClient.removeQueries({ queryKey: ['setter-performance', 14] });
    queryClient.removeQueries({ queryKey: ['setter-performance', 30] });
  }, []); // Run once on mount

  // Fetch setter performance with smart caching
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['setter-performance', getDaysToFetch(), customStartDate, customEndDate],
    queryFn: async () => {
      const response = await analyticsApi.getSetterPerformance(getDaysToFetch());
      console.log('Setter performance response:', response.data);
      return response.data?.data || response.data;
    },
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes (matching backend cache)
  });

  // Fetch individual setter's calls when modal is open
  const { data: setterCalls, isLoading: callsLoading } = useQuery({
    queryKey: ['setter-calls', selectedSetter?.userId, selectedDays],
    queryFn: async () => {
      if (!selectedSetter) return null;
      
      // Get all calls and filter by setter's numbers
      const response = await analyticsApi.getCalls({
        limit: 5000
      });
      
      const allCalls = response.data.calls || [];
      
      // Filter calls made by this setter's numbers
      // We need to match calls.from to numbers assigned to this setter
      return allCalls.filter(call => {
        // This is a simplified version - in production you'd match against setter's assigned numbers
        return true; // For now, return all calls - you'll need to implement proper filtering
      });
    },
    enabled: !!selectedSetter && showCallsModal,
  });

  // Show "Data updated" banner for 3 seconds after refresh
  useEffect(() => {
    if (!isFetching && dataUpdatedAt) {
      setShowDataUpdated(true);
      const timer = setTimeout(() => setShowDataUpdated(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isFetching, dataUpdatedAt]);

  // Show error if no data at all
  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading setter performance: {error.message}</p>
      </div>
    );
  }

  const setters = data?.setters || [];
  const summary = data?.summary || {};

  // Get top performer (most calls)
  const topPerformer = setters.length > 0 ? setters[0] : null;
  
  // Get top closer (most bookings)
  const topCloser = setters.length > 0 
    ? [...setters].sort((a, b) => b.bookings - a.bookings)[0]
    : null;

  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0];

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
          <h2 className="text-3xl font-bold text-gray-900">Setter Performance</h2>
          <p className="mt-2 text-gray-600">Track individual setter dial activity and performance</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Setters */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Active Setters</p>
              <p className="text-4xl font-bold mt-2">{summary.totalSetters || 0}</p>
              <p className="text-blue-100 text-xs mt-2">
                {selectedDays === 1 ? 'Today' : 
                 selectedDays === 2 ? 'Yesterday' :
                 selectedDays === 'custom' ? 'Custom Range' :
                 `Last ${selectedDays} days`}
              </p>
            </div>
            <Users className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        {/* Total Calls */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Calls</p>
              <p className="text-4xl font-bold mt-2">{summary.totalCalls?.toLocaleString() || 0}</p>
              <p className="text-green-100 text-xs mt-2">All setters combined</p>
            </div>
            <Phone className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </div>

        {/* Avg Calls Per Setter */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Per Setter</p>
              <p className="text-4xl font-bold mt-2">{summary.avgCallsPerSetter || 0}</p>
              <p className="text-purple-100 text-xs mt-2">calls per setter</p>
            </div>
            <Target className="h-12 w-12 text-purple-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Top Performer Highlight */}
      {topPerformer && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg p-6">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500 mr-4" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">🏆 Top Performer</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-bold text-yellow-700">{topPerformer.userName}</span> is leading with{' '}
                <span className="font-bold">{topPerformer.totalCalls} calls</span>{' '}
                ({topPerformer.answerRate}% answer rate)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Closer Highlight - Most Bookings */}
      {topCloser && topCloser.bookings > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-500 mr-4" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">🎯 Most Bookings</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-bold text-green-700">{topCloser.userName}</span> has booked{' '}
                <span className="font-bold">{topCloser.bookings} appointments</span>{' '}
                ({topCloser.conversionRate}% conversion rate)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Setter Performance Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Setter Leaderboard</h3>
          <p className="text-sm text-gray-600 mt-1">Ranked by total dial count</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Setter Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Dials
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Own Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State Numbers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Answer Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {setters.map((setter, index) => {
                const isTopPerformer = index === 0;
                const rank = index + 1;
                const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

                // Get today's calls for this setter
                const todaysCalls = setter.callsByDay?.[today] || 0;

                return (
                  <tr 
                    key={setter.userId} 
                    className={`hover:bg-gray-50 ${isTopPerformer ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{medalEmoji || `#${rank}`}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-gray-900">{setter.userName}</p>
                        <p className="text-xs text-gray-500">{setter.email}</p>
                        {selectedDays > 1 && todaysCalls > 0 && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            📅 {todaysCalls} calls today
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-lg font-bold text-gray-900">{setter.totalCalls}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">{setter.ownNumberCalls}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {setter.totalCalls > 0 ? Math.round((setter.ownNumberCalls / setter.totalCalls) * 100) : 0}%
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-gray-700">{setter.stateNumberCalls}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {setter.totalCalls > 0 ? Math.round((setter.stateNumberCalls / setter.totalCalls) * 100) : 0}%
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">{setter.completedCalls}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-bold ${
                          setter.answerRate >= 50 ? 'text-green-600' :
                          setter.answerRate >= 30 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {setter.answerRate}%
                        </span>
                        {setter.answerRate >= 50 && (
                          <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-bold text-yellow-700">{setter.bookings || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        (setter.conversionRate || 0) >= 10 ? 'text-green-600' :
                        (setter.conversionRate || 0) >= 5 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {setter.conversionRate || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{setter.avgDuration}s</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedSetter(setter);
                          setShowCallsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View call details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {setters.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No setter activity found for the selected period.</p>
              <p className="text-sm mt-2">Make sure numbers are assigned to GHL users.</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Breakdown for Top 6 Setters */}
      {setters.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Daily Dial Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {setters.slice(0, 6).map((setter) => {
              const days = Object.keys(setter.callsByDay || {}).sort().reverse();
              
              return (
                <div key={setter.userId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">{setter.userName}</h4>
                  <div className="space-y-2">
                    {days.slice(0, 7).map(day => {
                      const isToday = day === today;
                      return (
                        <div key={day} className={`flex items-center justify-between text-sm ${isToday ? 'bg-blue-100 px-2 py-1 rounded' : ''}`}>
                          <span className={`${isToday ? 'font-bold text-blue-900' : 'text-gray-600'}`}>
                            {isToday ? '📅 Today' : new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {setter.callsByDay[day]} calls
                          </span>
                        </div>
                      );
                    })}
                    {days.length === 0 && (
                      <p className="text-xs text-gray-400">No daily data available</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      {setters.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Performance Insights</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              • <strong>{setters.filter(s => s.answerRate >= 50).length} setters</strong> have answer rates above 50%
            </p>
            <p>
              • <strong>{topPerformer.userName}</strong> is your top performer with {topPerformer.totalCalls} total dials
            </p>
            <p>
              • <strong>{setters.reduce((sum, s) => sum + (s.bookings || 0), 0)} total bookings</strong> from {summary.totalCalls} calls ({summary.totalCalls > 0 ? Math.round((setters.reduce((sum, s) => sum + (s.bookings || 0), 0) / summary.totalCalls) * 100) : 0}% overall conversion)
            </p>
            <p>
              • On average, setters are using <strong>{summary.totalSetters > 0 && summary.totalCalls > 0 ? Math.round((setters.reduce((sum, s) => sum + s.stateNumberCalls, 0) / summary.totalCalls) * 100) : 0}%</strong> state numbers (local presence)
            </p>
            <p>
              • Team average answer rate: <strong>
                {setters.length > 0 ? Math.round(setters.reduce((sum, s) => sum + s.answerRate, 0) / setters.length) : 0}%
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Call Details Modal */}
      {showCallsModal && selectedSetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedSetter.userName}'s Calls</h3>
                  <p className="text-sm text-gray-600">{selectedSetter.email}</p>
                </div>
                <button
                  onClick={() => setShowCallsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-medium">Total Calls</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{selectedSetter.totalCalls}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{selectedSetter.completedCalls}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-purple-600 font-medium">Answer Rate</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{selectedSetter.answerRate}%</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-xs text-orange-600 font-medium">Avg Duration</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">{selectedSetter.avgDuration}s</p>
                </div>
              </div>

              {/* Call List - Coming Soon */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">📞 Call-by-Call Details</h4>
                <p className="text-sm text-gray-700">
                  <strong>Coming in next update:</strong> Full call history with lead names, phone numbers, timestamps, and outcomes.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This will show all calls made by {selectedSetter.userName}, including:
                </p>
                <ul className="text-sm text-gray-600 mt-2 ml-4 list-disc">
                  <li>Lead name and phone number</li>
                  <li>Call timestamp and duration</li>
                  <li>Call outcome (completed, no-answer, busy)</li>
                  <li>Which number was used (own vs state)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}