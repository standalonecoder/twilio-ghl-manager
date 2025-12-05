import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { numbersApi, analyticsApi, ghlApi } from '../services/api';
import { Phone, TrendingUp, AlertCircle, Activity, Users, Sparkles } from 'lucide-react';
import { StatCard } from '../components/Card';
import Badge, { StatusBadge } from '../components/Badge';

export default function Dashboard() {
  const { data: numbersData, isLoading: numbersLoading } = useQuery({
    queryKey: ['numbers'],
    queryFn: async () => {
      const response = await numbersApi.getAllNumbers();
      return response.data;
    }
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: async () => {
      const response = await analyticsApi.getOverview();
      return response.data;
    }
  });

  const { data: ghlNumbersData, isLoading: ghlLoading } = useQuery({
    queryKey: ['ghl-phone-numbers'],
    queryFn: async () => {
      const response = await ghlApi.getPhoneNumbers();
      return response.data;
    }
  });

  const stats = [
    {
      label: 'Total Numbers (DB)',
      value: numbersData?.count || 0,
      icon: Phone,
      color: 'brand',
      trend: 'up',
      trendValue: '+12%'
    },
    {
      label: 'Total Calls',
      value: analyticsData?.stats.totalCalls || 0,
      icon: Activity,
      color: 'brand',
      trend: 'up',
      trendValue: '+8%'
    },
    {
      label: 'Success Rate',
      value: `${analyticsData?.stats.successRate || 0}%`,
      icon: TrendingUp,
      color: 'success',
      trend: 'up',
      trendValue: '+3.2%'
    },
    {
      label: 'Failed Calls',
      value: analyticsData?.stats.failed || 0,
      icon: AlertCircle,
      color: 'danger',
      trend: 'down',
      trendValue: '-5%'
    }
  ];

  const ghlNumbers = Array.isArray(ghlNumbersData?.numbers) 
    ? ghlNumbersData.numbers 
    : Array.isArray(ghlNumbersData) 
    ? ghlNumbersData 
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl p-8 bg-white border border-gray-200"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-accent-500" />
            <h1 className="text-4xl font-bold gradient-text-primary">
              Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Overview of your Twilio–GHL system performance
          </p>
        </div>
        
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-500/10 to-primary-600/10 rounded-full blur-3xl -z-10" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <StatCard {...stat} animate={true} />
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Numbers from DB */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="modern-card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-heading font-semibold text-gray-900">
              <Phone className="h-5 w-5 text-accent-500" />
              Recent Numbers (Database)
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Latest numbers from your Twilio account
            </p>
          </div>
          <StatusBadge status="active" />
        </div>
        
        <div className="p-6">
          {numbersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner h-8 w-8" />
            </div>
          ) : numbersData?.numbers && numbersData.numbers.length > 0 ? (
            <div className="space-y-3">
              {numbersData.numbers.slice(0, 5).map((number, index) => (
                <motion.div
                  key={number.sid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary-100">
                      <Phone className="h-4 w-4 text-accent-500" />
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-gray-900 text-base">
                        {number.phoneNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {number.friendlyName || 'No name assigned'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(number.purchaseDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No numbers found in database</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* GHL Numbers Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="modern-card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-accent-500" />
              GHL Numbers
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Directly from GHL API – with friendly names & staff assignments
            </p>
          </div>
          <Badge variant="success" dot pulse>
            {ghlNumbers.length} numbers
          </Badge>
        </div>
        
        <div className="p-6">
          {ghlLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="loading-spinner h-8 w-8" />
            </div>
          ) : ghlNumbers.length > 0 ? (
            <div className="space-y-3">
              {ghlNumbers.slice(0, 10).map((num, index) => (
                <motion.div
                  key={num.id || num.phoneNumber || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-300 border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent-100">
                      <Phone className="h-4 w-4 text-accent-600" />
                    </div>
                    <div>
                      <p className="font-mono font-semibold text-gray-900 text-base">
                        {num.phoneNumber || num.number || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {num.friendlyName || num.name || 'No friendly name'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="brand" size="sm">
                      {num.assignedUserName || num.assignedTo || 'Unassigned'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                No GHL numbers found or API not returning data yet
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Check your GHL integration settings
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}