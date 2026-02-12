
import React, { useState, useEffect, useRef } from 'react';
import { DrumInstrument } from '../types';
import { Drum, Music, Upload, Save, RotateCcw, ShieldCheck, Plus, Mic2, Guitar, Piano, Volume2 } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

// --- Realistic Animated Drum & Instrument Icons ---

const KickIcon = ({ animate }: { animate: boolean }) => (
  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg">
    <circle cx="32" cy="36" r="22" fill="#111" stroke="#333" strokeWidth="2" />
    <circle cx="32" cy="36" r="18" fill="url(#kickGrad)" />
    <defs>
      <radialGradient id="kickGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#222" />
        <stop offset="100%" stopColor="#000" />
      </radialGradient>
    </defs>
    <g className={animate ? 'animate-[kick-strike_0.15s_ease-out]' : ''}>
      <rect x="30" y="10" width="4" height="20" fill="#444" rx="1" />
      <circle cx="32" cy="10" r="5" fill="#eee" />
    </g>
    <path d="M12 48l-4 8M52 48l4 8" stroke="#444" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const SnareIcon = ({ animate }: { animate: boolean }) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <circle cx="32" cy="32" r="24" fill="#222" stroke="#444" strokeWidth="2" />
    <circle cx="32" cy="32" r="20" fill="#eee" fillOpacity="0.1" stroke="#555" strokeWidth="1" />
    <g className={animate ? 'animate-[snare-snap_0.1s_ease-in-out_infinite]' : ''}>
      <path d="M14 32h36M14 30h36M14 34h36" stroke="#34d399" strokeWidth="0.5" strokeOpacity="0.3" />
    </g>
    <rect x="8" y="28" width="48" height="8" rx="2" fill="#222" stroke="#444" strokeWidth="1.5" />
  </svg>
);

const HiHatIcon = ({ open, animate }: { open: boolean, animate: boolean }) => (
  <svg viewBox="0 0 64 64" className="w-full h-full">
    <rect x="31" y="10" width="2" height="44" fill="#333" />
    <g className={animate ? 'animate-[bounce_0.2s_ease-in-out]' : ''}>
      <path 
        d="M12 28c0-4 10-6 20-6s20 2 20 6-10 2-20 2-20-2-20-2z" 
        fill="#b45309" 
        className={`transition-transform duration-300 ${open ? 'translate-y-[-4px]' : 'translate-y-[2px]'}`}
      />
      <path d="M12 32c0 4 10 6 20 6s20-2 20-6-10-2-20-2-20 2-20 2z" fill="#92400e" />
    </g>
  </svg>
);

const TomIcon = ({ size, animate }: { size: 'hi' | 'mid' | 'low', animate: boolean }) => {
  const scale = size === 'hi' ? 0.7 : size === 'mid' ? 0.85 : 1.0;
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" style={{ transform: `scale(${scale})` }}>
      <ellipse cx="32" cy="20" rx="24" ry="8" fill="#222" stroke="#444" strokeWidth="2" />
      <path d="M8 20v20c0 4 10 8 24 8s24-4 24-8V20" fill="#111" stroke="#444" strokeWidth="2" />
      <ellipse cx="32" cy="20" rx="20" ry="5" fill="#333" className={animate ? 'animate-pulse' : ''} />
    </svg>
  );
};

const CymbalIcon = ({ type, animate }: { type: 'crash' | 'ride', animate: boolean }) => (
  <svg viewBox="0 0 64 64" className={`w-full h-full ${animate ? 'animate-[tilt_0.5s_ease-in-out_infinite]' : ''}`}>
    <circle cx="32" cy="32" r="28" fill="#d97706" fillOpacity="0.2" stroke="#d97706" strokeWidth="1" />
    <circle cx="32" cy="32" r="24" fill="url(#cymbalGrad)" stroke="#b45309" strokeWidth="1" />
    <defs>
      <radialGradient id="cymbalGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="80%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="4" fill="#444" />
  </svg>
);

