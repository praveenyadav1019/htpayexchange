
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-48 h-48 mb-4">
        <svg viewBox="0 0 200 200" className="w-full h-full text-gray-100 fill-current">
          <path d="M40 60 L100 30 L160 60 L160 140 L100 170 L40 140 Z" />
          <path d="M40 60 L100 90 L160 60" className="stroke-gray-200 stroke-2 fill-none" />
          <path d="M100 90 L100 170" className="stroke-gray-200 stroke-2 fill-none" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center translate-y-4">
          <div className="w-32 h-32 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-100"></div>
        </div>
      </div>
      <p className="text-gray-400 font-medium text-lg">No data</p>
    </div>
  );
};

export default EmptyState;
