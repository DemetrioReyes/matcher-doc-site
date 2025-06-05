import React, { useState, useRef, useEffect } from 'react';
import { Camera, FileCheck } from 'lucide-react';

interface DocumentCaptureProps {
  onCapture: (base64Image: string) => void;
}

const DocumentCapture: React.FC<DocumentCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      // Try to use environment camera (back camera) for document capture
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      
      // Fallback to any available camera if environment camera fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          setCameraActive(true);
        }
      } catch (fallbackErr) {
        console.error('Failed to access any camera:', fallbackErr);
      }
    }
  };

  // Capture document image
  const captureDocument = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get base64 image data
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Submit captured document
  const submitDocument = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  // Retake the photo
  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Start camera automatically when component mounts
  useEffect(() => {
    startCamera();
    
    // Clean up on unmount
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">ID Document Capture</h2>
      
      <div className="relative mx-auto w-full max-w-sm aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
        {/* Document guide overlay */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="w-full h-full border-2 border-dashed border-blue-500 flex items-center justify-center">
              <div className="bg-blue-500 bg-opacity-20 w-4/5 h-3/5 rounded-lg"></div>
            </div>
          </div>
        )}
        
        {/* Video element */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className={`w-full h-full object-cover ${!cameraActive || capturedImage ? 'hidden' : ''}`}
        />
        
        {/* Captured image preview */}
        {capturedImage && (
          <img 
            src={capturedImage} 
            alt="Captured ID document" 
            className="w-full h-full object-contain"
          />
        )}
        
        {/* Placeholder when no camera or image */}
        {!cameraActive && !capturedImage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Camera className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">Camera initializing...</p>
          </div>
        )}
        
        {/* Hidden canvas for capturing frames */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <p className="text-gray-600 text-center mb-6">
        {capturedImage 
          ? 'Review your document. Is it clearly visible?' 
          : 'Position your ID document within the blue outline and ensure it\'s fully visible and well-lit.'}
      </p>
      
      {!capturedImage ? (
        <button
          onClick={captureDocument}
          disabled={!cameraActive}
          className={`w-full py-3 px-4 font-medium rounded-lg flex items-center justify-center ${
            cameraActive 
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-600'
          } transition-colors`}
        >
          <Camera className="w-5 h-5 mr-2" />
          Capture Document
        </button>
      ) : (
        <div className="flex space-x-4">
          <button
            onClick={retakePhoto}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 font-medium rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Camera className="w-5 h-5 mr-2" />
            Retake
          </button>
          <button
            onClick={submitDocument}
            className="flex-1 py-3 px-4 bg-green-600 text-white font-medium rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
          >
            <FileCheck className="w-5 h-5 mr-2" />
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentCapture;