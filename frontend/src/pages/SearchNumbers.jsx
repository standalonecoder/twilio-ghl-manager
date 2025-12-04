import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { numbersApi } from '../services/api';
import { Search, Phone, MapPin, ShoppingCart, Loader2, CheckCircle } from 'lucide-react';

export default function SearchNumbers() {
  const [selectedAreaCode, setSelectedAreaCode] = useState('');
  const [searchLimit, setSearchLimit] = useState(20);
  const [purchasingNumber, setPurchasingNumber] = useState(null);
  const [friendlyName, setFriendlyName] = useState('');
  const queryClient = useQueryClient();

  // Fetch area codes
  const { data: areaCodesData } = useQuery({
    queryKey: ['areaCodes'],
    queryFn: async () => {
      const response = await numbersApi.getAreaCodes();
      return response.data;
    }
  });

  // Search numbers
  const { data: searchResults, isLoading: isSearching, refetch: searchNumbers } = useQuery({
    queryKey: ['searchNumbers', selectedAreaCode, searchLimit],
    queryFn: async () => {
      if (!selectedAreaCode) return null;
      const response = await numbersApi.searchNumbers(selectedAreaCode, searchLimit);
      return response.data;
    },
    enabled: false
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: (data) => numbersApi.purchaseNumber(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['numbers']);
      setPurchasingNumber(null);
      setFriendlyName('');
      alert('Number purchased successfully!');
    },
    onError: (error) => {
      alert(`Failed to purchase: ${error.response?.data?.error || error.message}`);
      setPurchasingNumber(null);
    }
  });

  const handleSearch = () => {
    if (!selectedAreaCode) {
      alert('Please select an area code');
      return;
    }
    searchNumbers();
  };

  const handlePurchase = (phoneNumber) => {
    const name = friendlyName || `Number ${phoneNumber}`;
    purchaseMutation.mutate({
      phoneNumber,
      friendlyName: name,
      areaCode: selectedAreaCode
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Search Available Numbers</h2>
        <p className="mt-2 text-gray-600">Find and purchase phone numbers by area code</p>
      </div>

      {/* Search Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area Code
            </label>
            <select
              value={selectedAreaCode}
              onChange={(e) => setSelectedAreaCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select area code...</option>
              {areaCodesData?.areaCodes.map((ac) => (
                <option key={ac.code} value={ac.code}>
                  {ac.code} - {ac.region}, {ac.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Results Limit
            </label>
            <select
              value={searchLimit}
              onChange={(e) => setSearchLimit(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10 numbers</option>
              <option value={20}>20 numbers</option>
              <option value={50}>50 numbers</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={isSearching || !selectedAreaCode}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {isSearching ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Search Numbers
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Available Numbers ({searchResults.count})
            </h3>
          </div>

          {searchResults.count === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No numbers available for this area code. Try a different area code.
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.numbers.map((number) => (
                <div
                  key={number.phoneNumber}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-lg font-mono font-semibold text-gray-900">
                        {number.phoneNumber}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {number.locality}, {number.region}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {purchasingNumber === number.phoneNumber ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Friendly name (optional)"
                          value={friendlyName}
                          onChange={(e) => setFriendlyName(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                        <button
                          onClick={() => handlePurchase(number.phoneNumber)}
                          disabled={purchaseMutation.isPending}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                        >
                          {purchaseMutation.isPending ? (
                            <>
                              <Loader2 className="animate-spin h-4 w-4 mr-2" />
                              Purchasing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setPurchasingNumber(null);
                            setFriendlyName('');
                          }}
                          className="text-gray-600 hover:text-gray-900 px-3 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPurchasingNumber(number.phoneNumber)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}