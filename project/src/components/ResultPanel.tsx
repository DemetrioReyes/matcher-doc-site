import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ResultPanelProps {
  result: {
    status?: 'approved' | 'rejected';
    reason?: string;
    similaritySelfie?: number;
    similarityDocument?: number;
  } | null;
  error: string | null;
  onRestart: () => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ result, error, onRestart }) => {
  if (!result && !error) return null;

  const isSuccess = result?.status === 'approved';
  const similarity = typeof result?.similaritySelfie === 'number' 
    ? result.similaritySelfie.toFixed(2) 
    : null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isSuccess ? (
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-12 text-center shadow-lg">
          <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-md">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h3 className="text-3xl font-bold text-green-800 mb-4">Verificación Exitosa</h3>
          <p className="text-green-600 text-xl mb-8">Tu identidad ha sido verificada correctamente.</p>
          {similarity && (
            <div className="bg-white rounded-lg p-6 inline-block shadow-sm">
              <p className="text-green-700 text-lg font-semibold">
                Similitud facial: <span className="text-green-600">{similarity}%</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-12 text-center shadow-lg">
          <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-md">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h3 className="text-3xl font-bold text-red-800 mb-4">Verificación Fallida</h3>
          <p className="text-red-600 text-xl mb-8">{result?.reason || error || 'No se pudo verificar tu identidad.'}</p>
          {similarity && (
            <div className="bg-white rounded-lg p-6 inline-block shadow-sm">
              <p className="text-red-700 text-lg font-semibold">
                Similitud facial: <span className="text-red-600">{similarity}%</span>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={onRestart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
        >
          Intentar Nuevamente
        </button>
      </div>
    </div>
  );
};

export default ResultPanel;