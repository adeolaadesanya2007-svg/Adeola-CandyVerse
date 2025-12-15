
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UPGRADES, ACHIEVEMENTS, INITIAL_STATE, GRANNY_NAMES, GRANNY_PHRASES, ADE_PHRASES, PLAYER_NAMES, SOCIAL_CONVERSATIONS } from './constants';
import { GameState, GrannyInstance, DeviceMode } from './types';
import CandyMain from './components/CandyMain';
import UpgradeCard from './components/UpgradeCard';
import GoldenCandy from './components/GoldenCandy';
import { sounds } from './services/soundService';

type AppTab = 'candy' | 'shop' | 'magic' | 'stats' | 'fun';

const MILESTONES = [
  { threshold: 100, type: 'clicks', msg: "COSMIC SENSORS: ANOMALY DETECTED. SUGAR LEVELS RISING." },
  { threshold: 1000, type: 'total', msg: "U ARE CLOSE TO DEFEATING THE GOBLINS AND SAVING THE UNIVERSE." },
  { threshold: 1000, type: 'clicks', msg: "COSMIC DATA: THE VOID IS TREMBLING. REALITY RE-WEAVING IN PROGRESS..." },
  { threshold: 5000, type: 'total', msg: "SYSTEM ALERT: THE SOUR DIMENSION IS IN FULL RETREAT." },
  { threshold: 1000, type: 'total', msg: "ENERGY UPDATE: THE COSMIC ENGINE IS PURRING. UNIVERSE STABILIZING." },
  { threshold: 50000, type: 'total', msg: "GOBLIN COMMANDER DETECTED. PREPARING SUGAR BOMBARDMENT..." },
  { threshold: 100000, type: 'total', msg: "SECTOR SECURED: THE GOBLINS HAVE FLED TO THE 5TH DIMENSION." },
  { threshold: 1000000, type: 'total', msg: "CONFECTIONARY GOD DETECTED: THE UNIVERSE IS SAFE UNDER YOUR RULE." }
];

const CANDY_SKINS = ['🍬', '🍭', '🍩', '🍫', '🧁', '🍪', '🍮', '🍨', '🍯', '🍒', '🍓', '🍑', '🌌', '✨'];