const getDrumIcon = (type: DrumInstrument, isSelected: boolean) => {
  switch (type) {
    case DrumInstrument.KICK: return <KickIcon animate={isSelected} />;
    case DrumInstrument.SNARE: return <SnareIcon animate={isSelected} />;
    case DrumInstrument.HIHAT_CLOSE: return <HiHatIcon open={false} animate={isSelected} />;
    case DrumInstrument.HIHAT_OPEN: return <HiHatIcon open={true} animate={isSelected} />;
    case DrumInstrument.TOM_HIGH: return <TomIcon size="hi" animate={isSelected} />;
    case DrumInstrument.TOM_MID: return <TomIcon size="mid" animate={isSelected} />;
    case DrumInstrument.TOM_LOW: return <TomIcon size="low" animate={isSelected} />;
    case DrumInstrument.CRASH: return <CymbalIcon type="crash" animate={isSelected} />;
    case DrumInstrument.RIDE: return <CymbalIcon type="ride" animate={isSelected} />;
    case DrumInstrument.VOCALS: return <Mic2 className="w-full h-full text-cyan-400" />;
    case DrumInstrument.BASS: return <Guitar className="w-full h-full text-blue-400 rotate-90" />;
    case DrumInstrument.BRASS: return <Volume2 className="w-full h-full text-amber-500" />;
    case DrumInstrument.FULL_DRUMS: return <Drum className="w-full h-full text-emerald-500" />;
    case DrumInstrument.ELECTRIC_GUITAR: return <Guitar className="w-full h-full text-red-500" />;
    case DrumInstrument.ACOUSTIC_GUITAR: return <Guitar className="w-full h-full text-orange-200" />;
    case DrumInstrument.PIANO: return <Piano className="w-full h-full text-indigo-400" />;
    case DrumInstrument.VIOLINS: return <Music className="w-full h-full text-rose-400" />;
    case DrumInstrument.WHITE_NOISE: return <Volume2 className="w-full h-full text-zinc-400 opacity-50" />;
    default: return <Drum className="w-full h-full text-zinc-500" />;
  }
};

