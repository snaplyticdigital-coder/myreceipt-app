import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, Zap, ZapOff, Image as ImageIcon, Camera } from 'lucide-react';

interface CameraScannerProps {
    onCapture: (imageSrc: string) => void;
    onClose: () => void;
    onGalleryClick: () => void;
}

export function CameraScanner({ onCapture, onClose, onGalleryClick }: CameraScannerProps) {
    const webcamRef = useRef<Webcam>(null);
    const [flash, setFlash] = useState(false);

    // Camera constraints - try to use back camera
    const videoConstraints = {
        facingMode: { exact: "environment" }
    };



    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            onCapture(imageSrc);
        }
    }, [webcamRef, onCapture]);

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
            {/* Header Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-[env(safe-area-inset-top)] flex items-center justify-between z-20 text-white">
                <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md rounded-full">
                    <X size={24} />
                </button>
                <span className="font-semibold text-lg">Scan Receipt</span>
                <div className="flex gap-4">
                    <button onClick={() => setFlash(!flash)} className="p-2 bg-black/20 backdrop-blur-md rounded-full">
                        {flash ? <Zap size={24} className="text-yellow-400" /> : <ZapOff size={24} />}
                    </button>
                    <button onClick={onGalleryClick} className="p-2 bg-black/20 backdrop-blur-md rounded-full">
                        <ImageIcon size={24} />
                    </button>
                </div>
            </div>

            {/* Webcam View */}
            <div className="relative flex-1 bg-black overflow-hidden">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="absolute inset-0 w-full h-full object-cover"
                    onUserMediaError={() => {
                        console.warn("Back camera not available, falling back");
                        // Ideally we'd retry with fallback, but react-webcam simple handling:
                        // Just let it fail or use default. 
                    }}
                />

                {/* Scrim / Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="w-full h-full bg-black/30 mask-scanner" />
                </div>

                {/* Scanner Frame */}
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="w-[80%] aspect-[3/4] relative rounded-3xl overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                        {/* Corner Markers */}
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-cyan-400 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-cyan-400 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-cyan-400 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-cyan-400 rounded-br-xl" />

                        {/* Scanning Line Animation */}
                        <div className="absolute inset-x-0 h-0.5 bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,1)] animate-scan-y top-0" />
                    </div>
                </div>

                {/* Helper Text */}
                <div className="absolute bottom-32 left-0 right-0 text-center z-20">
                    <p className="text-white/90 text-sm font-medium drop-shadow-md bg-black/20 backdrop-blur px-4 py-2 rounded-full inline-block">
                        Align receipt within frame
                    </p>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="h-32 bg-black flex items-center justify-center pb-[env(safe-area-inset-bottom)] z-20">
                <button
                    onClick={capture}
                    className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
                >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                        <Camera className="text-black" size={32} />
                    </div>
                </button>
            </div>
        </div>
    );
}
