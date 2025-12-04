import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { numbersApi, ghlApi } from '../services/api';
import { ShoppingCart, Loader2, CheckCircle, AlertCircle, Search, Phone, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';


export default function BulkPurchase() {
  const [selectedStates, setSelectedStates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseMode, setPurchaseMode] = useState('states'); // 'states', 'setter', 'closer'
  const [selectedSetters, setSelectedSetters] = useState([]); // NEW: For bulk setter purchase
  const [setterSearchTerm, setSetterSearchTerm] = useState(''); // NEW: Search setters

  // Fetch all states
  const { data: statesData, isLoading } = useQuery({
    queryKey: ['states'],
    queryFn: async () => {
      const response = await numbersApi.getStates();
      return response.data;
    }
  });

  // NEW: Fetch GHL users for setter purchase
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['ghl-users'],
    queryFn: async () => {
      const response = await ghlApi.getUsers();
      return response.data;
    },
    enabled: purchaseMode === 'setter' // Only fetch when on setter mode
  });

  const queryClient = useQueryClient();

  // Fetch all numbers to show recent purchases
  const { data: numbersData } = useQuery({
    queryKey: ['numbers'],
    queryFn: async () => {
      const response = await numbersApi.getAllNumbers();
      return response.data;
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Helper function to format time ago
  const formatTimeAgo = (dateCreated) => {
    const now = new Date();
    const purchaseDate = new Date(dateCreated);
    const diffMs = now - purchaseDate;
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  // Filter numbers purchased in last 12 hours (changed from 24)
  const recentPurchases = (numbersData?.numbers?.filter(num => {
    const purchaseDate = new Date(num.dateCreated);
    const now = new Date();
    const hoursDiff = (now - purchaseDate) / (1000 * 60 * 60);
    return hoursDiff <= 12; // Changed from 24 to 12 hours
  }) || []).sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)); // Sort newest first

  // Helper function to determine role
  const getNumberRole = (phoneNumber) => {
    if (phoneNumber.includes('510')) return 'setter';
    if (phoneNumber.includes('650')) return 'closer';
    return 'state';
  };

  // Count recent purchases by role
  const recentSetters = recentPurchases.filter(n => getNumberRole(n.phoneNumber) === 'setter').length;
  const recentClosers = recentPurchases.filter(n => getNumberRole(n.phoneNumber) === 'closer').length;
  const recentStates = recentPurchases.filter(n => getNumberRole(n.phoneNumber) === 'state').length;

  // Bulk purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: (states) => numbersApi.bulkPurchaseByState(states),
    onSuccess: (data) => {
      const summary = data.data.summary;
      alert(`Success! Purchased ${summary.purchased} numbers for ${summary.purchased} states`);
      setSelectedStates([]);
      queryClient.invalidateQueries(['numbers']); // Refresh numbers list
    },
    onError: (error) => {
      alert(`Failed: ${error.response?.data?.error || error.message}`);
    }
  });

  // Quick purchase mutation for Setter/Closer
  const quickPurchaseMutation = useMutation({
    mutationFn: ({ areaCode, friendlyName }) => numbersApi.quickPurchase(areaCode, friendlyName),
    onSuccess: (data) => {
      const number = data.data.number;
      alert(`Success! Purchased ${number.phoneNumber}\n\nNumber SID: ${number.sid}\n\nYou can now assign this to a user in GHL.`);
      queryClient.invalidateQueries(['numbers']); // Refresh numbers list
    },
    onError: (error) => {
      alert(`Failed: ${error.response?.data?.error || error.message}`);
    }
  });

  // NEW: Bulk setter purchase mutation
  const bulkSetterPurchaseMutation = useMutation({
    mutationFn: (users) => numbersApi.bulkPurchaseSetters(users),
    onSuccess: (data) => {
      const summary = data.data.summary;
      const results = data.data.results;
      
      let message = `Bulk Purchase Complete!\n\n`;
      message += `✅ Purchased: ${summary.purchased}\n`;
      if (summary.failed > 0) {
        message += `❌ Failed: ${summary.failed}\n\n`;
        message += `Failed users:\n`;
        results.failed.forEach(f => {
          message += `• ${f.user}: ${f.error}\n`;
        });
      }
      
      alert(message);
      setSelectedSetters([]);
      queryClient.invalidateQueries(['numbers']); // Refresh numbers list
    },
    onError: (error) => {
      alert(`Failed: ${error.response?.data?.error || error.message}`);
    }
  });

  const handleStateToggle = (stateName) => {
    setSelectedStates(prev => 
      prev.includes(stateName) 
        ? prev.filter(s => s !== stateName)
        : [...prev, stateName]
    );
  };

  const handleSelectAll = () => {
    if (selectedStates.length === statesData?.states.length) {
      setSelectedStates([]);
    } else {
      setSelectedStates(statesData?.states.map(s => s.name) || []);
    }
  };

  // NEW: Setter selection handlers
  const handleSetterToggle = (userId) => {
    setSelectedSetters(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllSetters = () => {
    const allUsers = usersData?.users || [];
    if (selectedSetters.length === allUsers.length) {
      setSelectedSetters([]);
    } else {
      setSelectedSetters(allUsers.map(u => u.id || u.userId || u.ghlUserId));
    }
  };

  const handlePurchase = () => {
    if (selectedStates.length === 0) {
      alert('Please select at least one state');
      return;
    }

    if (!window.confirm(`Purchase ${selectedStates.length} numbers (1 per state)?\n\nStates: ${selectedStates.join(', ')}`)) {
      return;
    }

    purchaseMutation.mutate(selectedStates);
  };

  const handleQuickPurchase = () => {
    const areaCode = purchaseMode === 'setter' ? '510' : '650';
    const role = purchaseMode === 'setter' ? 'Setter' : 'Closer';
    
    if (!window.confirm(`Purchase 1 ${role} number with area code ${areaCode}?`)) {
      return;
    }

    quickPurchaseMutation.mutate({ 
      areaCode, 
      friendlyName: null // Will auto-generate
    });
  };

  // NEW: Bulk setter purchase handler
  const handleBulkSetterPurchase = () => {
    if (selectedSetters.length === 0) {
      alert('Please select at least one setter');
      return;
    }

    const allUsers = usersData?.users || [];
    const selectedUserObjects = selectedSetters.map(userId => {
      const user = allUsers.find(u => (u.id || u.userId || u.ghlUserId) === userId);
      return {
        userId: user.id || user.userId || user.ghlUserId,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()
      };
    });

    const userNames = selectedUserObjects.map(u => u.name).join(', ');
    
    if (!window.confirm(`Purchase ${selectedSetters.length} setter number(s) for:\n\n${userNames}\n\nEach number will be named after the setter in Twilio and added to A2P campaign.`)) {
      return;
    }

    bulkSetterPurchaseMutation.mutate(selectedUserObjects);
  };

  const filteredStates = statesData?.states.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // NEW: Filter setters by search term
  const filteredSetters = (usersData?.users || []).filter(user => {
    const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const email = user.email || '';
    return name.toLowerCase().includes(setterSearchTerm.toLowerCase()) ||
           email.toLowerCase().includes(setterSearchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Bulk Purchase</h2>
        <p className="mt-2 text-gray-600">
          Purchase phone numbers for states, setters, or closers
        </p>
      </div>

      {/* Purchase Mode Selector - NEW */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Purchase Type:</span>
        </div>
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => setPurchaseMode('states')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              purchaseMode === 'states'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center">
              <Phone className="h-5 w-5 mr-2" />
              State Numbers
            </div>
            <div className="text-xs mt-1 opacity-75">50 US States</div>
          </button>
          
          <button
            onClick={() => setPurchaseMode('setter')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              purchaseMode === 'setter'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center">
              <Users className="h-5 w-5 mr-2" />
              Setter (510)
            </div>
            <div className="text-xs mt-1 opacity-75">Area code 510</div>
          </button>
          
          <button
            onClick={() => setPurchaseMode('closer')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
              purchaseMode === 'closer'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center">
              <Users className="h-5 w-5 mr-2" />
              Closer (650)
            </div>
            <div className="text-xs mt-1 opacity-75">Area code 650</div>
          </button>
        </div>
      </div>

      {/* Quick Purchase for Setters/Closers - ENABLED */}
      {purchaseMode !== 'states' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className={`border-l-4 ${
            purchaseMode === 'setter' ? 'border-purple-500' : 'border-orange-500'
          } pl-4`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Purchase: {purchaseMode === 'setter' ? 'Setter (510)' : 'Closer (650)'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Purchase a phone number with area code {purchaseMode === 'setter' ? '510' : '650'}
            </p>
            
            <div className={`${
              purchaseMode === 'setter' ? 'bg-purple-50 border-purple-200' : 'bg-orange-50 border-orange-200'
            } border rounded-lg p-4 mb-4`}>
              <div className="flex items-start">
                <CheckCircle className={`h-5 w-5 ${
                  purchaseMode === 'setter' ? 'text-purple-600' : 'text-orange-600'
                } mr-2 mt-0.5`} />
                <div className="text-sm text-gray-800">
                  <p className="font-medium">Ready to Purchase!</p>
                  <p className="mt-1">
                    Click the button below to instantly purchase a {purchaseMode === 'setter' ? '510' : '650'} number. 
                    After purchase, assign it to a user in the GHL Integration tab.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleQuickPurchase}
              disabled={quickPurchaseMutation.isPending}
              className={`w-full px-6 py-3 ${
                purchaseMode === 'setter' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
            >
              {quickPurchaseMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Purchasing...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Purchase 1 {purchaseMode === 'setter' ? 'Setter' : 'Closer'} Number
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* BULK SETTER PURCHASE - NEW SECTION */}
      {purchaseMode === 'setter' && (
        <>
          {/* Purchase Summary for Setters */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-800 font-medium">
                  {selectedSetters.length} setter{selectedSetters.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {selectedSetters.length} 510 number{selectedSetters.length !== 1 ? 's' : ''} will be purchased
                </p>
              </div>
              <button
                onClick={handleBulkSetterPurchase}
                disabled={selectedSetters.length === 0 || bulkSetterPurchaseMutation.isPending}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {bulkSetterPurchaseMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Purchase {selectedSetters.length} Number{selectedSetters.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search & Select All for Setters */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search setters by name or email..."
                  value={setterSearchTerm}
                  onChange={(e) => setSetterSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSelectAllSetters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {selectedSetters.length === (usersData?.users || []).length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Setters Grid */}
          <div className="bg-white shadow rounded-lg p-6">
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
                <span className="ml-3 text-gray-600">Loading GHL users...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredSetters.map((user) => {
                    const userId = user.id || user.userId || user.ghlUserId;
                    const userName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    const userEmail = user.email || '';
                    const isSelected = selectedSetters.includes(userId);
                    
                    return (
                      <label
                        key={userId}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSetterToggle(userId)}
                          className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-semibold text-gray-900">{userName}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {userEmail}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        )}
                      </label>
                    );
                  })}
                </div>

                {filteredSetters.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {setterSearchTerm ? 'No setters match your search' : 'No GHL users found'}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Purchase Results for Setters */}
          {bulkSetterPurchaseMutation.isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                <div>
                  <p className="font-semibold text-green-900">Bulk Purchase Successful!</p>
                  <p className="text-sm text-green-700 mt-1">
                    {bulkSetterPurchaseMutation.data?.data.summary.purchased} numbers purchased and added to A2P campaign
                  </p>
                  {bulkSetterPurchaseMutation.data?.data.summary.failed > 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ {bulkSetterPurchaseMutation.data?.data.summary.failed} failed
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {bulkSetterPurchaseMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                <div>
                  <p className="font-semibold text-red-900">Purchase Failed</p>
                  <p className="text-sm text-red-700 mt-1">
                    {bulkSetterPurchaseMutation.error?.response?.data?.error || bulkSetterPurchaseMutation.error?.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent Purchases Summary - ENHANCED */}
      {recentPurchases.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Purchases</h3>
              <p className="text-sm text-gray-500">Last 12 hours</p>
            </div>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              {recentPurchases.length} total
            </span>
          </div>

          {/* Role Breakdown - NEW */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{recentSetters}</p>
              <p className="text-xs text-purple-700 mt-1">Setters (510)</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{recentClosers}</p>
              <p className="text-xs text-orange-700 mt-1">Closers (650)</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">{recentStates}</p>
              <p className="text-xs text-indigo-700 mt-1">State Numbers</p>
            </div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentPurchases.map((number) => {
              const role = getNumberRole(number.phoneNumber);
              const roleColors = {
                setter: 'bg-purple-50 border-purple-200',
                closer: 'bg-orange-50 border-orange-200',
                state: 'bg-indigo-50 border-indigo-200'
              };
              const roleBadges = {
                setter: <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Setter (510)</span>,
                closer: <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Closer (650)</span>,
                state: <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">State</span>
              };

              return (
                <div
                  key={number.sid}
                  className={`flex items-center justify-between p-3 border rounded-lg ${roleColors[role]}`}
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono font-semibold text-gray-900">
                          {number.phoneNumber}
                        </p>
                        {roleBadges[role]}
                      </div>
                      <p className="text-sm text-gray-600">
                        {number.friendlyName || 'No name'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(number.dateCreated).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      {formatTimeAgo(number.dateCreated)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* State Purchase Section - Only show when mode is 'states' */}
      {purchaseMode === 'states' && (
        <>
          {/* Purchase Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  {selectedStates.length} state{selectedStates.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {selectedStates.length} number{selectedStates.length !== 1 ? 's' : ''} will be purchased
                </p>
              </div>
              <button
                onClick={handlePurchase}
                disabled={selectedStates.length === 0 || purchaseMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                {purchaseMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Purchasing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Purchase {selectedStates.length} Number{selectedStates.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search & Select All */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {selectedStates.length === statesData?.states.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* States Grid */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredStates.map((state) => (
                <label
                  key={state.name}
                  className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedStates.includes(state.name)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStates.includes(state.name)}
                    onChange={() => handleStateToggle(state.name)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-semibold text-gray-900">{state.name}</p>
                    <p className="text-xs text-gray-500">
                      {state.areaCodes.length} area code{state.areaCodes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {selectedStates.includes(state.name) && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </label>
              ))}
            </div>

            {filteredStates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No states match your search
              </div>
            )}
          </div>

          {/* Purchase Results */}
          {purchaseMutation.isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                <div>
                  <p className="font-semibold text-green-900">Purchase Successful!</p>
                  <p className="text-sm text-green-700 mt-1">
                    {purchaseMutation.data?.data.summary.purchased} numbers purchased
                  </p>
                  {purchaseMutation.data?.data.summary.failed > 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ {purchaseMutation.data?.data.summary.failed} failed
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {purchaseMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                <div>
                  <p className="font-semibold text-red-900">Purchase Failed</p>
                  <p className="text-sm text-red-700 mt-1">
                    {purchaseMutation.error?.response?.data?.error || purchaseMutation.error?.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}