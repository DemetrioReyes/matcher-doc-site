import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Camera } from 'lucide-react';

interface DocumentCaptureProps {
  onCapture: (base64Image: string) => void;
}

const DocumentCapture: React.FC<DocumentCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        console.log('Camera started in DocumentCapture.');
      }
    } catch (err) {
      console.error('Error accessing camera in DocumentCapture:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setCameraActive(false);
    console.log('Camera stopped in DocumentCapture.');
  };

  const analyzeFrame = async () => {
    console.log(`analyzeFrame - Camera Active State: ${cameraActive}, Video ReadyState: ${videoRef.current?.readyState}, Captured Image: ${!!capturedImage}, Processing: ${processing}`);

    if (!videoRef.current || !canvasRef.current || capturedImage || processing || videoRef.current.readyState !== 4) {
      console.log(`analyzeFrame - Condition failed/Video not ready. Video ReadyState: ${videoRef.current?.readyState}, Camera State: ${cameraActive}, Captured: ${!!capturedImage}, Processing: ${processing}`);

      if (videoRef.current && canvasRef.current && !capturedImage && !processing && (videoRef.current.readyState < 4 || !cameraActive)) {
         console.log('Video not ready or camera not active, attempting to start/verify...');
      }
      return;
    }

    console.log('Video ready, analyzing frame for OCR...');

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (!context || !videoRef.current.videoWidth || !videoRef.current.videoHeight) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setProcessing(true);
    try {
      const result = await Tesseract.recognize(imageDataUrl, 'spa', {
        logger: (m) => console.log(m),
      });

      const text = result.data.text.toUpperCase();
      console.log('OCR Text:', text);

      if (
        text.includes('REPUBLICA') ||
        text.includes('DOMINICANA') ||
        text.includes('CEDULA') ||
        text.includes('IDENTIDAD')
      ) {
        console.log('Keyword detected. Capturing...');
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    } catch (err) {
      console.error('OCR error:', err);
    }
    setProcessing(false);
  };

  useEffect(() => {
    startCamera();

    const interval = setInterval(analyzeFrame, 2000);

    return () => {
      clearInterval(interval);
      stopCamera();
    };
  }, []);

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
    console.log('Retake photo - Camera restarted.');
  };

  const submitDocument = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      console.log('Submit document - Image sent.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold text-gray-700 mb-2">Scan your ID</h2>

      <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`}
        />
        {capturedImage && (
          <img src={capturedImage} alt="Captured ID" className="w-full h-full object-contain" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <p className="text-center text-sm mt-3 text-gray-600">
        {capturedImage
          ? 'Document automatically captured.'
          : 'Keep your ID visible. A photo will be taken automatically.'}
      </p>

      {capturedImage && (
        <div className="flex space-x-4 mt-4">
          <button
            onClick={retakePhoto}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            Retake
          </button>
          <button
            onClick={submitDocument}
            className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentCapture;
