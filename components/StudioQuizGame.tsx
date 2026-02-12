
import React, { useState, useEffect, useMemo } from 'react';
import { Target, Zap, Trophy, Activity, Info, ChevronRight, BarChart3, Star, Play, Pause, ToggleLeft as ToggleDry, ToggleRight as ToggleWet } from 'lucide-react';
import { Difficulty, QuizState, ISOFrequency } from '../types';
import { ISO_FREQUENCIES_BEGINNER, ISO_FREQUENCIES_INTERMEDIATE, ISO_FREQUENCIES_EXPERT } from '../constants';

interface StudioQuizGameProps {
  difficulty: Difficulty;
  quizState: QuizState;
  onStartRound: () => void;
  onGuess: (hz: number) => void;
  isPlaying: boolean;
  onTogglePlay?: () => void;
  onToggleBypass?: () => void;
  isBypassed?: boolean;
}

const StudioQuizGame: React.FC<StudioQuizGameProps> = ({ 
  difficulty, 
  quizState, 
  onStartRound, 
  onGuess, 
  isPlaying,
  onTogglePlay,
  onToggleBypass,
  isBypassed = false
}) => {
  const [hoveredFreq, setHoveredFreq] = useState<number | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Sync score with animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (animatedScore < quizState.score) setAnimatedScore(prev => prev + 1);
      if (animatedScore > quizState.score) setAnimatedScore(quizState.score);
    }, 50);
    return () => clearTimeout(timer);
  }, [quizState.score, animatedScore]);

  const frequencies = useMemo(() => {
    if (difficulty === Difficulty.EXPERT) return ISO_FREQUENCIES_EXPERT;
    if (difficulty === Difficulty.INTERMEDIATE) return ISO_FREQUENCIES_INTERMEDIATE;
    return ISO_FREQUENCIES_BEGINNER;
  }, [difficulty]);

  const progress = (quizState.currentRound / quizState.totalRounds) * 100;

  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-center overflow-hidden rounded-xl">
      {/* BACKGROUND: 3D STUDIO ENVIRONMENT */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] scale-105 animate-[ken-burns_20s_infinite_alternate]"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-transparent"></div>
        <div className="absolute inset-0 backdrop-blur-[2px]"></div>
      </div>

      {/* STUDIO ELEMENTS: VIBRATING MONITORS (WHEN PLAYING) */}
      <div className="absolute top-1/4 left-10 w-32 h-40 bg-[#1a1a1c] border-2 border-black rounded shadow-2xl z-10 hidden lg:block overflow-hidden">
        <div className={`w-full h-full flex flex-col items-center justify-around p-4 ${isPlaying ? 'animate-[pulse_0.1s_infinite]' : ''}`}>
            <div className="w-16 h-16 rounded-full bg-zinc-900 border-4 border-zinc-800 shadow-inner"></div>
            <div className="w-20 h-20 rounded-full bg-zinc-950 border-4 border-zinc-800 shadow-inner flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-800"></div>
            </div>
        </div>
      </div>
      <div className="absolute top-1/4 right-10 w-32 h-40 bg-[#1a1a1c] border-2 border-black rounded shadow-2xl z-10 hidden lg:block overflow-hidden">
        <div className={`w-full h-full flex flex-col items-center justify-around p-4 ${isPlaying ? 'animate-[pulse_0.1s_infinite]' : ''}`}>
            <div className="w-16 h-16 rounded-full bg-zinc-900 border-4 border-zinc-800 shadow-inner"></div>
            <div className="w-20 h-20 rounded-full bg-zinc-950 border-4 border-zinc-800 shadow-inner flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-800"></div>
            </div>
        </div>
      </div>

      {/* HOLOGRAPHIC TOP HUD: SCORE & PROGRESS */}
      <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-20 pointer-events-none">
        <div className="flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-xl border border-emerald-500/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Star className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">Live Score</span>
                    <span className="text-2xl font-display font-black text-white">{animatedScore.toString().padStart(4, '0')}</span>
                </div>
            </div>
            <div className="w-48 h-1.5 bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-cyan-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl border border-amber-500/30 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.2em]">Difficulty</span>
                <span className="text-sm font-display font-black text-amber-400">{difficulty}</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/20">
                <Activity className="w-5 h-5 text-amber-400" />
            </div>
        </div>
      </div>

      {/* MAIN GAME STAGE */}
      <div className="relative z-20 w-full max-w-4xl px-10 flex flex-col items-center gap-8">
        {quizState.currentRound === 0 ? (
          <div className="group relative flex flex-col items-center text-center animate-fade-in">
            <div className="absolute -inset-20 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all"></div>
            <Target className="w-24 h-24 text-emerald-500 mb-8 drop-shadow-[0_0_25px_rgba(16,185,129,0.6)] animate-bounce-subtle" />
            <h2 className="text-5xl font-display font-black text-white uppercase tracking-tighter mb-4">
                Neural <span className="text-emerald-500">Analysis</span>
            </h2>
            <p className="text-zinc-400 max-w-sm font-mono text-sm leading-relaxed mb-10 tracking-tight">
                An anomaly has been detected in the mixbus signal. Locate and isolate the frequency spike to calibrate the system.
            </p>
            <button 
              onClick={onStartRound}
              className="px-12 py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-xl tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center gap-4"
            >
              INITIALIZE SCAN <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="w-full animate-slide-up flex flex-col items-center">
            {/* QUESTION PANEL & PLAY CONTROLS */}
            <div className="bg-black/40 backdrop-blur-2xl border-2 border-white/10 p-8 rounded-3xl shadow-2xl mb-10 text-center relative overflow-hidden group w-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Acoustic Identification Active</h3>
                <h2 className="text-3xl font-display font-black text-white uppercase mb-8">Which Frequency is <span className="text-amber-500">BOOSTED</span>?</h2>
                
                {/* TRANSPORT MODULE */}
                <div className="flex items-center justify-center gap-10">
                    <button 
                        onClick={onTogglePlay}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-90 border-4 ${isPlaying ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.5)]' : 'bg-black/80 text-emerald-500 border-emerald-500/30'}`}
                    >
                        {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 ml-1 fill-current" />}
                    </button>

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">A/B Comparison</span>
                        <div className="flex bg-black/80 rounded-xl p-1 border border-zinc-800">
                            <button 
                                onClick={onToggleBypass}
                                className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${isBypassed ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-600'}`}
                            >
                                <ToggleDry className="w-4 h-4" /> FLAT
                            </button>
                            <button 
                                onClick={onToggleBypass}
                                className={`px-6 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${!isBypassed ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-zinc-600'}`}
                            >
                                <ToggleWet className="w-4 h-4" /> BOOST
                            </button>
                        </div>
                    </div>
                </div>

                {hoveredFreq && (
                    <div className="mt-8 text-emerald-400 font-mono text-xs animate-pulse tracking-[0.2em]">
                        SENSING HARMONICS AT {hoveredFreq}Hz...
                    </div>
                )}
            </div>

            {/* FREQUENCY GRID: HOLOGRAPHIC BUTTONS */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 w-full">
              {frequencies.map((freq) => (
                <button
                  key={freq.hz}
                  onMouseEnter={() => setHoveredFreq(freq.hz)}
                  onMouseLeave={() => setHoveredFreq(null)}
                  onClick={() => onGuess(freq.hz)}
                  className="group relative h-20 rounded-2xl bg-zinc-900/60 border-2 border-white/5 hover:border-emerald-500 transition-all flex flex-col items-center justify-center shadow-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors"></div>
                  <span className="text-xl font-display font-black text-zinc-300 group-hover:text-emerald-400 group-hover:scale-110 transition-all">
                    {freq.label}
                  </span>
                  <div className="mt-1 w-8 h-0.5 bg-zinc-800 group-hover:bg-emerald-500/50 transition-all"></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* HOLOGRAPHIC FOOTER: RACK GEAR MOCKUP */}
      <div className="absolute bottom-6 left-6 right-6 h-20 bg-black/80 backdrop-blur-xl border-2 border-zinc-800 rounded-2xl flex items-center justify-between px-8 z-20 shadow-2xl overflow-hidden">
         <div className="flex gap-10">
            <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Comp State</span>
                <div className="flex gap-1">
                    {[1,2,3,4,5,6].map(i => <div key={i} className={`w-1 h-3 rounded-full ${isPlaying ? 'bg-red-500 shadow-[0_0_5px_#ef4444] animate-pulse' : 'bg-zinc-800'}`}></div>)}
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Signal Path</span>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                    <span className="text-[10px] font-mono text-zinc-400">ANALOG_TRIPLE_OSC</span>
                </div>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="text-right">
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Total Recall</span>
                <div className="text-[10px] font-mono text-zinc-300">BLOCK_SYNC_00{quizState.currentRound}</div>
            </div>
            <BarChart3 className="w-6 h-6 text-zinc-600" />
         </div>

         {/* Energy Line Animation Overlay */}
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent animate-[shimmer_2s_infinite]"></div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes ken-burns {
          0% { transform: scale(1.0) translate(0, 0); }
          100% { transform: scale(1.1) translate(-1%, -1%); }
        }
      `}</style>
    </div>
  );
};

export default StudioQuizGame;
