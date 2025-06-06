import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VerificationContainer from './components/VerificationContainer';
import FaceLivenessDetector from './components/FaceLivenessDetector';
import DocumentCapture from './components/DocumentCapture';
import ResultPanel from './components/ResultPanel';
import PricingPage from './components/PricingPage';
import PrivacyPage from './components/PrivacyPage';
import ContactPage from './components/ContactPage';
import Header from './components/Header';

// Verification process steps
const STEPS = {
  FACE_LIVENESS: 'face_liveness',
  DOCUMENT_CAPTURE: 'document_capture',
  PROCESSING: 'processing',
  RESULT: 'result'
};

// Página de inicio
const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Verificación de Identidad Segura
        </h1>
        <p className="text-xl text-center text-gray-300 mb-12 max-w-2xl mx-auto">
          Utilizamos tecnología de reconocimiento facial avanzada para garantizar la seguridad de tu identidad.
        </p>
        <div className="flex justify-center">
          <Link
            to="/verify"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Comenzar Verificación
          </Link>
        </div>
      </main>
    </div>
  );
};

// Componente de verificación
const VerificationPage = () => {
  const [currentStep, setCurrentStep] = React.useState(STEPS.FACE_LIVENESS);
  const [selfieImage, setSelfieImage] = React.useState<ArrayBuffer | null>(null);
  const [documentImage, setDocumentImage] = React.useState<string | null>(null);
  const [verificationResult, setVerificationResult] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLivenessSuccess = (result: { livenessImage: ArrayBuffer }) => {
    setSelfieImage(result.livenessImage);
    setCurrentStep(STEPS.DOCUMENT_CAPTURE);
  };

  const handleDocumentCapture = (base64Image: string) => {
    setDocumentImage(base64Image);
    verifyIdentity(base64Image);
  };

  const verifyIdentity = async (docImageBase64: string) => {
    if (!selfieImage) return;
    
    setCurrentStep(STEPS.PROCESSING);
    setIsProcessing(true);
    setError(null);
    setVerificationResult(null);
    
    try {
      const selfieBytes = new Uint8Array(selfieImage);
      const selfieBase64 = btoa(String.fromCharCode.apply(null, Array.from(selfieBytes)));
      const docBase64 = docImageBase64.split(',')[1];
      
      const response = await fetch('http://localhost:3000/api/verify-identity', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          selfie: selfieBase64,
          idDocument: docBase64,
          userId: 'user123'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la verificación');
      }
      
      const result = await response.json();
      setVerificationResult({
        status: result.success ? 'approved' : 'rejected',
        reason: result.reason,
        similaritySelfie: result.details?.similarity
      });
      setCurrentStep(STEPS.RESULT);
    } catch (err: any) {
      console.error('Error en verificación:', err);
      setError(err.message || 'Error en la verificación');
      setCurrentStep(STEPS.RESULT);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestart = () => {
    setSelfieImage(null);
    setDocumentImage(null);
    setVerificationResult(null);
    setError(null);
    setCurrentStep(STEPS.FACE_LIVENESS);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-md mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <Link to="/" className="absolute left-4 top-4 text-white hover:text-blue-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white">Verificación de Identidad</h1>
        </div>
        <p className="text-slate-400">Verificación segura usando tecnología de reconocimiento facial</p>
      </header>

      <VerificationContainer>
        {currentStep === STEPS.FACE_LIVENESS && (
          <FaceLivenessDetector onSuccess={handleLivenessSuccess} />
        )}
        
        {currentStep === STEPS.DOCUMENT_CAPTURE && (
          <DocumentCapture onCapture={handleDocumentCapture} />
        )}
        
        {currentStep === STEPS.PROCESSING && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Verificando Identidad</h2>
            <p className="text-slate-400 text-center">
              Por favor espere mientras procesamos su verificación de forma segura...
            </p>
          </div>
        )}
        
        {currentStep === STEPS.RESULT && (
          <ResultPanel 
            result={verificationResult} 
            error={error}
            onRestart={handleRestart}
          />
        )}
      </VerificationContainer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;