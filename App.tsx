
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Ear,
  Power,
  SlidersHorizontal
} from 'lucide-react';
import { GameMode, Difficulty, QuizState, DrumInstrument } from './types';
import { 
  ISO_FREQUENCIES_BEGINNER, 
  ISO_FREQUENCIES_INTERMEDIATE, 
  ISO_FREQUENCIES_EXPERT, 
  DEFAULT_GAIN_DB, 
  DEFAULT_Q 
} from './constants';
import { audioEngine } from './services/audioEngine';
import FrequencyVisualizer from './components/FrequencyVisualizer';
import DrumKitSelector from './components/DrumKitSelector';
import SSLChannelStrip from './components/SSLChannelStrip';
import StudioQuizGame from './components/StudioQuizGame';

const THEME_WARM_STUDIO = { 
  bgImage: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=2070', 
  overlayGradient: 'from-[#0a0a0c]/98 via-[#1a150e]/85 to-[#0a0a0c]/98' 
};

const App: React.FC = () => {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [isPoweringUp, setIsPoweringUp] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBypassed, setIsBypassed] = useState(false);
  const [selectedDrum, setSelectedDrum] = useState<DrumInstrument | 'CUSTOM'>(DrumInstrument.KICK);
  const [isConsoleMode, setIsConsoleMode] = useState(true);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  
  const [quizState, setQuizState] = useState<QuizState>({ 
    currentRound: 0, 
    totalRounds: 10, 
    score: 0, 
    history: [] 
  });

  const handleInitializeAudio = async () => {
    if (isPoweringUp) return;
    setIsPoweringUp(true);
    audioEngine.playUISound('init');
    await new Promise(r => setTimeout(r, 1500));
    await audioEngine.initialize();
    audioEngine.setInstrument(selectedDrum as any);
    setIsAudioInitialized(true);
  };

  const handleFileUpload = async (file: File, instrument: DrumInstrument) => {
    await audioEngine.assignFileToInstrument(instrument, file);
    setSelectedDrum(instrument);
    audioEngine.setInstrument(instrument);
  };

  const startNewRound = useCallback(() => {
    const list = difficulty === Difficulty.EXPERT ? ISO_FREQUENCIES_EXPERT 
               : difficulty === Difficulty.INTERMEDIATE ? ISO_FREQUENCIES_INTERMEDIATE 
               : ISO_FREQUENCIES_BEGINNER;
    
    const target = list[Math.floor(Math.random() * list.length)].hz;
    const gain = DEFAULT_GAIN_DB; 
    const adaptiveQ = DEFAULT_Q + (streak * 0.2);
    
    audioEngine.setSSLEQ('HMF', target, gain, adaptiveQ);
    setQuizState(prev => ({
      ...prev,
      targetFrequency: target,
      targetGain: gain,
      currentRound: prev.currentRound + 1
    }));
    
    setIsBypassed(false);
    audioEngine.bypassFilter(false);
    if (!isPlaying) {
      audioEngine.start();
      setIsPlaying(true);
    }
  }, [difficulty, streak, isPlaying]);

  const handleGuess = async (hz: number) => {
    if (!quizState.targetFrequency) return;
    
    const isCorrect = hz === quizState.targetFrequency;
    const newHistory = [...quizState.history, {
      round: quizState.currentRound,
      target: quizState.targetFrequency,
      guessed: hz,
      isCorrect,
      timestamp: Date.now()
    }];

    if (isCorrect) {
      setStreak(s => s + 1);
      setQuizState(q => ({ ...q, score: q.score + 100 + (streak * 10), history: newHistory }));
    } else {
      setStreak(0);
      setQuizState(q => ({ ...q, history: newHistory }));
    }

    setTimeout(() => startNewRound(), 4000);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      audioEngine.start();
      setIsPlaying(true);
    } else {
      audioEngine.stop();
      setIsPlaying(false);
    }
  };

  const handleToggleBypass = () => {
    const newState = !isBypassed;
    setIsBypassed(newState);
    audioEngine.bypassFilter(newState);
  };

  if (!isAudioInitialized) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm scale-110" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070')" }} />
        <div className="relative z-10 bg-zinc-900/80 p-12 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col items-center max-w-lg w-full">
            <Ear className="w-16 h-16 text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <h1 className="text-4xl font-display font-black text-white mb-2 tracking-tighter uppercase text-center">EAR TRAINING <span className="text-amber-500">PRO</span></h1>
            <p className="text-zinc-500 font-mono text-[10px] tracking-[0.4em] mb-12 uppercase text-center">Neural Mixing & Signal Identification Suite</p>
            
            <button 
              onClick={handleInitializeAudio} 
              className={`relative group w-full py-6 rounded-2xl border-2 flex items-center justify-center gap-6 transition-all active:scale-95 ${isPoweringUp ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' : 'bg-black border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-white'}`}
            >
              <Power className={`w-8 h-8 ${isPoweringUp ? 'animate-pulse' : 'text-amber-500'}`} />
              <span className="font-display font-bold text-xl tracking-widest uppercase">{isPoweringUp ? 'BOOTING SYSTEM...' : 'INITIALIZE'}</span>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative font-sans overflow-hidden" style={{ backgroundImage: `url('${THEME_WARM_STUDIO.bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className={`absolute inset-0 bg-gradient-to-b ${THEME_WARM_STUDIO.overlayGradient} z-0 transition-all duration-[1200ms]`}></div>

      <header className="bg-gradient-to-b from-[#1a1a1c] to-[#0a0a0c] border-b-[4px] border-black p-4 relative z-20 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <Ear className="w-6 h-6 text-amber-500" />
            <h1 className="font-display font-bold text-xl text-white uppercase tracking-tighter">EAR TRAINING <span className="text-amber-500">PRO</span></h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex bg-black/60 rounded-lg p-1 border border-zinc-800">
               <button onClick={() => setIsConsoleMode(false)} className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${!isConsoleMode ? 'bg-amber-500 text-black' : 'text-zinc-500'}`}>Drills</button>
               <button onClick={() => setIsConsoleMode(true)} className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition-all ${isConsoleMode ? 'bg-emerald-500 text-black' : 'text-zinc-500'}`}>Console</button>
            </div>
          </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 flex flex-col lg:flex-row gap-4 relative z-10 overflow-hidden">
        {/* SIDEBAR: PRO RACK (Analyzer + Sample Loader) */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0 transition-all duration-500">
          {/* Top Window: High-End Spectral Suite */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Master Meter Bridge</span>
              <div className="flex gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              </div>
            </div>
            <FrequencyVisualizer isActive={isPlaying} />
          </div>

          {/* Bottom Window: Professional Sample Loader / Individual Kit Selector */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Signal Source Loader</span>
              <span className="text-[8px] font-mono text-zinc-600 uppercase">Input: Stereo PCM</span>
            </div>
            <DrumKitSelector 
                selectedDrum={selectedDrum} 
                onSelect={(d) => { setSelectedDrum(d); audioEngine.setInstrument(d as any); }} 
                onFileUpload={handleFileUpload}
                onCommitPreset={() => {
                  audioEngine.commitCurrentPreset();
                }}
            />
          </div>
        </div>

        {/* MAIN DISPLAY: SSL Console or Training Game */}
        <div className="flex-1 bg-[#161618] rounded-2xl border-[6px] border-black shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex overflow-hidden">
           {isConsoleMode ? (
             <div className="flex-1 flex justify-center bg-zinc-950/40 p-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)] pointer-events-none"></div>
                <div className="h-full z-10 flex justify-center">
                   <SSLChannelStrip interactive={true} />
                </div>
             </div>
           ) : (
             <div className="flex-1 relative overflow-hidden bg-black">
                <StudioQuizGame 
                  difficulty={difficulty} 
                  quizState={quizState} 
                  onStartRound={startNewRound} 
                  onGuess={handleGuess} 
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  onToggleBypass={handleToggleBypass}
                  isBypassed={isBypassed}
                />
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default App;