export const TactileIconButton = ({ 
  type, 
  label, 
  isSelected, 
  onSelect, 
  onUpload,
  showUpload 
}: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkStatus = () => {
      setIsLoaded(audioEngine.isInstrumentLoaded(type));
    };
    checkStatus();
    const interval = setInterval(checkStatus, 1500);
    return () => clearInterval(interval);
  }, [type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && onUpload) {
      onUpload(e.target.files[0], type);
    }
  };

  return (
    <div className="flex flex-col items-center group relative">
      <button 
        onClick={() => {
            onSelect(type);
            audioEngine.playPreview(type);
        }} 
        className={`relative transition-all duration-300 w-16 h-16 ${isSelected ? 'scale-115' : 'hover:scale-105 active:scale-95'}`}
      >
        {isSelected && <div className="absolute inset-[-15%] rounded-full animate-ping opacity-30 border-2 border-emerald-400"></div>}
        <div className={`absolute inset-[-6px] rounded-full border-[2px] transition-all duration-500 ${isLoaded ? 'border-emerald-500/40 opacity-100' : 'border-zinc-800 opacity-20'}`}></div>
        
        <div className={`w-full h-full rounded-full bg-gradient-to-br from-zinc-800 to-black p-[2px] shadow-2xl flex items-center justify-center relative overflow-hidden`}>
            <div className={`w-full h-full rounded-full flex items-center justify-center transition-all p-2 ${isSelected ? `bg-[#111] shadow-[inset_0_0_15px_rgba(16,185,129,0.3)]` : 'bg-[#0a0a0c] shadow-inner'}`}>
                {getDrumIcon(type, isSelected)}
            </div>
        </div>
      </button>

      {showUpload && (
        <button 
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          className="absolute top-0 right-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-90 transition-all z-20 border-2 border-black"
        >
          <Plus className="w-4 h-4 stroke-[4]" />
        </button>
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/mpeg,audio/wav" className="hidden" />

      <div className={`mt-3 px-3 py-1 rounded-full bg-black/95 text-[8px] font-black uppercase tracking-widest text-center transition-all duration-300 ${isSelected ? 'text-emerald-400 opacity-100' : 'text-zinc-600 opacity-0 group-hover:opacity-100'}`}>
        {label}
      </div>
    </div>
  );
};

interface Props {
  selectedDrum: DrumInstrument | 'CUSTOM';
  onSelect: (drum: DrumInstrument | 'CUSTOM') => void;
  onFileUpload: (file: File, instrument: DrumInstrument) => void;
  onCommitPreset?: () => void;
  onResetFactory?: () => void;
}

const DrumKitSelector: React.FC<Props> = ({ selectedDrum, onSelect, onFileUpload, onCommitPreset, onResetFactory }) => {
  const [viewMode, setViewMode] = useState<'DRUMS' | 'INSTRUMENTS' | 'USER'>('DRUMS');
  const [isSaving, setIsSaving] = useState(false);

  // Drums share indices/types with User slots
  const drumKit = [
    { type: DrumInstrument.KICK, label: 'KICK' },
    { type: DrumInstrument.SNARE, label: 'SNARE' },
    { type: DrumInstrument.HIHAT_CLOSE, label: 'HI-HAT CL' },
    { type: DrumInstrument.HIHAT_OPEN, label: 'HI-HAT OP' },
    { type: DrumInstrument.CRASH, label: 'CRASH' },
    { type: DrumInstrument.RIDE, label: 'RIDE' },
    { type: DrumInstrument.TOM_HIGH, label: 'TOM HI' },
    { type: DrumInstrument.TOM_MID, label: 'TOM MID' },
    { type: DrumInstrument.TOM_LOW, label: 'TOM LOW' },
  ];

  const instrumentKit = [
    { type: DrumInstrument.BASS, label: 'BASS GUITAR' },
    { type: DrumInstrument.BRASS, label: 'BRASS' },
    { type: DrumInstrument.FULL_DRUMS, label: 'DRUMS' },
    { type: DrumInstrument.ELECTRIC_GUITAR, label: 'ELEC GUITAR' },
    { type: DrumInstrument.ACOUSTIC_GUITAR, label: 'ACOUS GUITAR' },
    { type: DrumInstrument.PIANO, label: 'PIANO' },
    { type: DrumInstrument.VIOLINS, label: 'VIOLINS' },
    { type: DrumInstrument.VOCALS, label: 'VOCAL' },
    { type: DrumInstrument.WHITE_NOISE, label: 'WHITE NOISE' },
  ];

  const handleCommit = async () => {
    setIsSaving(true);
    if (onCommitPreset) onCommitPreset();
    await new Promise(r => setTimeout(r, 1500));
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] rounded-lg border-2 border-black shadow-2xl overflow-hidden">
      <style>{`
        @keyframes kick-strike { 0% { transform: translateY(0); } 50% { transform: translateY(10px) rotate(-10deg); } 100% { transform: translateY(0); } }
        @keyframes snare-snap { 0% { transform: scaleY(1); } 50% { transform: scaleY(0.9) translateY(2px); } 100% { transform: scaleY(1); } }
        @keyframes tilt { 0% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } 100% { transform: rotate(-2deg); } }
      `}</style>

      <div className="flex bg-[#121214] border-b border-black z-20 shrink-0">
         <button onClick={() => setViewMode('DRUMS')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${viewMode === 'DRUMS' ? 'bg-[#18181b] text-emerald-500 shadow-[inset_0_-2px_0_currentColor]' : 'text-zinc-600'}`}>
            <Drum className="w-4 h-4" /> DRUMS
         </button>
         <button onClick={() => setViewMode('INSTRUMENTS')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${viewMode === 'INSTRUMENTS' ? 'bg-[#18181b] text-emerald-500 shadow-[inset_0_-2px_0_currentColor]' : 'text-zinc-600'}`}>
            <Music className="w-4 h-4" /> INSTRUMENTS
         </button>
         <button onClick={() => setViewMode('USER')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${viewMode === 'USER' ? 'bg-[#18181b] text-amber-500 shadow-[inset_0_-2px_0_currentColor]' : 'text-zinc-600'}`}>
            <Upload className="w-4 h-4" /> USER
         </button>
      </div>

      <div className="relative flex-1 bg-zinc-950 overflow-hidden flex flex-col">
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-[#050505]">
            <div className="grid grid-cols-3 gap-x-6 gap-y-10 relative z-10 max-w-2xl mx-auto">
                {viewMode === 'INSTRUMENTS' ? (
                  instrumentKit.map(item => (
                    <TactileIconButton 
                       key={item.type}
                       type={item.type} 
                       label={item.label} 
                       isSelected={selectedDrum === item.type} 
                       onSelect={onSelect}
                    />
                  ))
                ) : (
                  drumKit.map(item => (
                    <TactileIconButton 
                       key={item.type}
                       type={item.type} 
                       label={item.label} 
                       isSelected={selectedDrum === item.type} 
                       onSelect={onSelect}
                       onUpload={onFileUpload}
                       showUpload={viewMode === 'USER'}
                    />
                  ))
                )}
            </div>
        </div>

        {viewMode === 'USER' && (
          <div className="bg-[#111] border-t border-zinc-800 p-5 shrink-0 flex flex-col gap-4 animate-slide-up shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-1 px-1">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
               <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">PRO ENGINE SYNC</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCommit}
                disabled={isSaving}
                className={`flex-1 h-14 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-95 border-b-4 border-black font-display font-black text-[10px] tracking-widest uppercase ${isSaving ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)]'}`}
              >
                {isSaving ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? 'SYNCING...' : 'COMMIT CUSTOM KIT'}
              </button>
              <button 
                onClick={onResetFactory}
                className="w-14 h-14 rounded-lg bg-zinc-900 border-b-4 border-black flex items-center justify-center text-red-500 hover:bg-zinc-800 active:scale-90 transition-all shadow-lg"
                title="Restore Factory Sounds"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
            <p className="text-[7px] text-zinc-600 font-mono uppercase tracking-tighter text-center italic">Assign custom MP3s in USER tab. They automatically replace factory sounds in the DRUMS tab.</p>
          </div>
        )}
      </div>
      
      <div className="bg-[#121214] border-t border-black p-3 flex justify-center items-center gap-3">
         <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_#10b981] ${audioEngine.wasRestored() ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
         <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.5em]">SIGNAL SOURCE: {audioEngine.wasRestored() ? 'CUSTOM MP3 ENGINE' : 'ANALOG FACTORY ENGINE'}</span>
      </div>
    </div>
  );
};

export default DrumKitSelector;
