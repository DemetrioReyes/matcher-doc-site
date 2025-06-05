import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface ResultPanelProps {
  result: {
    status: string;
    similaritySelfie: number;
    similarityDB: number;
    reason: string | null;
  } | null;
  error: string | null;
  onRestart: () => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result, error, onRestart }) => {
  // Handle server error
  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Error</h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
        <button
          onClick={onRestart}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  // Handle no result (shouldn't happen)
  if (!result) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Result</h2>
          <p className="text-gray-600 text-center">No verification result was received.</p>
        </div>
        <button
          onClick={onRestart}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  // Success view
  if (result.status === 'approved') {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Successful</h2>
          <p className="text-gray-600 text-center">Your identity has been verified successfully.</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">Selfie to ID Match</span>
              <span className="text-sm font-medium text-gray-800">{result.similaritySelfie.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${result.similaritySelfie}%` }}
              ></div>
            </div>
          </div>
          
          {result.similarityDB > 0 && (
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">ID to Database Match</span>
                <span className="text-sm font-medium text-gray-800">{result.similarityDB.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${result.similarityDB}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={onRestart}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Verify Again
        </button>
      </div>
    );
  }
  
  // Failure view
  return (
    <div className="p-6">
      <div className="flex flex-col items-center mb-6">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
        <p className="text-gray-600 text-center">
          {result.reason || 'Your identity could not be verified.'}
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Selfie to ID Match</span>
            <span className="text-sm font-medium text-gray-800">{result.similaritySelfie.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${result.similaritySelfie >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${result.similaritySelfie}%` }}
            ></div>
          </div>
        </div>
        
        {result.similarityDB > 0 && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-600">ID to Database Match</span>
              <span className="text-sm font-medium text-gray-800">{result.similarityDB.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${result.similarityDB >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${result.similarityDB}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={onRestart}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        Try Again
      </button>
    </div>
  );
};

export default ResultPanel;