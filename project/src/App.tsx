import React, { useState } from 'react';
import { Camera, Shield, Check, AlertTriangle, Loader2 } from 'lucide-react';
import VerificationContainer from './components/VerificationContainer';
import FaceLivenessDetector from './components/FaceLivenessDetector';
import DocumentCapture from './components/DocumentCapture';
import ResultPanel from './components/ResultPanel';

// Verification process steps
const STEPS = {
  FACE_LIVENESS: 'face_liveness',
  DOCUMENT_CAPTURE: 'document_capture',
  PROCESSING: 'processing',
  RESULT: 'result'
};

function App() {
  const [currentStep, setCurrentStep] = useState(STEPS.FACE_LIVENESS);
  const [selfieImage, setSelfieImage] = useState<ArrayBuffer | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle successful face liveness detection
  const handleLivenessSuccess = (result: { livenessImage: ArrayBuffer }) => {
    setSelfieImage(result.livenessImage);
    setCurrentStep(STEPS.DOCUMENT_CAPTURE);
  };

  // Handle document capture
  const handleDocumentCapture = (base64Image: string) => {
    setDocumentImage(base64Image);
    verifyIdentity(base64Image);
  };

  // Send verification request to API
  const verifyIdentity = async (docImageBase64: string) => {
    if (!selfieImage) return;
    
    setCurrentStep(STEPS.PROCESSING);
    setIsProcessing(true);
    setError(null);
    
    try {
      // Convert ArrayBuffer to base64
      const selfieBytes = new Uint8Array(selfieImage);
      const selfieBase64 = btoa(String.fromCharCode.apply(null, Array.from(selfieBytes)));
      
      // Get document image (without data:image/jpeg;base64, prefix)
      const docBase64 = docImageBase64.split(',')[1];
      
      const response = await fetch('/api/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfie: selfieBase64,
          idDocument: docBase64,
          userId: 'user123' // In a real app, this would be a real user ID
        })
      });
      
      const result = await response.json();
      setVerificationResult(result);
      setCurrentStep(STEPS.RESULT);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
      setCurrentStep(STEPS.RESULT);
    } finally {
      setIsProcessing(false);
    }
  };

  // Restart the verification process
  const handleRestart = () => {
    setSelfieImage(null);
    setDocumentImage(null);
    setVerificationResult(null);
    setError(null);
    setCurrentStep(STEPS.FACE_LIVENESS);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-md mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <Shield className="text-blue-600 w-8 h-8 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Identity Verification</h1>
        </div>
        <p className="text-gray-600">Secure verification using facial recognition technology</p>
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
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Identity</h2>
            <p className="text-gray-600 text-center">
              Please wait while we securely process your verification...
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
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by AWS Rekognition • Secure & Private</p>
      </footer>
    </div>
  );
}

export default App;