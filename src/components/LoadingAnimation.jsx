import { RiKeyFill } from "react-icons/ri";

function LoadingAnimation({ heightClass = "h-[calc(100vh-200px)]" }) {
  return (
    <div className={`flex items-center justify-center ${heightClass} w-full`}>
      <style>
        {`
          @keyframes spin-fast {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.8; stroke-width: 3; }
            80%, 100% { transform: scale(1.6); opacity: 0; stroke-width: 1; }
          }
          .animate-spin-fast {
            animation: spin-fast 1.5s linear infinite;
          }
          .animate-pulse-ring {
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        `}
      </style>
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* SVG for Gradient and Pulse Circle */}
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute overflow-visible">
          <defs>
            <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "rgb(235, 100, 0)", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "rgb(255, 190, 60)", stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Pulsing Circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            fill="none" 
            stroke="url(#loading-gradient)" 
            className="animate-pulse-ring"
            style={{ transformOrigin: 'center' }}
          />
        </svg>

        {/* New Key Icon (RiKeyFill) - Faster rotation */}
        <div className="animate-spin-fast flex items-center justify-center">
          <RiKeyFill 
            size={36} 
            style={{ 
                fill: "url(#loading-gradient)",
                stroke: "url(#loading-gradient)",
                strokeWidth: 0.5
            }} 
          />
        </div>
      </div>
    </div>
  );
}

export default LoadingAnimation;
