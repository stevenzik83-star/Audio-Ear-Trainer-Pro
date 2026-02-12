
import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

// --- SSL Hardware Circular LED Meter ---
const SSLHardwareMeter = ({ value, label }: { value: number, label: string }) => {
    const thresholds = [3, 6, 10, 14, 20];
    return (
        <div className="flex flex-col items-center gap-1.5">
            <span className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter">{label}</span>
            <div className="flex flex-col gap-2">
                {thresholds.slice().reverse().map((t) => {
                    let color = 'bg-zinc-800';
                    let glow = '';
                    const isActive = value >= t;
                    
                    if (isActive) {
                        if (t >= 14) { color = 'bg-red-500'; glow = 'shadow-[0_0_8px_#ef4444]'; }
                        else if (t >= 10) { color = 'bg-amber-400'; glow = 'shadow-[0_0_8px_#fbbf24]'; }
                        else { color = 'bg-emerald-500'; glow = 'shadow-[0_0_8px_#10b981]'; }
                    }

                    return (
                        <div key={t} className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full transition-all duration-75 border border-black/40 ${color} ${glow}`}></div>
                            <span className="text-[6px] font-bold text-zinc-600 w-2.5">{t}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SSLRectSwitch = ({ label, active, onClick, ledColor = "amber", size = "md" }: any) => {
    const colors: any = {
        amber: active ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]" : "bg-zinc-800",
        emerald: active ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-zinc-800",
        red: active ? "bg-red-500 shadow-[0_0_8px_#ef4444]" : "bg-zinc-800",
        white: active ? "bg-white shadow-[0_0_8px_white]" : "bg-zinc-800"
    };
    return (
        <div className="flex flex-col items-center gap-1">
            {ledColor === "amber" && <div className={`w-1.5 h-1.5 rounded-full mb-0.5 ${colors[ledColor]}`}></div>}
            <button 
                onClick={onClick}
                className={`bg-[#d1d5db] border-t-2 border-white border-l border-white/40 border-r border-black/30 border-b-2 border-black/60 shadow-lg active:translate-y-0.5 transition-all flex items-center justify-center
                ${size === "md" ? "w-10 h-6 rounded-sm" : "w-8 h-12 rounded-sm"}`}
            >
                <span className="text-[6px] font-black text-black leading-none text-center px-1 uppercase tracking-tighter">{label}</span>
            </button>
            {ledColor !== "amber" && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${colors[ledColor]}`}></div>}
        </div>
    );
};

const PrecisionControl = ({ label, subLabel, value, min, max, defaultValue, capColor, onChange, disabled, markings }: any) => {
    const [isDragging, setIsDragging] = useState(false);
    const controlRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        const startY = e.clientY;
        const startValue = value;
        setIsDragging(true);
        controlRef.current?.setPointerCapture(e.pointerId);

        const onPointerMove = (moveEvent: PointerEvent) => {
            const delta = startY - moveEvent.clientY;
            const sensitivity = moveEvent.shiftKey ? 0.05 : 0.6;
            const range = max - min;
            const step = (delta * range / 300) * sensitivity;
            onChange(Math.min(max, Math.max(min, startValue + step)));
        };

        const onPointerUp = () => {
            setIsDragging(false);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    const angle = ((value - min) / (max - min)) * 270 - 135;
    const knobStyles: any = { 
        grey: "from-zinc-100 via-zinc-300 to-zinc-500", 
        green: "from-emerald-700 via-emerald-800 to-zinc-900",
        red: "from-red-600 via-red-800 to-zinc-900",
        blue: "from-blue-600 via-blue-800 to-zinc-900",
        brown: "from-[#8b4513] via-[#5d2e0a] to-zinc-900"
    };

    return (
        <div className={`flex flex-col items-center py-1 relative select-none touch-none ${disabled ? 'opacity-30' : ''}`}>
            {label && <span className="text-[7px] font-black text-zinc-400 uppercase tracking-tighter mb-0.5">{label}</span>}
            <div className="relative flex items-center justify-center w-12 h-12">
                {markings && markings.map((m: string, i: number) => {
                    const mAngle = (i / (markings.length - 1)) * 270 - 135;
                    const r = 20;
                    const x = Math.sin(mAngle * (Math.PI / 180)) * r;
                    const y = -Math.cos(mAngle * (Math.PI / 180)) * r;
                    return (
                        <span key={i} className="absolute text-[5px] font-black text-zinc-600" style={{ transform: `translate(${x}px, ${y}px)` }}>
                            {m}
                        </span>
                    );
                })}
                <div ref={controlRef} onPointerDown={handlePointerDown} className={`w-9 h-9 rounded-full shadow-[2px_4px_10px_rgba(0,0,0,0.5)] relative z-10 border border-zinc-950 transition-transform ${isDragging ? 'scale-105' : ''}`}>
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${knobStyles[capColor] || knobStyles.grey}`}>
                    <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
                        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[2px] h-[35%] bg-zinc-950 rounded-full"></div>
                    </div>
                  </div>
                </div>
            </div>
            {subLabel && <span className="text-[6px] font-black text-zinc-500 uppercase tracking-tighter mt-1">{subLabel}</span>}
        </div>
    );
};

const SSLChannelStrip: React.FC<{ interactive?: boolean }> = ({ interactive = true }) => {
    const [state, setState] = useState(() => {
        const saved = audioEngine.loadState();
        return saved || {
            lineGain: 0, vhd: false, 
            compRatio: 4, compThresh: 0, compRelease: 0.5, compAttack: 30, link: false,
            gateThresh: -20, gateRange: 20, gateRelease: 0.5, gateActive: false, gateSelect: false,
            hpfF: 30, lpfF: 20000, 
            hfG: 0, hfF: 8, hfBell: false, hmfG: 0, hmfF: 3.5, hmfQ: 1.2, lmfG: 0, lmfF: 800, lmfQ: 1.2, lfG: 0, lfF: 100, lfBell: false,
            fader: 1.0, outputGain: 0, power: true, eqIn: true, dynIn: true, expIn: true, compIn: true, masterBypass: false
        };
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [levels, setLevels] = useState({ left: 0, right: 0, compGR: 0, gateGR: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const stereo = audioEngine.getStereoLevels();
            const dyn = audioEngine.getDynamicsLevels();
            setLevels({ ...stereo, ...dyn });
            // Sync play state with engine (especially useful for Drills mode interaction)
            setIsPlaying((audioEngine as any).isPlaying);
        }, 30);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!state.power) { audioEngine.setMasterVolume(0); return; }
        
        audioEngine.setInputGain(state.lineGain);
        audioEngine.setFilters(state.hpfF, state.lpfF);
        
        // Handle Global Bypass logic
        const applyBypass = (val: number) => state.masterBypass ? 0 : val;

        audioEngine.setDynamics(
            { ratio: state.compRatio, threshold: state.compThresh, attack: state.compAttack, release: state.compRelease * 1000 },
            { dynIn: state.dynIn && !state.masterBypass, compIn: state.compIn, expIn: state.expIn }
        );
        audioEngine.setGate({ threshold: state.gateThresh, range: state.gateRange, release: state.gateRelease * 1000, active: state.gateActive });
        audioEngine.setSSLEQ('HF', state.hfF * 1000, applyBypass(state.eqIn ? state.hfG : 0), 0.7, state.hfBell);
        audioEngine.setSSLEQ('HMF', state.hmfF * 1000, applyBypass(state.eqIn ? state.hmfG : 0), state.hmfQ);
        audioEngine.setSSLEQ('LMF', state.lmfF, applyBypass(state.eqIn ? state.lmfG : 0), state.lmfQ);
        audioEngine.setSSLEQ('LF', state.lfF, applyBypass(state.eqIn ? state.lfG : 0), 0.7, state.lfBell);
        
        audioEngine.setMasterVolume(state.fader * (1 + state.outputGain / 20));
        audioEngine.saveState(state);
    }, [state]);

    const handleTogglePlay = () => {
        if (!isPlaying) {
            audioEngine.start();
            setIsPlaying(true);
        } else {
            audioEngine.stop();
            setIsPlaying(false);
        }
    };

    // Marking constants for UI
    const EQ_GAIN_MARKINGS = ['-15', '-10', '-5', '0', '+5', '+10', '+15'];
    const HF_FREQ_MARKINGS = ['1.5', '3', '5', '8', '10', '13', '16'];
    const HMF_FREQ_MARKINGS = ['.6', '1.2', '2', '3.5', '5', '6', '7'];
    const LMF_FREQ_MARKINGS = ['200', '400', '800', '1.2k', '1.8k', '2.2k', '2.5k'];
    const LF_FREQ_MARKINGS = ['30', '60', '100', '200', '300', '400', '450'];
    const OUTPUT_MARKINGS = ['-20', '-10', '0', '+10', '+20'];

    return (
        <div className="flex flex-col w-72 h-full bg-[#1c1c1e] border-x-[8px] border-black shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar relative scroll-smooth pb-12">
            
            {/* TOP BRANDING */}
            <div className="sticky top-0 z-50 bg-[#2a2a2c] py-4 border-b border-black flex flex-col items-center gap-1 shadow-lg">
                <span className="text-sm font-serif font-black text-zinc-300">Solid State Logic</span>
                <span className="text-[8px] font-bold text-zinc-500 tracking-[0.4em] uppercase">SSL 4000 E // CHANNEL 01</span>
            </div>

            {/* INPUT SECTION */}
            <div className="p-4 border-b border-black bg-[#2a2a2c] flex flex-col items-center gap-4">
                <div className="flex justify-between w-full items-center">
                    <PrecisionControl label="INPUT" value={state.lineGain} min={-20} max={20} defaultValue={0} capColor="grey" onChange={(v:any)=>setState({...state, lineGain:v})} markings={['-20', '-10', '0', '+10', '+20']} />
                    <SSLRectSwitch label="VHD" active={state.vhd} onClick={()=>setState({...state, vhd:!state.vhd})} />
                </div>
            </div>

            {/* DYNAMICS SECTION */}
            <div className="p-4 border-b border-black bg-[#252527] flex flex-col gap-6 relative">
                <span className="absolute top-2 left-3 text-[10px] font-black text-zinc-700 tracking-widest">DYNAMICS</span>
                
                {/* Compressor Sub-block */}
                <div className="flex flex-col gap-4 mt-6">
                    <div className="flex justify-between items-start">
                        <PrecisionControl value={state.compRatio} min={1} max={20} defaultValue={4} capColor="grey" onChange={(v:any)=>setState({...state, compRatio:v})} markings={['1','2','3','4','5','8','20','∞']} subLabel="RATIO" />
                        <SSLRectSwitch label="LINK" active={state.link} onClick={()=>setState({...state, link:!state.link})} />
                    </div>
                    <div className="flex justify-center">
                        <PrecisionControl value={state.compThresh} min={-20} max={10} defaultValue={0} capColor="grey" onChange={(v:any)=>setState({...state, compThresh:v})} markings={['+10','+5','0','-5','-10','-15','-20']} subLabel="THRESH" />
                    </div>
                    <div className="flex justify-between">
                        <PrecisionControl value={state.compRelease} min={0.1} max={4} defaultValue={0.5} capColor="grey" onChange={(v:any)=>setState({...state, compRelease:v})} markings={['.1','.2','.4','.8','1','2','4']} subLabel="REL" />
                        <SSLHardwareMeter value={levels.compGR} label="CMP_GR" />
                    </div>
                </div>

                {/* Gate Sub-block */}
                <div className="border-t border-zinc-800 pt-6 flex flex-col gap-4">
                    <div className="flex justify-between">
                        <PrecisionControl value={state.gateRange} min={0} max={40} defaultValue={20} capColor="green" onChange={(v:any)=>setState({...state, gateRange:v})} markings={['0','5','10','20','30','35','40']} subLabel="RANGE" />
                        <PrecisionControl value={state.gateThresh} min={-30} max={10} defaultValue={-20} capColor="green" onChange={(v:any)=>setState({...state, gateThresh:v})} markings={['-30','-25','-20','-12','-4','0','+5','+10']} subLabel="THRESH" />
                    </div>
                    <div className="flex justify-between items-center">
                        <PrecisionControl value={state.gateRelease} min={0.1} max={4} defaultValue={0.5} capColor="green" onChange={(v:any)=>setState({...state, gateRelease:v})} markings={['.1','.2','.4','.8','1','2','4']} subLabel="REL" />
                        <SSLHardwareMeter value={levels.gateGR} label="EXP_GR" />
                    </div>
                </div>
            </div>

            {/* FILTERS & ROUTING */}
            <div className="p-4 border-b border-black bg-[#2a2a2c] flex flex-col gap-4">
                <div className="flex justify-around">
                     <PrecisionControl value={state.hpfF} min={30} max={350} defaultValue={30} capColor="grey" onChange={(v:any)=>setState({...state, hpfF:v})} markings={['30', '80', '150', '250', '350']} subLabel="HPF" />
                     <PrecisionControl value={state.lpfF} min={3000} max={20000} defaultValue={20000} capColor="grey" onChange={(v:any)=>setState({...state, lpfF:v})} markings={['3k', '5k', '8k', '12k', '20k']} subLabel="LPF" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <SSLRectSwitch size="sm" label="DYN IN" active={state.dynIn} onClick={()=>setState({...state, dynIn:!state.dynIn})} ledColor="emerald" />
                    <SSLRectSwitch size="sm" label="EXP IN" active={state.expIn} onClick={()=>setState({...state, expIn:!state.expIn})} ledColor="red" />
                    <SSLRectSwitch size="sm" label="CMP IN" active={state.compIn} onClick={()=>setState({...state, compIn:!state.compIn})} ledColor="amber" />
                </div>
            </div>

            {/* EQ SECTION */}
            <div className="p-4 bg-[#222224] flex flex-col gap-8 relative">
                <span className="absolute top-2 left-3 text-[10px] font-black text-zinc-700 tracking-widest">EQUALISER</span>
                
                <div className="mt-6 flex flex-col gap-6">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                        <PrecisionControl label="HF" value={state.hfG} min={-15} max={15} defaultValue={0} capColor="grey" onChange={(v:any)=>setState({...state, hfG:v})} markings={EQ_GAIN_MARKINGS} subLabel="dB" />
                        <div className="flex flex-col gap-2">
                            <PrecisionControl label="kHz" value={state.hfF} min={1.5} max={16} defaultValue={8} capColor="grey" onChange={(v:any)=>setState({...state, hfF:v})} markings={HF_FREQ_MARKINGS} />
                            <SSLRectSwitch label="BELL" active={state.hfBell} onClick={()=>setState({...state, hfBell:!state.hfBell})} />
                        </div>
                    </div>

                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                        <PrecisionControl label="HMF" value={state.hmfG} min={-15} max={15} defaultValue={0} capColor="green" onChange={(v:any)=>setState({...state, hmfG:v})} markings={EQ_GAIN_MARKINGS} subLabel="dB" />
                        <PrecisionControl label="kHz" value={state.hmfF} min={0.6} max={7} defaultValue={3.5} capColor="green" onChange={(v:any)=>setState({...state, hmfF:v})} markings={HMF_FREQ_MARKINGS} />
                    </div>

                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                        <PrecisionControl label="LMF" value={state.lmfG} min={-15} max={15} defaultValue={0} capColor="blue" onChange={(v:any)=>setState({...state, lmfG:v})} markings={EQ_GAIN_MARKINGS} subLabel="dB" />
                        <PrecisionControl label="Hz" value={state.lmfF} min={200} max={2500} defaultValue={800} capColor="blue" onChange={(v:any)=>setState({...state, lmfF:v})} markings={LMF_FREQ_MARKINGS} />
                    </div>

                    <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                        <PrecisionControl label="LF" value={state.lfG} min={-15} max={15} defaultValue={0} capColor="brown" onChange={(v:any)=>setState({...state, lfG:v})} markings={EQ_GAIN_MARKINGS} subLabel="dB" />
                        <div className="flex flex-col gap-2">
                            <PrecisionControl label="Hz" value={state.lfF} min={30} max={450} defaultValue={100} capColor="brown" onChange={(v:any)=>setState({...state, lfF:v})} markings={LF_FREQ_MARKINGS} />
                            <SSLRectSwitch label="BELL" active={state.lfBell} onClick={()=>setState({...state, lfBell:!state.lfBell})} />
                        </div>
                    </div>
                </div>

                {/* INTEGRATED MASTER OUTPUT & STANDALONE TRANSPORT */}
                <div className="flex flex-col items-center gap-6 pt-6 pb-12 border-t border-zinc-800">
                    <PrecisionControl label="OUTPUT" value={state.outputGain} min={-20} max={20} defaultValue={0} capColor="grey" onChange={(v:any)=>setState({...state, outputGain:v})} markings={OUTPUT_MARKINGS} subLabel="dB" />
                    
                    <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full px-6">
                        <SSLRectSwitch label="EQ IN" active={state.eqIn} onClick={()=>setState({...state, eqIn:!state.eqIn})} ledColor="emerald" />
                        <SSLRectSwitch label="BYPASS" active={state.masterBypass} onClick={()=>setState({...state, masterBypass:!state.masterBypass})} ledColor="red" />
                        
                        {/* Playback Control */}
                        <div className="flex flex-col items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'}`}></div>
                             <button 
                                onClick={handleTogglePlay}
                                className={`w-12 h-8 rounded-sm bg-gradient-to-b from-zinc-700 to-zinc-900 border-2 border-zinc-950 flex items-center justify-center transition-all active:translate-y-0.5 shadow-lg`}
                             >
                                <span className={`text-[8px] font-black tracking-widest ${isPlaying ? 'text-emerald-400' : 'text-zinc-500'}`}>{isPlaying ? 'STOP' : 'PLAY'}</span>
                             </button>
                             <span className="text-[6px] font-bold text-zinc-600 uppercase">Transport</span>
                        </div>

                        {/* Power Control */}
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${state.power ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-zinc-800'}`}></div>
                            <button 
                                onClick={() => setState({...state, power: !state.power})}
                                className={`w-12 h-8 rounded-sm bg-gradient-to-b from-zinc-700 to-zinc-900 border-2 border-zinc-950 flex items-center justify-center transition-all active:translate-y-0.5 shadow-lg`}
                             >
                                <span className={`text-[8px] font-black tracking-widest ${state.power ? 'text-amber-400' : 'text-zinc-500'}`}>POWER</span>
                             </button>
                             <span className="text-[6px] font-bold text-zinc-600 uppercase">System</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default SSLChannelStrip;
