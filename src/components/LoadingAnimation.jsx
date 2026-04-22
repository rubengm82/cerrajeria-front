import { RiKeyFill } from "react-icons/ri";

function LoadingAnimation({ heightClass = "h-[calc(100vh-200px)]" }) {
  return (
    <div className={`flex items-center justify-center ${heightClass} w-full bg-transparent`}>
      <style>
        {`
          @keyframes spin-fast {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .animate-spin-fast {
            animation: spin-fast 1s linear infinite;
          }
          .animate-spin-reverse-fast {
            animation: spin-reverse 1.5s linear infinite;
          }
        `}
      </style>

      <div className="relative flex flex-col items-center justify-center">
        {/* Contenedor estático */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute overflow-visible">
            <defs>
              <linearGradient id="premium-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "rgb(235, 100, 0)", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "rgb(255, 190, 60)", stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            
            {/* Círculo de fondo sutil */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-orange-200/10" />

            {/* Círculo animado más rápido */}
            <circle 
              cx="50" cy="50" r="42" 
              fill="none" 
              stroke="url(#premium-gradient)" 
              strokeWidth="3" 
              strokeDasharray="120 144"
              strokeLinecap="round"
              className="animate-spin-reverse-fast"
              style={{ transformOrigin: 'center' }}
            />
          </svg>

          {/* Llave rotando en sentido horario */}
          <div className="animate-spin-fast flex items-center justify-center">
            <RiKeyFill 
              size={32} 
              style={{ 
                  fill: "url(#premium-gradient)",
                  filter: "drop-shadow(0 0 5px rgba(235, 100, 0, 0.3))"
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingAnimation;
