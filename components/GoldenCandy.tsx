
import React, { useEffect, useState } from 'react';
import { sounds } from '../services/soundService';

interface GoldenCandyProps {
  onCollect: () => void;
}

const GoldenCandy: React.FC<GoldenCandyProps> = ({ onCollect }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const spawn = () => {
      // Avoid edges and UI elements
      const x = 100 + Math.random() * (window.innerWidth - 200);
      const y = 150 + Math.random() * (window.innerHeight - 300);
      setPosition({ x, y });
      setIsVisible(true);
      sounds.playSuccess(); // Sparkle sound
      
      // Auto-hide after 12 seconds if not clicked
      setTimeout(() => setIsVisible(false), 12000);
    };

    // Random check every 30 seconds, 10% chance to spawn
    const interval = setInterval(() => {
      if (Math.random() < 0.1 && !isVisible) {
        spawn();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      onPointerDown={(e) => {
        e.stopPropagation();
        setIsVisible(false);
        onCollect();
      }}
      className="fixed z-[500] cursor-pointer group select-none touch-none"
      style={{ left: position.x, top: position.y }}
    >
      <div className="relative w-20 h-20 bg-gradient-to-tr from-yellow-600 via-yellow-300 to-white rounded-full shadow-[0_0_50px_rgba(250,204,21,0.9)] border-4 border-white flex items-center justify-center text-5xl group-hover:scale-125 group-active:scale-90 transition-transform duration-200">
        ✨
        <div className="absolute inset-0 bg-white/40 rounded-full animate-ping"></div>
        <div className="absolute -inset-2 rounded-full border-2 border-yellow-200 animate-[spin_4s_linear_infinite]"></div>
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-yellow-400 text-black font-black text-[10px] px-3 py-1 rounded-full whitespace-nowrap uppercase tracking-widest shadow-lg animate-bounce">
        Golden Bonus!
      </div>
    </div>
  );
};

export default GoldenCandy;
