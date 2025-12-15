import React, { useState, useEffect } from 'react';
import { sounds } from '../services/soundService';

interface CandyMainProps {
  onClick: (e: React.PointerEvent) => void;
  isWarning?: boolean;
  skin?: string;
  magicWandCount?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  angle: number;
  distance: number;
  rotation: number;
}

const CANDY_PARTICLES = ['🍬', '🍭', '🍩', '🍫', '🧁', '🍪', '🍮', '🍨', '🍒', '🍓', '✨'];

const CandyMain: React.FC<CandyMainProps> = ({ onClick, skin = '🍬', magicWandCount = 0 }) => {
  const [isTapping, setIsTapping] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [orbitalRotation, setOrbitalRotation] = useState(0);

  // Smooth orbital animation for magic wands
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      setOrbitalRotation(prev => (prev + 0.8) % 360);
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsTapping(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = width / 2;

    if (distance > radius * 0.7) {
      sounds.playEdgeType();
    } else {
      sounds.playType();
    }
    
    const globalX = e.clientX;
    const globalY = e.clientY;
    const clickId = Date.now();
    
    setRipples(prev => [...prev, { id: clickId, x, y }]);
    
    const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
      id: clickId + i,
      x: globalX,
      y: globalY,
      emoji: CANDY_PARTICLES[Math.floor(Math.random() * CANDY_PARTICLES.length)],
      angle: (Math.random() * Math.PI) + Math.PI,
      distance: 100 + Math.random() * 150,
      rotation: Math.random() * 720
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    
    onClick(e);
    
    setTimeout(() => setIsTapping(false), 80);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== clickId));
    }, 500);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1500);
  };

  // Logic to determine how many wands to show (cap at 12 for visual clarity)
  const visibleWandCount = Math.min(magicWandCount, 12);

  return (
    <div className="relative flex items-center justify-center w-full h-full select-none overflow-visible">
      {/* Ambient Glow */}
      <div className="absolute w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-[140px] pointer-events-none bg-pink-500/20" />
      
      {/* Orbital Container for Magic Wands */}
      {magicWandCount > 0 && (
        <div 
          className="absolute z-30 pointer-events-none"
          style={{ 
            width: '100%', 
            height: '100%',
            transform: `rotate(${orbitalRotation}deg)`
          }}
        >
          {Array.from({ length: visibleWandCount }).map((_, idx) => {
            const angle = (idx / visibleWandCount) * 360;
            // Radius slightly larger than the candy (approx 350-400px)
            const radius = window.innerWidth < 768 ? 160 : 380;
            return (
              <div 
                key={`wand-${idx}`}
                className="absolute text-3xl md:text-5xl drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `
                    translate(-50%, -50%) 
                    rotate(${angle}deg) 
                    translateY(-${radius}px) 
                    rotate(-${angle + orbitalRotation}deg)
                  `
                }}
              >
                🪄
              </div>
            );
          })}
        </div>
      )}

      {/* The Candy */}
      <div
        onPointerDown={handlePointerDown}
        className={`
          relative w-[22rem] h-[22rem] md:w-[650px] md:h-[650px] rounded-full cursor-pointer
          transition-all duration-75 spring-active
          flex flex-col items-center justify-center
          shadow-[0_40px_100px_rgba(244,63,94,0.4)]
          bg-pink-500 border-[14px] border-white/20
          ${isTapping ? 'scale-95' : 'scale-100'}
          z-20
        `}
        style={{
          backgroundImage: `radial-gradient(circle at 30% 30%, #f472b6, #db2777)`,
        }}
      >
        <span className="text-[160px] md:text-[320px] select-none filter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] animate-[wiggle_3s_ease-in-out_infinite] opacity-95">
          {skin}
        </span>

        <div className="absolute top-[12%] left-[12%] w-[35%] h-[18%] bg-white/40 rounded-full blur-2xl rotate-[-35deg] pointer-events-none" />
        <div className="absolute bottom-[15%] right-[20%] w-[10%] h-[10%] bg-white/20 rounded-full blur-xl pointer-events-none" />
        
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="absolute rounded-full bg-white/40 pointer-events-none animate-[ping_0.4s_ease-out_forwards]"
            style={{
              left: ripple.x - 60,
              top: ripple.y - 60,
              width: 120,
              height: 120
            }}
          />
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none z-[160]">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute text-2xl md:text-5xl"
            style={{
              left: p.x,
              top: p.y,
              transform: `translate(-50%, -50%)`,
              '--tw-translate-x': `${Math.cos(p.angle) * p.distance}px`,
              '--tw-translate-y': `${Math.sin(p.angle) * p.distance}px`,
              '--tw-rotate': `${p.rotation}deg`,
              animation: 'candy-fall 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
            } as any}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes candy-fall {
          0% { 
            transform: translate(-50%, -50%) scale(0.4) rotate(0deg); 
            opacity: 1;
          }
          30% {
            transform: translate(calc(-50% + var(--tw-translate-x)), calc(-50% + var(--tw-translate-y))) scale(1.4) rotate(45deg);
            opacity: 1;
          }
          100% { 
            transform: translate(calc(-50% + var(--tw-translate-x) * 1.5), calc(-50% + var(--tw-translate-y) + 800px)) scale(0.8) rotate(var(--tw-rotate));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CandyMain;