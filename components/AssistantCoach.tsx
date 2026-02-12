import React, { useState, useEffect, useRef } from 'react';
import { Ear, Zap, AlertCircle, CheckCircle2, Info, Loader2, Trophy, PlayCircle } from 'lucide-react';

export type CoachMood = 'idle' | 'analyzing' | 'success' | 'error' | 'ai-feedback' | 'game-start' | 'game-over';

interface Props {
  mood: CoachMood;
  message: string;
  isVisible: boolean;
}

const AssistantCoach: React.FC<Props> = ({ mood, message, isVisible }) => {
  const [displayText, setDisplayText] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);
  const prevMood = useRef<CoachMood>(mood);
  
  // Typewriter effect for high-tech feeling
  useEffect(() => {
    let i = 0;
    setDisplayText('');
    if (!isVisible) return;

    const timer = setInterval(() => {
      if (i < message.length) {
        setDisplayText((prev) => prev + message.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 12);
    return () => clearInterval(timer);
  }, [message, isVisible]);

  // Flash-style Glitch effect on mood change
  useEffect(() => {
    if (prevMood.current !== mood && isVisible) {
      setIsGlitching(true);
      const timer = setTimeout(() => setIsGlitching(false), 300);
      prevMood.current = mood;
      return () => clearTimeout(timer);
    }
  }, [mood, isVisible]);

  const moodConfig = {
    idle: { color: 'text-zinc-400', border: 'border-zinc-800', glow: 'shadow-[0_0_20px_rgba(39,39,42,0.3)]', icon: Info, label: 'SYSTEM STANDBY', title: 'AWAITING INPUT' },
    analyzing: { color: 'text-amber-500', border: 'border-amber-500/50', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]', icon: Loader2, label: 'SIGNAL ANALYZER', title: 'SCANNING...' },
    success: { color: 'text-emerald-400', border: 'border-emerald-500/50', glow: 'shadow-[0_0_40px_rgba(52,211,153,0.4)]', icon: CheckCircle2, label: 'PHASE ALIGNED', title: 'GOOD ANSWER!' },
    error: { color: 'text-red-400', border: 'border-red-500/50', glow: 'shadow-[0_0_40px_rgba(239,68,68,0.4)]', icon: AlertCircle, label: 'DETECTION ERROR', title: 'WRONG ANSWER!' },
    'ai-feedback': { color: 'text-cyan-400', border: 'border-cyan-500/50', glow: 'shadow-[0_0_30px_rgba(34,211,238,0.3)]', icon: Zap, label: 'AI CO-PROCESSOR', title: 'ENGINEER TIP' },
    'game-start': { color: 'text-amber-400', border: 'border-amber-400/60', glow: 'shadow-[0_0_50px_rgba(245,158,11,0.5)]', icon: PlayCircle, label: 'INITIATING SESSION', title: "LET'S START!" },
    'game-over': { color: 'text-rose-400', border: 'border-rose-500/60', glow: 'shadow-[0_0_50px_rgba(244,63,94,0.5)]', icon: Trophy, label: 'SESSION FINALIZED', title: 'GAME OVER!' }
  };

  const config = moodConfig[mood] || moodConfig.idle;
  const Icon = config.icon;

  return (
    <div 
      className={`fixed bottom-10 right-10 z-[100] w-[380px] transition-all duration-700 ease-in-out transform pointer-events-none ${
        isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-20 opacity-0 scale-90'
      }`}
    >
      <div className="absolute inset-0 pointer-events-auto">
        {/* The Dialog Bubble */}
        <div className={`relative bg-black/95 backdrop-blur-3xl rounded-3xl border-2 ${config.border} p-7 ${config.glow} transition-all duration-300 overflow-hidden shadow-2xl`}>
          
          {/* Animated Background Glow */}
          <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[80px] opacity-15 transition-colors duration-1000 ${mood === 'success' ? 'bg-emerald-500' : mood === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}></div>

          {/* CRT Scanlines Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.2] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,5px_100%]"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-2xl bg-black/60 border border-white/20 ${mood === 'analyzing' ? 'animate-spin' : 'animate-bounce-subtle'}`}>
                  <Icon className={`w-6 h-6 ${config.color}`} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[9px] font-black tracking-[0.4em] uppercase opacity-50 ${config.color}`}>
                    {config.label}
                  </span>
                  <span className={`text-lg font-display font-black tracking-tight ${config.color} ${isGlitching ? 'animate-pulse' : ''}`}>
                    {config.title}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                 <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${mood === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-white/10'}`}></div>
                 <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${mood === 'error' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-white/10'}`}></div>
              </div>
            </div>

            {/* Typewriter Message Body */}
            <div className="bg-black/50 p-5 rounded-2xl border border-white/5 shadow-inner min-h-[90px] flex items-center">
              <p className="text-zinc-50 text-[14px] font-mono leading-relaxed tracking-tight">
                {displayText}
                {isVisible && (
                  <span className={`inline-block w-3 h-5 ml-2 align-middle transition-colors ${mood === 'success' ? 'bg-emerald-500' : mood === 'error' ? 'bg-red-500' : 'bg-amber-500'} animate-flash`}></span>
                )}
              </p>
            </div>

            {/* Link Info Footer */}
            <div className="mt-6 flex items-center justify-between opacity-80">
               <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] animate-pulse ${mood === 'success' ? 'bg-emerald-500 text-emerald-500' : mood === 'error' ? 'bg-red-500 text-red-500' : 'bg-amber-500 text-amber-500'}`}></div>
                  <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Neural Feed</span>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">BNDW: {Math.floor(Math.random() * 50) + 950}Mbps</span>
                  </div>
               </div>
               <Ear className="w-6 h-6 text-zinc-600 opacity-40" />
            </div>
          </div>
        </div>
        {/* Pointer Pin Decoration */}
        <div className={`absolute -bottom-1.5 right-14 w-4 h-4 bg-[#0a0a0c] border-r-2 border-b-2 border-zinc-800 rotate-45 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
    </div>
  );
};

export default AssistantCoach;