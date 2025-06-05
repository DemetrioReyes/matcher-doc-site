import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowRight } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface FaceLivenessDetectorProps {
  onSuccess: (result: { livenessImage: ArrayBuffer }) => void;
}

const FaceLivenessDetector: React.FC<FaceLivenessDetectorProps> = ({ onSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [faceCentered, setFaceCentered] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [instructions, setInstructions] = useState('Click "Start" to begin face verification');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Cargar modelos de face-api.js
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (error) {
        console.error('Error al cargar modelos:', error);
      }
    };
    loadModels();

    return () => {
      // Limpiar modelos al desmontar
      if (modelsLoaded) {
        console.log('Disponiendo modelos de face-api.js...');
        faceapi.nets.tinyFaceDetector.dispose();
        console.log('Modelos de face-api.js dispuestos.');
      }
    };
  }, []);

  // Inicializar cámara
  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = 'none';
        
        // Esperar a que el video esté listo
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve(true);
            };
          }
        });

        setCameraActive(true);
        setInstructions('Position your face in front of the camera');
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setInstructions('Camera access denied. Please allow camera access and try again.');
      setIsCapturing(false);
    }
  };

  // Detectar rostro y verificar posición
  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
      return;
    }

    const video = videoRef.current;
    
    // Verificar si el video está listo
    if (video.readyState !== 4) {
      requestAnimationFrame(detectFace);
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      return;
    }

    try {
      // Configurar canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Detectar rostro
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 224,
          scoreThreshold: 0.01
        })
      );

      if (detections.length > 0) {
        const face = detections[0];
        
        if (!faceCentered) {
          setFaceCentered(true);
          setInstructions('Face detected! Hold still...');
          startCountdown();
        }
      } else {
        if (faceCentered) {
          setFaceCentered(false);
          setInstructions('Position your face in front of the camera');
        }
      }

      // Continuar detección
      requestAnimationFrame(detectFace);
    } catch (error) {
      console.error('Error en la detección facial:', error);
      // Continuar detección incluso si hay error
      requestAnimationFrame(detectFace);
    }
  };

  // Iniciar conteo regresivo
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

  // Capturar frame
  const captureFrame = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = async () => {
              if (reader.result instanceof ArrayBuffer) {
                onSuccess({ livenessImage: reader.result });
              }
            };
            reader.readAsArrayBuffer(blob);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  // Detener cámara
  const stopCamera = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setIsCapturing(false);
      // Disponer modelos después de detener la cámara si ya no se van a usar
      if (modelsLoaded) {
         console.log('Disponiendo modelos de face-api.js después de stopCamera...');
         faceapi.nets.tinyFaceDetector.dispose();
         console.log('Modelos de face-api.js dispuestos después de stopCamera.');
         // Añadir un pequeño retraso para asegurar la limpieza antes de cambiar de componente
         await new Promise(resolve => setTimeout(resolve, 500)); // Espera 500ms
      }
    }
  };

  // Iniciar detección facial cuando la cámara esté activa
  useEffect(() => {
    if (cameraActive && modelsLoaded) {
      detectFace();
    }
  }, [cameraActive, modelsLoaded]);

  // Limpiar al desmontar
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