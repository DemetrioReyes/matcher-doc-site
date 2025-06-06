import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import VerificationResult from '../components/VerificationResult';

interface VerificationResultType {
  success: boolean;
  reason?: string;
  details?: {
    imageType?: 'documento' | 'selfie' | 'ambas';
    brightness?: string;
    sharpness?: string;
    confidence?: string;
    similarity?: string;
    recommendations?: string[];
  };
}

const VerificationPage: React.FC = () => {
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResultType | null>(null);

  const handleVerification = async () => {
    if (!idDocument || !selfie) {
      setError('Por favor, sube tanto el documento como la selfie');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/verify-identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idDocument,
          selfie,
          userId: 'test-user'
        }),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);

      // Usar directamente la respuesta del servidor
      setVerificationResult({
        success: data.success,
        reason: data.reason,
        details: data.details
      });

    } catch (error) {
      console.error('Error en verificación:', error);
      setError('Error al procesar la verificación. Por favor, intente nuevamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Verificación de Identidad</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Documento de Identidad</h2>
            <div className="aspect-[3/4] bg-slate-700 rounded-lg flex items-center justify-center">
              {idDocument ? (
                <img src={idDocument} alt="Documento" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Upload className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setIdDocument(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="mt-4 w-full"
            />
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Selfie</h2>
            <div className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center">
              {selfie ? (
                <img src={selfie} alt="Selfie" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Camera className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setSelfie(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="mt-4 w-full"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {verificationResult && (
          <div className="mb-8">
            <VerificationResult {...verificationResult} />
          </div>
        )}

        <button
          onClick={handleVerification}
          disabled={isVerifying || !idDocument || !selfie}
          className={`w-full py-4 px-8 rounded-lg font-bold text-white ${
            isVerifying || !idDocument || !selfie
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isVerifying ? 'Verificando...' : 'Verificar Identidad'}
        </button>
      </div>
    </div>
  );
};

export default VerificationPage; 