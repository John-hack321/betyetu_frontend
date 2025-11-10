// src/app/components/QRCodeScanner.tsx
'use client'
import { useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { useQrScanner } from '../hooks/useScanner';

interface QRCodeScannerProps {
  onCodeScanned: (code: string) => void;
  onClose: () => void;
}

export default function QRCodeScanner({ onCodeScanned, onClose }: QRCodeScannerProps) {
  const {
    videoRef,
    canvasRef,
    isScanning,
    scannedCode,
    error,
    startScanning,
    stopScanning
  } = useQrScanner();

  // Start scanning when component mounts
  useEffect(() => {
    startScanning();
    
    // Cleanup when component unmounts
    return () => {
      stopScanning();
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Handle successful scan
  useEffect(() => {
    if (scannedCode) {
      onCodeScanned(scannedCode);
      // Small delay before closing to show success
      setTimeout(() => {
        stopScanning();
        onClose();
      }, 800);
    }
  }, [scannedCode, onCodeScanned, onClose, stopScanning]);

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background-blue">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-lightblue-components">
        <h2 className="text-xl font-bold text-white">Scan QR Code</h2>
        <button
          onClick={handleClose}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X size={24} className="text-white" />
        </button>
      </div>

      {/* Main Scanner Area */}
      <div className="flex flex-col items-center justify-center h-full px-4">
        
        {/* Video Preview */}
        <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden bg-black">
          {/* Camera feed */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          
          {/* Hidden canvas for frame analysis */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />

          {/* Scanning overlay with corners */}
          {isScanning && !error && !scannedCode && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              
              {/* Scanning frame */}
              <div className="relative w-64 h-64">
                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-components" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-components" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-components" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-components" />
                
                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-full h-1 bg-yellow-components animate-scan" />
                </div>
              </div>
            </div>
          )}

          {/* Success indicator */}
          {scannedCode && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-components bg-opacity-90">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-4xl">✓</span>
                </div>
                <p className="text-white text-lg font-semibold">Code Scanned!</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions or Error */}
        <div className="mt-6 text-center max-w-md">
          {error ? (
            <div className="p-4 bg-red-500 bg-opacity-20 rounded-lg border border-red-500">
              <p className="text-red-400 text-sm mb-3">{error}</p>
              <button
                onClick={startScanning}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : isScanning && !scannedCode ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Camera className="text-yellow-components animate-pulse" size={20} />
                <p className="text-white text-sm">Position QR code within frame</p>
              </div>
              <p className="text-gray-400 text-xs">
                The camera will automatically detect the code
              </p>
            </div>
          ) : !isScanning && !scannedCode && !error ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-components" />
              <p className="text-white text-sm">Starting camera...</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(256px);
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}