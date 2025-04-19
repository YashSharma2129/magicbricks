import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { LoadingContext } from '../contexts/LoadingContext';

interface LoadingProviderProps {
  children: ReactNode;
}

export default function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading...');

  const value = {
    isLoading,
    setLoading: (state: boolean, text: string = 'Loading...') => {
      setLoadingText(text);
      setIsLoading(state);
    }
  };

  return (
    <LoadingContext.Provider value={value}>
      <div className="relative">
        {children}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50"
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <div className="flex flex-col items-center justify-center h-full">
                <div className="bg-white p-8 rounded-xl shadow-xl">
                  <LoadingSpinner size="large" />
                </div>
                <div className="mt-4 bg-white px-6 py-3 rounded-full shadow-xl">
                  <span className="text-lg font-medium text-gray-700">{loadingText}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LoadingContext.Provider>
  );
}
