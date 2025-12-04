import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoadingBanner({ isLoading, isFetching, isError, lastUpdated }) {
  if (isError) {
    return (
      <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Failed to load data</span>
      </div>
    );
  }

  if (isFetching && !isLoading) {
    return (
      <div className="fixed top-20 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Refreshing data please wait...</span>
      </div>
    );
  }

  if (lastUpdated && !isFetching) {
    return (
      <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm font-medium">✓ Data up to date</span>
      </div>
    );
  }

  return null;
}