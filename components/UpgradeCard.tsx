import React from 'react';
import { Upgrade } from '../types';
import { sounds } from '../services/soundService';

interface UpgradeCardProps {
  upgrade: Upgrade;
  count: number;
  canAfford: boolean;
  onBuy: () => void;
  isRevealed?: boolean;
  isMystery?: boolean; // New prop for Magic tab logic
}

const UpgradeCard: React.FC<UpgradeCardProps> = ({ upgrade, count, canAfford, onBuy, isRevealed = true, isMystery = false }) => {
  const currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, count));

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAfford && isRevealed) {
      sounds.playUISound();
      onBuy();
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
  };

  if (!isRevealed) {
    return (
      <div className="w-full h-32 bg-[#1a1a1a] border-b border-black/60 flex items-center opacity-40 grayscale">
        <div className="w-28 h-full flex items-center justify-center bg-black/40 border-r border-black/40">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center text-4xl">
            🔒
          </div>
        </div>
        <div className="flex-1 px-5">
          <h4 className="text-2xl font-black text-gray-600">Locked Mystery</h4>
          <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mt-1">
            Unlocks at {formatNumber(upgrade.unlockAt || 0)} 🍬
          </p>
        </div>
      </div>
    );
  }

  const bgColor = upgrade.color || '#5c5c5c';

  return (
    <div
      className={`
        w-full h-32 border-b border-white/5 flex items-center transition-all relative overflow-hidden group select-none
        ${!canAfford ? 'opacity-80 grayscale-[0.2]' : 'hover:brightness-110 active:scale-[0.98]'}
      `}
      style={{ background: `linear-gradient(135deg, ${bgColor}33 0%, ${bgColor}11 100%), #1a1a1a` }}
    >
      {/* Dynamic background shine */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

      {/* Decorative background element */}
      <div className="absolute -right-8 -bottom-8 opacity-10 text-9xl transform rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-500">
         {isMystery ? '❓' : upgrade.emoji}
      </div>

      {/* Left Image Section */}
      <div className="w-28 h-full flex items-center justify-center bg-black/20 border-r border-white/5 relative group-hover:bg-black/30 transition-colors">
        <div className={`
          w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-5xl bg-white/10 border border-white/10 z-10
        `}>
          {isMystery ? '❓' : upgrade.emoji}
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 px-5 py-2 flex flex-col justify-center overflow-hidden z-10 relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-black text-white drop-shadow-md truncate tracking-tight group-hover:text-pink-200 transition-colors">
            {isMystery ? '??? ???' : upgrade.name}
          </span>
          {count > 0 && !isMystery && (
            <span className="bg-white/10 border border-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black text-white uppercase tracking-tighter">
              x{count}
            </span>
          )}
        </div>
        <p className="text-[12px] text-gray-300 leading-snug line-clamp-2 font-medium opacity-80 italic max-w-[200px] drop-shadow-sm">
          {isMystery ? '"A cosmic secret yet to be uncovered by your sweetness..."' : `"${upgrade.description}"`}
        </p>
      </div>

      {/* Buy Button Section */}
      <div className="flex flex-col items-center justify-center pr-4 z-20">
        <button
          onClick={handleBuy}
          disabled={!canAfford}
          className={`
            w-32 py-4 rounded-2xl border-2 shadow-2xl flex flex-col items-center justify-center transition-all relative
            ${canAfford 
              ? 'bg-white text-black border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:-translate-y-0.5' 
              : 'bg-black/40 text-gray-500 border-white/10 cursor-not-allowed opacity-60'}
          `}
        >
          <span className="text-[10px] font-black uppercase tracking-widest mb-0.5">PURCHASE</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${canAfford ? 'animate-bounce' : 'opacity-50'}`}>🍬</span>
            <span className={`text-base font-black ${canAfford ? 'text-rose-600' : 'text-gray-400'}`}>
              {formatNumber(currentCost)}
            </span>
          </div>
          {canAfford && (
            <div className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default UpgradeCard;