const App: React.FC = () => {
  const [offlineReport, setOfflineReport] = useState<{ candies: number; timeStr: string } | null>(null);
  const [cosmicAlert, setCosmicAlert] = useState<string | null>(null);
  const [seenMilestones, setSeenMilestones] = useState<number[]>([]);
  const [isAscendingEffect, setIsAscendingEffect] = useState(false);

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('candy_crusher_restored_save');
    if (saved) {
      try {
        const parsed: GameState = JSON.parse(saved);
        if (parsed.hasSeenIntro) {
          const now = Date.now();
          const diffMs = now - parsed.lastSaved;
          const diffSec = diffMs / 1000;
          const cps = UPGRADES.reduce((acc, up) => up.type === 'cps' ? acc + (parsed.upgrades[up.id] || 0) * up.value : acc, 0);

          if (diffSec > 10 && cps > 0) {
            const earned = Math.floor(cps * diffSec);
            let timeStr = diffSec < 60 ? `${Math.floor(diffSec)}s` : diffSec < 3600 ? `${Math.floor(diffSec / 60)}m ${Math.floor(diffSec % 60)}s` : `${Math.floor(diffSec / 3600)}h ${Math.floor((diffSec % 3600) / 60)}m`;
            setTimeout(() => setOfflineReport({ candies: earned, timeStr }), 1000);
            return { ...parsed, candyCount: parsed.candyCount + earned, totalCandies: parsed.totalCandies + earned, isCoreAwakened: true, lastSaved: now };
          }
          return { ...parsed, isCoreAwakened: true, lastSaved: now };
        }
        return parsed;
      } catch (e) { return INITIAL_STATE; }
    }
    return INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState<AppTab>('candy');
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number; val: number; color?: string }[]>([]);
  const [showSurrender, setShowSurrender] = useState(false);
  const [isConfirmingSurrender, setIsConfirmingSurrender] = useState(false);
  const [isConfirmingAscension, setIsConfirmingAscension] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [typedReady, setTypedReady] = useState("");
  const [showIntroButton, setShowIntroButton] = useState(false);
  const [isWarningStage, setIsWarningStage] = useState(false);
  const [warningClicks, setWarningClicks] = useState(0);
  const [shake, setShake] = useState(false);
  const [showWelcomeText, setShowWelcomeText] = useState(false);
  const [adePhraseIndex, setAdePhraseIndex] = useState(0);

  const boundaries = useMemo(() => {
    const modes = {
      phone: { x: 40, top: 180, bottom: 200 },
      tablet: { x: 80, top: 160, bottom: 180 },
      laptop: { x: 140, top: 160, bottom: 180 }
    };
    return modes[gameState.deviceMode || 'phone'];
  }, [gameState.deviceMode]);

  const getPrestigeMultiplier = useCallback(() => 1 + (gameState.prestigeLevel * 0.1), [gameState.prestigeLevel]);

  const getCps = useCallback(() => {
    const baseCps = UPGRADES.reduce((acc, up) => up.type === 'cps' ? acc + (gameState.upgrades[up.id] || 0) * up.value : acc, 0);
    return baseCps * getPrestigeMultiplier();
  }, [gameState.upgrades, getPrestigeMultiplier]);

  const getCpc = useCallback(() => {
    const baseCpc = 1 + UPGRADES.reduce((acc, up) => up.type === 'cpc' ? acc + (gameState.upgrades[up.id] || 0) * up.value : acc, 0);
    return baseCpc * getPrestigeMultiplier();
  }, [gameState.upgrades, getPrestigeMultiplier]);

  // Fix: Explicitly type the reduce arguments (a: number, b: number) to avoid operator '+' cannot be applied to unknown error
  const totalUpgradeCount = useMemo(() => Object.values(gameState.upgrades).reduce((a: number, b: number) => a + b, 0), [gameState.upgrades]);
  const canAscend = totalUpgradeCount >= 500 || gameState.totalCandies >= 10000000;

  const getSafeTarget = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const avoidR = Math.min(width, height) * 0.35;

    let tx, ty;
    let attempts = 0;
    while (attempts < 1000) {
      tx = boundaries.x + Math.random() * (width - boundaries.x * 2);
      ty = boundaries.top + Math.random() * (height - boundaries.top - boundaries.bottom);
      const dx = tx - centerX;
      const dy = ty - centerY;
      const distToCenterSq = dx * dx + dy * dy;
      if (distToCenterSq > Math.pow(avoidR, 2)) break;
      attempts++;
    }
    return { tx: tx!, ty: ty! };
  }, [boundaries]);

  useEffect(() => {
    localStorage.setItem('candy_crusher_restored_save', JSON.stringify(gameState));
    MILESTONES.forEach((m, idx) => {
      if (seenMilestones.includes(idx)) return;
      const val = m.type === 'clicks' ? gameState.clicks : gameState.totalCandies;
      if (val >= m.threshold) {
        setSeenMilestones(prev => [...prev, idx]);
        setCosmicAlert(m.msg);
        sounds.playSuccess();
        setTimeout(() => setCosmicAlert(null), 6000); 
      }
    });
  }, [gameState.clicks, gameState.totalCandies, seenMilestones]);

  useEffect(() => {
    if (gameState.hasSeenIntro || !isAudioInitialized) return;
    setTypedReady(""); setShowIntroButton(false);
    const fullReady = "Are You Ready To Save The Universe?";
    let readyTimer: any;
    const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 30); };
    
    const typeReady = (i: number) => {
      if (i <= fullReady.length) {
        setTypedReady(fullReady.substring(0, i));
        sounds.playTypewriter(true); triggerShake();
        readyTimer = setTimeout(() => typeReady(i + 1), 120);
      } else {
        setShowIntroButton(true);
      }
    };
    
    const startDelay = setTimeout(() => typeReady(1), 500);
    return () => { clearTimeout(startDelay); clearTimeout(readyTimer); };
  }, [gameState.hasSeenIntro, isAudioInitialized]);

  useEffect(() => {
    if (!gameState.isCoreAwakened || !gameState.hasSeenIntro) return;
    const interval = setInterval(() => {
      const cps = getCps();
      setGameState(prev => {
        let newCount = prev.candyCount + (cps / 10);
        let newTotal = prev.totalCandies + (cps / 10);
        const newlyUnlockedIds = ACHIEVEMENTS.filter(a => !prev.unlockedAchievements.includes(a.id) && a.condition(prev)).map(a => a.id);
        if (newlyUnlockedIds.length > 0) sounds.playSuccess();
        const nextUnlocked = [...prev.unlockedAchievements, ...newlyUnlockedIds];

        const updatedGrannies = prev.grannyInstances.map((g, idx) => {
          let dx = g.targetX - g.x;
          let dy = g.targetY - g.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 10) {
            const target = getSafeTarget();
            let newSpeech = null;
            
            const socialChance = Math.random();
            if (socialChance < 0.04 && prev.grannyInstances.length > 1) {
              const otherIdx = (idx + 1) % prev.grannyInstances.length;
              const convo = SOCIAL_CONVERSATIONS[Math.floor(Math.random() * SOCIAL_CONVERSATIONS.length)];
              newSpeech = convo[0];
              
              setTimeout(() => {
                setGameState(curr => ({
                  ...curr,
                  grannyInstances: curr.grannyInstances.map((item, i) => i === otherIdx ? { ...item, speech: convo[1] } : item)
                }));
              }, 2000);
            }

            if (!newSpeech && Math.random() < 0.03) {
              newSpeech = GRANNY_PHRASES[Math.floor(Math.random() * GRANNY_PHRASES.length)].replace('{name}', prev.playerName);
            }

            if (newSpeech) {
              setTimeout(() => {
                setGameState(curr => ({ ...curr, grannyInstances: curr.grannyInstances.map(item => item.id === g.id ? { ...item, speech: null } : item) }));
              }, 6000);
            }

            return { ...g, targetX: target.tx, targetY: target.ty, speech: newSpeech };
          }

          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const avoidR = Math.min(window.innerWidth, window.innerHeight) * 0.35;
          
          let nextX = g.x + (dx / dist) * 1.6;
          let nextY = g.y + (dy / dist) * 1.6;

          const distNext = Math.sqrt(Math.pow(nextX - centerX, 2) + Math.pow(nextY - centerY, 2));
          if (distNext < avoidR) {
             const pushAngle = Math.atan2(nextY - centerY, nextX - centerX);
             nextX = centerX + Math.cos(pushAngle) * avoidR;
             nextY = centerY + Math.sin(pushAngle) * avoidR;
          }

          if (nextX < boundaries.x) nextX = boundaries.x;
          if (nextX > window.innerWidth - boundaries.x) nextX = window.innerWidth - boundaries.x;
          if (nextY < boundaries.top) nextY = boundaries.top;
          if (nextY > window.innerHeight - boundaries.bottom) nextY = window.innerHeight - boundaries.bottom;

          return { ...g, x: nextX, y: nextY };
        });

        return { ...prev, candyCount: newCount, totalCandies: newTotal, unlockedAchievements: nextUnlocked, grannyInstances: updatedGrannies, lastSaved: Date.now() };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [getCps, getSafeTarget, gameState.isCoreAwakened, gameState.hasSeenIntro, gameState.playerName, boundaries]);

  const handleCandyClick = (e: React.PointerEvent) => {
    const cpc = getCpc();
    setGameState(prev => ({ ...prev, candyCount: prev.candyCount + cpc, totalCandies: prev.totalCandies + cpc, clicks: prev.clicks + 1 }));
    const id = Date.now();
    setFloatingTexts(prev => [...prev, { id, x: e.clientX, y: e.clientY, val: cpc }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 800);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const count = gameState.upgrades[upgradeId] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, count));
    if (gameState.candyCount >= cost) {
      setGameState(prev => {
        const nextUpgrades = { ...prev.upgrades, [upgradeId]: (prev.upgrades[upgradeId] || 0) + 1 };
        const nextState = { ...prev, candyCount: prev.candyCount - cost, upgrades: nextUpgrades };
        if (upgrade.isGranny) {
          sounds.playFairySpawn();
          const target = getSafeTarget();
          const fairyName = GRANNY_NAMES[Math.floor(Math.random() * GRANNY_NAMES.length)];
          const fairyAge = 100 + Math.floor(Math.random() * 5000);
          
          const greeting = Math.random() > 0.5 ? "Hello" : "Hey";
          const chosenIntro = `${greeting}, I'm ${fairyName}... and ${fairyAge} years old!`;

          const newGranny: GrannyInstance = { 
            id: `fairy-${Date.now()}`, 
            name: fairyName, 
            age: fairyAge, 
            x: window.innerWidth / 2, 
            y: window.innerHeight / 2, 
            targetX: target.tx, 
            targetY: target.ty, 
            speech: chosenIntro,
            speechType: 'intro', 
            emoji: upgrade.emoji 
          };
          nextState.grannyInstances = [...prev.grannyInstances, newGranny];
          setTimeout(() => {
            setGameState(curr => ({ ...curr, grannyInstances: curr.grannyInstances.map(g => g.id === newGranny.id ? { ...g, speech: null } : g) }));
          }, 6000);
        }
        return nextState;
      });
      sounds.playUISound();
    }
  };

  const handleAscension = () => {
    if (!canAscend) return;
    setIsConfirmingAscension(true);
    sounds.playUISound();
  };

  const confirmAscension = () => {
    setIsAscendingEffect(true);
    sounds.playSuccess();
    
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        candyCount: 0,
        upgrades: {},
        grannyInstances: [],
        clicks: 0,
        prestigeLevel: prev.prestigeLevel + 1,
        lastSaved: Date.now()
      }));
      setIsConfirmingAscension(false);
      setActiveTab('candy');
      
      setTimeout(() => {
        setIsAscendingEffect(false);
      }, 1000);
    }, 1500);
  };

  const setDeviceMode = (mode: DeviceMode) => {
    setGameState(prev => ({ ...prev, deviceMode: mode }));
    sounds.playUISound();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setGameState(prev => ({ ...prev, playerName: e.target.value.substring(0, 20) }));
  const handleInitializeAudio = () => { sounds.init(); setIsAudioInitialized(true); sounds.playTypewriter(false); };
  const handleIntroYes = () => { setIsWarningStage(true); sounds.playScaryTypewriter(); if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]); };
  
  const handleWarningClick = () => {
    setWarningClicks(prev => {
      const next = prev + 1; 
      setShake(true); 
      setTimeout(() => setShake(false), 50); 
      sounds.playTypewriter(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(40);
      if (next >= 20) completeAwakening();
      return next;
    });
  };

  const completeAwakening = () => { sounds.playSuccess(); setGameState(prev => ({ ...prev, hasSeenIntro: true, isCoreAwakened: true })); setIsWarningStage(false); setShowWelcomeText(true); setTimeout(() => setShowWelcomeText(false), 3000); if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50, 200]); };
  const handleSurrender = () => { setIsConfirmingSurrender(true); sounds.playUISound(); };
  const confirmSurrender = () => {
    setShowSurrender(true); sounds.playScaryTypewriter();
    setTimeout(() => { 
      localStorage.removeItem('candy_crusher_restored_save');
      setTypedReady(""); setShowIntroButton(false); setIsWarningStage(false); setWarningClicks(0); setIsConfirmingSurrender(false); setShowSurrender(false); setShowWelcomeText(false); setActiveTab('candy');
      setGameState({ ...INITIAL_STATE, playerName: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)] });
    }, 2000); 
  };
  const changeSkin = (skin: string) => { setGameState(prev => ({ ...prev, candySkin: skin })); sounds.playSuccess(); };
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toLocaleString();
  };

  const dismissSpeech = (fairyId: string) => {
    setGameState(prev => ({
      ...prev,
      grannyInstances: prev.grannyInstances.map(g => 
        g.id === fairyId ? { ...g, speech: null } : g
      )
    }));
    sounds.playUISound();
  };

  const triggerManualIntro = (fairy: GrannyInstance) => {
    const greeting = Math.random() > 0.5 ? "Hello" : "Hey";
    const chosenIntro = `${greeting}, I'm ${fairy.name}... and ${fairy.age} years old!`;
    setGameState(prev => ({
      ...prev,
      grannyInstances: prev.grannyInstances.map(g => 
        g.id === fairy.id ? { ...g, speech: chosenIntro } : g
      )
    }));
    sounds.playFairySpawn();
    setTimeout(() => {
      setGameState(curr => ({ ...curr, grannyInstances: curr.grannyInstances.map(g => g.id === fairy.id ? { ...g, speech: null } : g) }));
    }, 5000);
  };

  if (!gameState.hasSeenIntro) {
    if (!isAudioInitialized) {
      return (
        <div className="fixed inset-0 bg-black flex items-center justify-center p-8 text-center" style={{ background: 'radial-gradient(circle, #0f172a, #000)' }}>
          <button onClick={handleInitializeAudio} className="group relative px-12 py-6 bg-transparent border-2 border-white/20 rounded-full overflow-hidden transition-all hover:border-pink-500 hover:scale-105">
            <div className="absolute inset-0 bg-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-white font-black uppercase tracking-[0.5em] text-xl md:text-2xl drop-shadow-lg">AWAKEN SYSTEM</span>
          </button>
        </div>
      );
    }
    if (isWarningStage) {
      return (
        <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black overflow-hidden select-none transition-transform duration-75 ${shake ? 'translate-x-2 translate-y-2' : ''}`}>
          <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none"></div>
          <div className="z-10 flex flex-col items-center text-center px-6">
            <h2 className="text-red-600 font-black text-5xl md:text-[6rem] tracking-tighter mb-4 jitter-text uppercase italic glitch-text">WARNING WARNING</h2>
            <p className="text-red-400 font-bold tracking-[0.4em] mb-20 uppercase scary-straight-thin-red text-lg">MALFUNCTION DETECTED. PULSE 20 TIMES TO REVIVE.</p>
            <div className="relative mb-12">
               <div className="absolute inset-0 bg-red-500/20 blur-3xl animate-pulse rounded-full" />
               <button onPointerDown={handleWarningClick} className="w-56 h-56 rounded-full border-2 border-red-500 text-6xl flex flex-col items-center justify-center hover:scale-105 active:scale-90 transition-transform shadow-[0_0_60px_rgba(239,68,68,0.3)] bg-red-600/5 relative overflow-hidden group">
                  <span className="text-red-500 font-black text-2xl mb-1 tracking-widest">{warningClicks}/20</span>
                  <span className="text-red-200 text-xs font-bold uppercase tracking-widest opacity-40 group-active:opacity-100">REVIVE</span>
               </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={`fixed inset-0 blackish-red-glue flex flex-col items-center justify-center p-8 transition-transform duration-75 ${shake ? 'translate-x-1 -translate-y-1' : ''}`}>
        <div className="scary-red-box flex flex-col items-center">
          <h1 className="text-4xl md:text-7xl scary-straight-thin-red mb-12 leading-tight">
            {typedReady}
          </h1>
          <div className={`transition-all duration-1000 ${showIntroButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <button onClick={handleIntroYes} className="px-12 py-4 bg-black/60 text-red-600 font-bold uppercase tracking-[0.6em] text-xs hover:bg-red-600 hover:text-black transition-all border border-red-600 group">
              <span className="group-active:jitter-text block">Enter CandyVerse</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-[#0f172a] text-white overflow-hidden font-sans">
      {isAscendingEffect && (
        <div className="fixed inset-0 z-[10000] bg-white animate-pulse flex items-center justify-center">
          <span className="text-black text-6xl font-black uppercase tracking-[0.5em] animate-bounce">ASCENDING</span>
        </div>
      )}

      {cosmicAlert && (
        <div className="fixed top-32 left-0 w-full z-[700] pointer-events-none overflow-hidden h-10 flex items-center bg-red-900/40 backdrop-blur-md border-y border-red-500/30">
          <div className="marquee-text flex items-center gap-24">
            <span className="text-sm font-black text-red-500 tracking-[0.2em] italic uppercase drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">{cosmicAlert}</span>
            <span className="text-xs font-black text-red-400/20 tracking-widest uppercase">>>> SYSTEM OVERRIDE >>></span>
            <span className="text-sm font-black text-red-500 tracking-[0.2em] italic uppercase drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">{cosmicAlert}</span>
          </div>
        </div>
      )}

      {offlineReport && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[600] animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="bg-amber-500 text-black px-8 py-4 rounded-[32px] shadow-[0_0_50px_rgba(245,158,11,0.5)] border-4 border-white flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Welcome Back</span>
            <span className="text-2xl font-black">+{formatNumber(offlineReport.candies)} 🍬</span>
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">In {offlineReport.timeStr} of idle time</span>
            <button onClick={() => setOfflineReport(null)} className="mt-2 text-[9px] font-black uppercase underline tracking-tighter">Dismiss</button>
          </div>
        </div>
      )}

      <div className="fixed top-6 left-0 w-full flex flex-col items-center pointer-events-none z-[100]">
        <div className={`flex flex-col items-center transition-all duration-1000 ${showWelcomeText ? 'scale-150 translate-y-20' : 'scale-100 translate-y-0'}`}>
          {showWelcomeText && <span className="text-sm font-black text-amber-400 uppercase tracking-[1em] mb-2 animate-pulse transition-opacity duration-500">WELCOME</span>}
          <div className="flex items-center gap-4 bg-black/20 backdrop-blur-sm border border-white/10 px-6 py-1.5 rounded-full shadow-2xl">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-pink-500" />
            <p className={`font-black text-white uppercase tracking-[0.4em] transition-all ${showWelcomeText ? 'text-xl' : 'text-[10px]'}`}>{gameState.playerName}</p>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-pink-500" />
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 p-8 z-50 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="text-3xl md:text-5xl font-black tabular-nums">{formatNumber(gameState.candyCount)} 🍬</h1>
          <div className="flex flex-col items-start gap-1 mt-1">
            <p className="text-amber-400 font-bold text-sm">+{formatNumber(getCps())}/sec</p>
            {gameState.prestigeLevel > 0 && (
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-tighter">
                Celestial Bonus: +{(getPrestigeMultiplier() * 100 - 100).toFixed(0)}%
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="h-full w-full flex items-center justify-center">
        {activeTab === 'candy' ? (
          <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden">
            <CandyMain 
              onClick={handleCandyClick} 
              skin={gameState.candySkin} 
              magicWandCount={gameState.upgrades['magic_wand'] || 0} 
            />
          </div>
        ) : (
          <div className="fixed inset-0 z-[200] bg-[#0f172a] pt-40 pb-32 overflow-y-auto scrollbar-hide px-4">
            <div className="max-w-2xl mx-auto space-y-8">
              {activeTab === 'shop' && UPGRADES.filter(u => u.category === 'shop' || (!u.category && !u.isGranny)).map(u => (
                <UpgradeCard key={u.id} upgrade={u} count={gameState.upgrades[u.id] || 0} canAfford={gameState.candyCount >= (u.baseCost * Math.pow(u.multiplier, gameState.upgrades[u.id] || 0))} onBuy={() => buyUpgrade(u.id)} isRevealed={gameState.totalCandies >= (u.unlockAt || 0)} />
              ))}
              {activeTab === 'magic' && UPGRADES.filter(u => u.category === 'magic' || u.isGranny).map(u => {
                const isRevealed = gameState.totalCandies >= (u.unlockAt || 0);
                return <UpgradeCard key={u.id} upgrade={u} count={gameState.upgrades[u.id] || 0} canAfford={gameState.candyCount >= (u.baseCost * Math.pow(u.multiplier, gameState.upgrades[u.id] || 0))} onBuy={() => buyUpgrade(u.id)} isRevealed={isRevealed} isMystery={!isRevealed} />;
              })}
              {activeTab === 'stats' && (
                <div className="space-y-8 pb-12">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-center"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Taps</p><p className="text-3xl font-thin">{gameState.clicks.toLocaleString()}</p></div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] text-center"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Lifetime Sugar</p><p className="text-3xl font-thin">{formatNumber(gameState.totalCandies)}</p></div>
                  </div>

                  <div className="bg-gradient-to-b from-indigo-900/40 to-black/40 border border-white/10 p-8 rounded-[40px] flex flex-col items-center text-center">
                    <h2 className="text-3xl font-black mb-2 italic uppercase tracking-tighter text-blue-400">Celestial Ascension</h2>
                    <p className="text-xs text-zinc-400 font-medium mb-6 uppercase tracking-widest">Reset your empire for divine power</p>
                    
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-6 w-full mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-zinc-500">Total Upgrades</span>
                        <span className={`text-xl font-thin ${totalUpgradeCount >= 500 ? 'text-green-400' : 'text-zinc-400'}`}>{totalUpgradeCount} / 500</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min(100, (totalUpgradeCount / 500) * 100)}%` }} />
                      </div>
                      <p className="text-[9px] text-zinc-500 mt-4 italic">Reaching 500 upgrades or 10M lifetime candies allows you to Ascend.</p>
                    </div>

                    {!isConfirmingAscension ? (
                      <button 
                        onClick={handleAscension}
                        disabled={!canAscend}
                        className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] transition-all border-2 ${canAscend ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:scale-[1.02]' : 'bg-black/40 border-white/5 text-zinc-600 grayscale'}`}
                      >
                        {canAscend ? 'Ascend to Heavens' : 'Eligibility Pending'}
                      </button>
                    ) : (
                      <div className="flex flex-col gap-4 w-full">
                        <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest animate-pulse">Confirming: All upgrades and current candy will be reset!</p>
                        <div className="flex gap-4">
                          <button onClick={confirmAscension} className="flex-1 py-4 bg-blue-500 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-blue-400 transition-colors">Confirm Reset</button>
                          <button onClick={() => setIsConfirmingAscension(false)} className="flex-1 py-4 bg-zinc-800 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors">Go Back</button>
                        </div>
                      </div>
                    )}
                    
                    {gameState.prestigeLevel > 0 && (
                      <div className="mt-8 flex items-center gap-4 bg-blue-500/10 border border-blue-500/30 px-6 py-3 rounded-full">
                        <span className="text-xl">✨</span>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Prestige Level: {gameState.prestigeLevel} (+{(gameState.prestigeLevel * 10).toFixed(0)}% Boost)</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
                    <h2 className="text-3xl font-black mb-6 italic uppercase tracking-tighter text-amber-400">Sacred Honors</h2>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                      {ACHIEVEMENTS.map(a => {
                        const unlocked = gameState.unlockedAchievements.includes(a.id);
                        return <div key={a.id} className="aspect-square rounded-2xl flex items-center justify-center text-3xl bg-black/40 border border-white/5 relative group">
                          {unlocked ? a.emoji : '🔒'}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black/90 p-2 rounded-lg text-[10px] text-center opacity-0 group-hover:opacity-100 transition-opacity z-50">
                            <p className="font-black text-white uppercase">{a.name}</p><p className="text-zinc-400">{unlocked ? a.description : '???'}</p>
                          </div>
                        </div>;
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
                    <h2 className="text-3xl font-black mb-6 italic uppercase tracking-tighter text-blue-400">Empire Expansion</h2>
                    {UPGRADES.filter(u => u.category === 'stats').map(u => (
                      <UpgradeCard key={u.id} upgrade={u} count={gameState.upgrades[u.id] || 0} canAfford={gameState.candyCount >= (u.baseCost * Math.pow(u.multiplier, gameState.upgrades[u.id] || 0))} onBuy={() => buyUpgrade(u.id)} isRevealed={gameState.totalCandies >= (u.unlockAt || 0)} isMystery={gameState.totalCandies < (u.unlockAt || 0)} />
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'fun' && (
                <div className="space-y-8 pb-12">
                  <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-10 rounded-[40px] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden border border-white/5">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-900 rounded-full flex items-center justify-center text-7xl md:text-8xl border-2 border-purple-500/30">🧚🏾‍♀️</div>
                    <div className="flex-1 space-y-4">
                      <div className="bg-black/40 backdrop-blur-sm p-6 rounded-3xl border border-white/10 relative min-h-[100px] flex items-center">
                        <p className="text-xl md:text-2xl font-thin italic text-zinc-200">"{ADE_PHRASES[adePhraseIndex]}"</p>
                      </div>
                      <button onClick={() => { setAdePhraseIndex((adePhraseIndex + 1) % ADE_PHRASES.length); sounds.playUISound(); }} className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-purple-400">Hear More</button>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
                    <h3 className="text-2xl font-black mb-6 italic text-blue-400 uppercase tracking-tighter">Display Optimization</h3>
                    <p className="text-xs text-zinc-400 uppercase font-bold mb-4 tracking-widest">Ensures fairies stay within your view</p>
                    <div className="flex flex-wrap gap-4">
                      {(['phone', 'tablet', 'laptop'] as DeviceMode[]).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setDeviceMode(mode)}
                          className={`flex-1 min-w-[100px] py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all border-2 ${gameState.deviceMode === mode ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-black/40 text-zinc-500 border-white/10 hover:border-white/30'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]">
                    <h3 className="text-2xl font-black mb-4 italic text-zinc-400 uppercase">Your Sacred Identity</h3>
                    <input type="text" value={gameState.playerName} onChange={handleNameChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-thin tracking-widest text-xl focus:outline-none" />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-[40px]"><h2 className="text-3xl font-black mb-6 italic uppercase">Core Skins</h2><div className="grid grid-cols-4 gap-4">{CANDY_SKINS.map(s => <button key={s} onClick={() => changeSkin(s)} className={`p-4 rounded-2xl text-4xl hover:bg-white/10 ${gameState.candySkin === s ? 'bg-white text-black' : ''}`}>{s}</button>)}</div></div>
                  <div className="bg-red-900/10 border border-red-900/20 p-8 rounded-[40px] flex flex-col items-center">
                    <h3 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-[0.2em] font-thin">Danger Zone</h3>
                    {!isConfirmingSurrender ? (
                      <button onClick={handleSurrender} className="px-8 py-3 bg-red-600 text-white font-black rounded-full hover:bg-red-500 transition-colors uppercase text-xs tracking-widest">Surrender Progress</button>
                    ) : (
                      <div className="flex gap-4">
                        <button onClick={confirmSurrender} className="px-8 py-3 bg-red-700 text-white font-black rounded-full hover:bg-red-800 transition-colors uppercase text-xs tracking-widest animate-pulse">Sure?</button>
                        <button onClick={() => setIsConfirmingSurrender(false)} className="px-8 py-3 bg-zinc-700 text-white font-black rounded-full hover:bg-zinc-600 transition-colors uppercase text-xs tracking-widest">Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {activeTab === 'candy' && (
        <div className="fixed inset-0 pointer-events-none z-[250]">
          {gameState.grannyInstances.map(g => {
            const bubbleWidth = 180;
            const isNearLeft = g.x < bubbleWidth / 2 + 20;
            const isNearRight = g.x > window.innerWidth - (bubbleWidth / 2 + 20);
            
            let bubbleTransform = 'translateX(-50%)';
            if (isNearLeft) bubbleTransform = 'translateX(calc(-50% + 40px))';
            if (isNearRight) bubbleTransform = 'translateX(calc(-50% - 40px))';

            return (
              <div key={g.id} className="absolute pointer-events-none transition-transform duration-100" style={{ left: g.x, top: g.y, transform: 'translate(-50%, -50%)' }}>
                {g.speech && (
                  <div 
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      dismissSpeech(g.id);
                    }}
                    style={{ transform: bubbleTransform }}
                    className="absolute bottom-full left-1/2 mb-4 bg-white text-black p-4 rounded-2xl border-2 border-pink-500 w-44 text-center text-[11px] leading-tight font-bold italic shadow-2xl animate-in zoom-in slide-in-from-bottom-2 cursor-pointer pointer-events-auto active:scale-90 transition-transform hover:bg-pink-50 group"
                  >
                    {g.speech}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                    <div className="mt-2 text-[8px] text-pink-500/50 font-black uppercase tracking-widest group-hover:text-pink-600 transition-colors">Tap to Close</div>
                  </div>
                )}
                <div 
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    triggerManualIntro(g);
                  }}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full border border-pink-500/30 bg-white/5 flex items-center justify-center text-lg md:text-xl shadow-lg backdrop-blur-[1px] cursor-pointer pointer-events-auto active:scale-125 transition-transform ${g.speechType === 'intro' ? 'animate-pulse scale-110' : ''}`}
                >
                  {g.emoji}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bottom-nav-bar">
        <div className={`nav-item ${activeTab === 'candy' ? 'active' : ''}`} onClick={() => setActiveTab('candy')}><span className="text-3xl">🍬</span><span>Core</span></div>
        <div className={`nav-item ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => setActiveTab('shop')}><span className="text-3xl">🏪</span><span>Shop</span></div>
        <div className={`nav-item ${activeTab === 'magic' ? 'active' : ''}`} onClick={() => setActiveTab('magic')}><span className="text-3xl">🪄</span><span>Magic</span></div>
        <div className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}><span className="text-3xl">📊</span><span>Stats</span></div>
        <div className={`nav-item ${activeTab === 'fun' ? 'active' : ''}`} onClick={() => setActiveTab('fun')}><span className="text-3xl">✨</span><span>Fun</span></div>
      </div>
      <div className="fixed inset-0 pointer-events-none z-[100]">{floatingTexts.map(t => <div key={t.id} className="floating-number" style={{ left: t.x - 20, top: t.y - 20 }}>+{formatNumber(t.val)}</div>)}</div>
      <GoldenCandy onCollect={() => sounds.playSuccess()} />
      {showSurrender && <div className="fixed inset-0 bg-red-600 z-[9999] flex flex-col items-center justify-center text-black animate-in zoom-in duration-300"><div className="text-[300px] md:text-[500px] font-black leading-none drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]">X</div><p className="text-3xl md:text-5xl font-black tracking-[1em] uppercase">ABANDONED</p></div>}
    </div>
  );
};

export default App;
