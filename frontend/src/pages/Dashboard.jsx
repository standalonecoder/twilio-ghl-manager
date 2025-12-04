import { useQuery } from '@tanstack/react-query';
import { numbersApi, analyticsApi, ghlApi } from '../services/api';
import { Phone, TrendingUp, AlertCircle, Activity, Users } from 'lucide-react';

export default function Dashboard() {
  const { data: numbersData } = useQuery({
    queryKey: ['numbers'],
    queryFn: async () => {
      const response = await numbersApi.getAllNumbers();
      return response.data;
    }
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const response = await analyticsApi.getOverview();
      return response.data;
    }
  });

  // NEW: GHL numbers (directly from GHL API via backend)
  const { data: ghlNumbersData } = useQuery({
    queryKey: ['ghl-phone-numbers'],
    queryFn: async () => {
      const response = await ghlApi.getPhoneNumbers();
      return response.data;
    }
  });

  const stats = [
    {
      name: 'Total Numbers (DB)',
      value: numbersData?.count || 0,
      icon: Phone,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Calls',
      value: analyticsData?.stats.totalCalls || 0,
      icon: Activity,
      color: 'bg-green-500'
    },
    {
      name: 'Success Rate',
      value: `${analyticsData?.stats.successRate || 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      name: 'Failed Calls',
      value: analyticsData?.stats.failed || 0,
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

  const ghlNumbers = ghlNumbersData?.numbers || ghlNumbersData || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">Overview of your Twilio–GHL system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Numbers from local DB */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Numbers (DB)</h3>
        </div>
        <div className="p-6">
          {numbersData?.numbers.slice(0, 5).map((number) => (
  <div key={number.sid} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-mono font-semibold text-gray-900">
                    {number.phoneNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {number.friendlyName || 'No name'}
                  </p>
                </div>
              </div>
              <span className="text-sm text-gray-600">
                {new Date(number.purchaseDate).toLocaleDateString()}
              </span>
            </div>
          ))}
          {!numbersData?.numbers?.length && (
            <p className="text-center text-gray-500 py-4">No numbers yet</p>
          )}
        </div>
      </div>

      {/* NEW: GHL Numbers with Friendly Name & Staff */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">GHL Numbers</h3>
            <p className="text-sm text-gray-500">
              Directly from GHL API – friendly name & staff where available
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            {Array.isArray(ghlNumbers) ? ghlNumbers.length : 0} numbers
          </div>
        </div>
        <div className="p-6">
          {Array.isArray(ghlNumbers) && ghlNumbers.length > 0 ? (
            ghlNumbers.slice(0, 10).map((num, idx) => (
              <div
                key={num.id || num.phoneNumber || idx}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-mono font-semibold text-gray-900">
                      {num.phoneNumber || num.number || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {num.friendlyName || num.name || 'No friendly name'}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-600">
                  {num.assignedUserName ||
                    num.assignedTo ||
                    'Unassigned'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No GHL numbers found or API not returning data yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
