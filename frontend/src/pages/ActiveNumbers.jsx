import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { numbersApi } from '../services/api';
import { Phone, Trash2, Loader2, CheckCircle2, XCircle, Filter, Search } from 'lucide-react';

export default function ActiveNumbers() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all'); // 'all', 'inGHL', 'notInGHL', 'unassigned'
  const [selectedNumbers, setSelectedNumbers] = useState(new Set());
  const [showBulkReleaseDialog, setShowBulkReleaseDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'setters', 'closers', 'states'

  // Fetch numbers with GHL status
  const { data, isLoading, error } = useQuery({
    queryKey: ['numbers-with-ghl-status'],
    queryFn: async () => {
      const response = await numbersApi.getNumbersWithGHLStatus();
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const deleteMutation = useMutation({
    mutationFn: (sid) => numbersApi.releaseNumber(sid),
    onSuccess: () => {
      queryClient.invalidateQueries(['numbers-with-ghl-status']);
      alert('Number released successfully');
    },
    onError: (error) => {
      alert(`Failed to release number: ${error.message}`);
    }
  });

  const bulkReleaseMutation = useMutation({
    mutationFn: (phoneNumbers) => numbersApi.bulkRelease(phoneNumbers),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['numbers-with-ghl-status']);
      setSelectedNumbers(new Set());
      setShowBulkReleaseDialog(false);
      const result = response.data;
      alert(`Released ${result.summary.released} numbers successfully. Failed: ${result.summary.failed}`);
    },
    onError: (error) => {
      alert(`Bulk release failed: ${error.message}`);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading numbers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading numbers: {error.message}</p>
        <p className="text-sm text-red-600 mt-2">Check if backend is running and GHL credentials are configured.</p>
      </div>
    );
  }

  const numbers = data?.numbers || [];
  const summary = data?.summary || { total: 0, inGHL: 0, notInGHL: 0 };
  
  // Calculate unassigned count (in GHL but not assigned to any user)
  const unassignedCount = numbers.filter(n => n.inGHL && !n.ghlData?.linkedUser).length;

  // Helper function to determine role based on area code
  const getNumberRole = (phoneNumber) => {
    if (phoneNumber.includes('510')) return 'setter';
    if (phoneNumber.includes('650')) return 'closer';
    return 'state';
  };

  // Filter numbers based on selected filters and search
  const filteredNumbers = numbers.filter(number => {
    // GHL Status filter
    if (filter === 'inGHL' && !number.inGHL) return false;
    if (filter === 'notInGHL' && number.inGHL) return false;
    
    // Unassigned filter - in GHL but not assigned to any user
    if (filter === 'unassigned') {
      if (!number.inGHL) return false; // Must be in GHL
      if (number.ghlData?.linkedUser) return false; // Must NOT have linkedUser
      return true;
    }

    // Role filter (setters/closers/states)
    if (roleFilter !== 'all') {
      const role = getNumberRole(number.phoneNumber);
      if (roleFilter === 'setters' && role !== 'setter') return false;
      if (roleFilter === 'closers' && role !== 'closer') return false;
      if (roleFilter === 'states' && role !== 'state') return false;
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesPhone = number.phoneNumber.toLowerCase().includes(query);
      const matchesName = (number.friendlyName || '').toLowerCase().includes(query);
      return matchesPhone || matchesName;
    }

    return true;
  });

  // Calculate role counts
  const setterCount = numbers.filter(n => getNumberRole(n.phoneNumber) === 'setter').length;
  const closerCount = numbers.filter(n => getNumberRole(n.phoneNumber) === 'closer').length;
  const stateCount = numbers.filter(n => getNumberRole(n.phoneNumber) === 'state').length;

  // Toggle single number selection
  const toggleNumber = (phoneNumber) => {
    const newSelected = new Set(selectedNumbers);
    if (newSelected.has(phoneNumber)) {
      newSelected.delete(phoneNumber);
    } else {
      newSelected.add(phoneNumber);
    }
    setSelectedNumbers(newSelected);
  };

  // Toggle all numbers in current view
  const toggleAll = () => {
    if (selectedNumbers.size === filteredNumbers.length) {
      setSelectedNumbers(new Set());
    } else {
      setSelectedNumbers(new Set(filteredNumbers.map(n => n.phoneNumber)));
    }
  };

  // Handle bulk release
  const handleBulkRelease = () => {
    if (selectedNumbers.size === 0) return;
    setShowBulkReleaseDialog(true);
  };

  const confirmBulkRelease = () => {
    const phoneNumbersArray = Array.from(selectedNumbers);
    bulkReleaseMutation.mutate(phoneNumbersArray);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Active Numbers</h2>
          <p className="mt-2 text-gray-600">Manage your Twilio numbers and GHL sync status</p>
        </div>
        
        {/* Bulk Actions */}
        {selectedNumbers.size > 0 && (
          <button
            onClick={handleBulkRelease}
            disabled={bulkReleaseMutation.isPending}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {bulkReleaseMutation.isPending ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <Trash2 className="h-5 w-5 mr-2" />
            )}
            Release Selected ({selectedNumbers.size})
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Numbers</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{summary.total}</p>
            </div>
            <Phone className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In GHL</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{summary.inGHL}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Not in GHL</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{summary.notInGHL}</p>
            </div>
            <XCircle className="h-12 w-12 text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Role Filter Cards - NEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">SETTERS (510)</p>
              <p className="mt-1 text-2xl font-bold text-purple-600">{setterCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">CLOSERS (650)</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">{closerCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">STATE NUMBERS</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">{stateCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by phone number or state name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role Filter Buttons */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by Role:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                roleFilter === 'all'
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({summary.total})
            </button>
            <button
              onClick={() => setRoleFilter('setters')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                roleFilter === 'setters'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              Setters 510 ({setterCount})
            </button>
            <button
              onClick={() => setRoleFilter('closers')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                roleFilter === 'closers'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Closers 650 ({closerCount})
            </button>
            <button
              onClick={() => setRoleFilter('states')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                roleFilter === 'states'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              States ({stateCount})
            </button>
          </div>
        </div>

        {/* GHL Status Filter Buttons */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by GHL Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({summary.total})
            </button>
            <button
              onClick={() => setFilter('inGHL')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'inGHL'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In GHL ({summary.inGHL})
            </button>
            <button
              onClick={() => setFilter('notInGHL')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'notInGHL'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Not in GHL ({summary.notInGHL})
            </button>
            <button
              onClick={() => setFilter('unassigned')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'unassigned'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unassigned ({unassignedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Numbers List */}
      {filteredNumbers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchQuery 
              ? `No numbers found matching "${searchQuery}"`
              : 'No numbers found with current filters.'
            }
          </p>
          {(searchQuery || filter !== 'all' || roleFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
                setRoleFilter('all');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Table Header with Select All */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedNumbers.size === filteredNumbers.length && filteredNumbers.length > 0}
                onChange={toggleAll}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                Select All ({filteredNumbers.length})
              </span>
            </div>
          </div>

          {/* Numbers List */}
          <div className="divide-y">
            {filteredNumbers.map((number) => {
              const role = getNumberRole(number.phoneNumber);
              const roleBadges = {
                setter: <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Setter (510)</span>,
                closer: <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Closer (650)</span>,
                state: <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">State</span>
              };

              return (
                <div
                  key={number.sid}
                  className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
                    selectedNumbers.has(number.phoneNumber) ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNumbers.has(number.phoneNumber)}
                      onChange={() => toggleNumber(number.phoneNumber)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <p className="font-mono text-lg font-medium text-gray-900">
                          {number.phoneNumber}
                        </p>
                        {/* Role Badge */}
                        {roleBadges[role]}
                        {/* GHL Status Badge */}
                        {number.inGHL ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            In GHL
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not in GHL
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {/* Show GHL friendly name if in GHL, otherwise show Twilio friendly name */}
                        {number.inGHL && number.ghlData?.friendlyName 
                          ? `GHL: ${number.ghlData.friendlyName}`
                          : number.friendlyName || 'No friendly name'}
                        {/* Show assigned user if available */}
                        {number.inGHL && number.ghlData?.linkedUser && (
                          <span className="ml-2 text-xs text-blue-600">
                            • Assigned to user
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Release number ${number.phoneNumber}?`)) {
                        deleteMutation.mutate(number.sid);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-800 flex items-center disabled:opacity-50 transition-colors px-4 py-2 rounded-md hover:bg-red-50"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-1" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Release
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-500 text-center">
        Showing {filteredNumbers.length} of {summary.total} numbers
        {selectedNumbers.size > 0 && ` • ${selectedNumbers.size} selected`}
      </div>

      {/* Bulk Release Confirmation Dialog */}
      {showBulkReleaseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Confirm Bulk Release
              </h3>
              <p className="text-gray-600 mb-4">
                You are about to release <span className="font-bold text-red-600">{selectedNumbers.size} numbers</span>. This action cannot be undone.
              </p>
              
              {/* List of numbers to be released */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                <p className="text-sm font-medium text-gray-700 mb-2">Numbers to be released:</p>
                <ul className="space-y-1">
                  {Array.from(selectedNumbers).map(phone => (
                    <li key={phone} className="text-sm font-mono text-gray-600">
                      {phone}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBulkReleaseDialog(false)}
                  disabled={bulkReleaseMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkRelease}
                  disabled={bulkReleaseMutation.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                >
                  {bulkReleaseMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Releasing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Release All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}