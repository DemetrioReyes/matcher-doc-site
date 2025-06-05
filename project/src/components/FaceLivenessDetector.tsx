import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowRight } from 'lucide-react';

interface FaceLivenessDetectorProps {
  onSuccess: (result: { livenessImage: ArrayBuffer }) => void;
}

// In a real implementation, this would use the AWS Amplify Face Liveness component
// For this POC, we're simulating the liveness detection
const FaceLivenessDetector: React.FC<FaceLivenessDetectorProps> = ({ onSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [faceCentered, setFaceCentered] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [instructions, setInstructions] = useState('Click "Start" to begin face verification');

  // Initialize camera
  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        
        // Simulate face detection process
        setTimeout(() => {
          setInstructions('Position your face within the oval');
          setTimeout(() => {
            setFaceCentered(true);
            setInstructions('Face detected! Hold still...');
            startCountdown();
          }, 2000);
        }, 1500);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setInstructions('Camera access denied. Please allow camera access and try again.');
      setIsCapturing(false);
    }
  };

  // Simulate countdown for capture
  const startCountdown = () => {
    let count = 3;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(timer);
        captureFrame();
      }
    }, 1000);
  };

  // Capture video frame
  const captureFrame = () => {
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
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Convert blob to ArrayBuffer
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result instanceof ArrayBuffer) {
                // Stop camera
                stopCamera();
                
                // Pass the captured frame to parent component
                onSuccess({ livenessImage: reader.result });
              }
            };
            reader.readAsArrayBuffer(blob);
          }
        }, 'image/jpeg', 0.95);
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
      setIsCapturing(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Face Verification</h2>
      
      <div className="relative mx-auto w-full max-w-sm aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
        {/* Face oval guide */}
        {cameraActive && (
          <div className={`absolute inset-0 flex items-center justify-center z-10 pointer-events-none transition-opacity duration-300 ${faceCentered ? 'opacity-100' : 'opacity-60'}`}>
            <div className={`w-48 h-64 border-4 rounded-full ${faceCentered ? 'border-green-500' : 'border-gray-400'}`}></div>
          </div>
        )}
        
        {/* Countdown overlay */}
        {faceCentered && countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{countdown}</span>
            </div>
          </div>
        )}
        
        {/* Video element */}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline
          muted
          className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
        />
        
        {/* Placeholder when camera is off */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Camera className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">Camera will appear here</p>
          </div>
        )}
        
        {/* Hidden canvas for capturing frames */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <p className="text-gray-600 text-center mb-6">{instructions}</p>
      
      {!isCapturing ? (
        <button
          onClick={startCamera}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <Camera className="w-5 h-5 mr-2" />
          Start Verification
        </button>
      ) : (
        <button
          disabled
          className="w-full py-3 px-4 bg-gray-300 text-gray-600 font-medium rounded-lg flex items-center justify-center"
        >
          <ArrowRight className="w-5 h-5 mr-2" />
          Verifying...
        </button>
      )}
    </div>
  );
};

export default FaceLivenessDetector;