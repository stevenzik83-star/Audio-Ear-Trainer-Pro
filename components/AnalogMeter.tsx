import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface Props {
  channel?: 'L' | 'R' | 'M';
  size?: 'sm' | 'md' | 'lg';
}

export const AnalogMeter: React.FC<Props> = ({ channel = 'M', size = 'md' }) => {
  const needleRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const peakLedRef = useRef<HTMLDivElement>(null);
  // Fixed: Added initial value 0 to fix TypeScript error "Expected 1 arguments, but got 0"
  const animationRef = useRef<number>(0);
  
  // High-fidelity physics state
  const currentAngle = useRef(-45);
  const velocity = useRef(0);
  
  useEffect(() => {
    const updateMeter = () => {
      animationRef.current = requestAnimationFrame(updateMeter);
      
      const levels = audioEngine.getStereoLevels();
      let level = 0;
      
      if (channel === 'L') level = levels.left;
      else if (channel === 'R') level = levels.right;
      else level = (levels.left + levels.right) / 2;

      // Map level (0-1) to VU ballistics
      // VU meters have specific rise/fall times.
      const targetAngle = -48 + (Math.pow(level, 0.6) * 96); 
      
      // Physics: Spring-Mass-Damper approximation for needle inertia
      const springConstant = 0.15;
      const damping = 0.45;
      
      const force = (targetAngle - currentAngle.current) * springConstant;
      velocity.current = (velocity.current + force) * damping;
      currentAngle.current += velocity.current;

      // Hard stop pegs
      if (currentAngle.current < -52) {
          currentAngle.current = -52;
          velocity.current *= -0.2; // Bounce off peg
      }
      if (currentAngle.current > 52) {
          currentAngle.current = 52;
          velocity.current *= -0.2;
      }

      // Update needle and shadow
      if (needleRef.current) {
        needleRef.current.style.transform = `translateX(-50%) rotate(${currentAngle.current}deg)`;
      }
      if (shadowRef.current) {
         shadowRef.current.style.transform = `translateX(-48%) translateY(3px) rotate(${currentAngle.current}deg)`;
      }

      // Peak LED Flash logic
      if (peakLedRef.current) {
          if (level > 0.85) {
              peakLedRef.current.style.opacity = "1";
              peakLedRef.current.style.boxShadow = "0 0 15px #ef4444, 0 0 5px #f87171";
          } else {
              // Smooth decay for LED
              const currentOpacity = parseFloat(peakLedRef.current.style.opacity) || 0;
              peakLedRef.current.style.opacity = Math.max(0, currentOpacity - 0.08).toString();
              peakLedRef.current.style.boxShadow = "none";
          }
      }
    };

    updateMeter();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [channel]);

  const dimClasses = {
      sm: 'w-36 h-24',
      md: 'w-56 h-36',
      lg: 'w-72 h-48'
  };

  return (
    <div className={`relative ${dimClasses[size]} bg-[#1a1a1c] rounded-md border-[4px] border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 group`}>
       {/* High-End Console Housing */}
       <div className="absolute inset-0 z-30 pointer-events-none rounded-sm border-t border-white/10 border-l border-white/5 border-r border-black/50 border-b border-black/80 shadow-[inset_0_2px_5px_rgba(255,255,255,0.1)]"></div>
       
       {/* Anti-Reflective Glass Reflection */}
       <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 z-40 pointer-events-none rounded-sm"></div>
       <div className="absolute top-0 right-[-10%] w-1/2 h-1/3 bg-gradient-to-b from-white/5 to-transparent -skew-x-[25deg] z-40 pointer-events-none"></div>

       {/* Meter Face with Warm Tube Backlight */}
       <div className="absolute inset-1.5 bg-[#f5e6ca] rounded-sm overflow-hidden z-10 box-border shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] transition-all duration-1000"
            style={{
                background: 'radial-gradient(circle at 50% 120%, #fff8e1 0%, #ffe082 30%, #f5d6a0 100%)'
            }}
       >
           {/* Paper Texture Overlay */}
           <div className="absolute inset-0 opacity-15 mix-blend-multiply pointer-events-none" 
                style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")'}}
           ></div>

           {/* Backlight Glow (Simulates warm bulbs) */}
           <div className="absolute bottom-[-20%] left-[-10%] w-[120%] h-1/2 bg-amber-400/20 blur-3xl animate-pulse"></div>

           {/* The Scale Interface */}
           <div className="absolute inset-0 flex items-end justify-center pb-3">
                <svg viewBox="0 0 200 120" className="w-[92%] h-[92%] overflow-visible drop-shadow-sm">
                    {/* Background Arcs */}
                    <path d="M 20,105 A 95,95 0 0,1 180,105" fill="none" stroke="#2c2c2e" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
                    <path d="M 132,28 A 95,95 0 0,1 180,105" fill="none" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" strokeOpacity="0.8" />
                    
                    {/* Major Calibration Ticks */}
                    <line x1="20" y1="105" x2="28" y2="97" stroke="#2c2c2e" strokeWidth="2.5" />
                    <line x1="42" y1="48" x2="49" y2="54" stroke="#2c2c2e" strokeWidth="2" />
                    <line x1="132" y1="28" x2="128" y2="38" stroke="#000" strokeWidth="3.5" />
                    <line x1="180" y1="105" x2="172" y2="97" stroke="#ef4444" strokeWidth="2.5" />

                    {/* Numeric Labels */}
                    <text x="32" y="88" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="800" fill="#2c2c2e" transform="rotate(-38 32,88)">-20</text>
                    <text x="56" y="48" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="800" fill="#2c2c2e" transform="rotate(-22 56,48)">-10</text>
                    <text x="94" y="28" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="800" fill="#2c2c2e" transform="rotate(-5 94,28)">-5</text>
                    <text x="128" y="22" fontSize="12" fontFamily="Orbitron, sans-serif" fontWeight="900" fill="#000">0</text>
                    <text x="175" y="88" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="800" fill="#ef4444" transform="rotate(38 175,88)">+3</text>

                    {/* Branding */}
                    <text x="100" y="65" textAnchor="middle" fontSize="11" fontFamily="Orbitron, sans-serif" fontWeight="700" fill="#000" letterSpacing="4" stroke="#fff" strokeWidth="0.1">V U</text>
                    <text x="100" y="78" textAnchor="middle" fontSize="6" fontFamily="Inter, sans-serif" fontWeight="900" fill="#4b5563" letterSpacing="1.5">{channel === 'L' ? 'LEFT' : channel === 'R' ? 'RIGHT' : 'MASTER BUS'}</text>
                </svg>
           </div>
       </div>

       {/* High-Precision Needle Component */}
       <div className="absolute bottom-[-15%] left-1/2 w-full h-[105%] z-20 pointer-events-none origin-bottom-center">
            {/* Soft Focus Shadow */}
            <div ref={shadowRef} className="absolute bottom-0 left-1/2 w-[3px] h-full bg-black/30 blur-[2px] origin-bottom transform translate-x-[-50%] transition-transform will-change-transform opacity-70"></div>
            
            {/* Needle Body (Tapered) */}
            <div ref={needleRef} className="absolute bottom-0 left-1/2 w-[2px] h-full bg-[#18181b] origin-bottom transform translate-x-[-50%] transition-transform will-change-transform flex flex-col items-center">
                <div className="w-[1.5px] h-1/4 bg-red-600 shadow-[0_0_2px_rgba(220,38,38,0.5)]"></div>
                <div className="w-[2px] h-3/4 bg-[#18181b]"></div>
            </div>
       </div>
       
       {/* Heavy Chrome Pivot Cap */}
       <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-zinc-700 via-zinc-900 to-black rounded-full z-30 shadow-[0_5px_15px_rgba(0,0,0,0.8),inset_0_2px_2px_rgba(255,255,255,0.2)] border border-zinc-800">
           <div className="absolute inset-1 rounded-full border border-white/5 bg-gradient-to-tl from-zinc-800 to-transparent opacity-50"></div>
       </div>

       {/* Reactive PEAK / CLIP LED */}
       <div className="absolute top-3 right-3 flex flex-col items-center gap-1 z-50">
           <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase tracking-tighter">Peak</span>
           <div className="relative w-2.5 h-2.5 rounded-full bg-zinc-900 border border-black shadow-inner">
               <div ref={peakLedRef} className="absolute inset-0 bg-red-500 rounded-full opacity-0 blur-[1.5px] transition-opacity duration-75"></div>
           </div>
       </div>

       {/* Calibration Sticker Mockup */}
       <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/20 border border-black/10 rounded-sm z-20">
           <div className="text-[6px] font-mono text-zinc-700/60 font-bold uppercase tracking-tight">Cal: -18dBFS</div>
       </div>
    </div>
  );
};