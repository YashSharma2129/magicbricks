const LoadingSpinner = ({ size = 'default', overlay = false }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const spinner = (
    <div className="relative">
      {/* Main spinner */}
      <div className={`${sizeClasses[size]} rounded-full border-4 border-blue-200 animate-spin border-t-blue-500`}/>
      {/* Ping effect */}
      <div className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-blue-300 animate-ping absolute top-0 opacity-60`}/>
      {/* Pulse effect */}
      <div className={`${sizeClasses[size]} rounded-full border-4 border-blue-100 animate-pulse absolute top-0 opacity-30`}/>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl">
          {spinner}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
