
import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface Props {
  isActive: boolean;
}

const FrequencyVisualizer: React.FC<Props> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  // High-fidelity ballistics state
  const peakLevels = useRef<number[]>(new Array(32).fill(0));
  const peakHold = useRef<number[]>(new Array(32).fill(0));

  useEffect(() => {
    const analyser = audioEngine.getAnalyser();
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const waveArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      analyser.getByteTimeDomainData(waveArray);

      const width = canvas.width;
      const height = canvas.height;
      const waveHeight = height * 0.35;
      const spectrumHeight = height * 0.55;

      // Clear with ultra-dark depth
      ctx.fillStyle = '#020203';
      ctx.fillRect(0, 0, width, height);

      // --- Draw Realistic CRT Scanlines & Grid ---
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.lineWidth = 1;
      // Vertical Grid lines
      for (let x = 0; x < width; x += width / 10) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      // Scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 1);
      }

      // --- 1. WAVEFORM DISPLAY (OSCILLOSCOPE) ---
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#10b981';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#10b981';
      
      const sliceWidth = width / bufferLength;
      let xPos = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = waveArray[i] / 128.0;
        const y = (v * waveHeight / 2) + 20;

        if (i === 0) ctx.moveTo(xPos, y);
        else ctx.lineTo(xPos, y);
        xPos += sliceWidth;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- 2. SPECTRAL ANALYZER (31-BAND PRO STYLE) ---
      const numBars = 31;
      const barSpacing = 3;
      const barWidth = (width - (numBars * barSpacing)) / numBars;
      const spectrumYBase = height - 15;

      for (let i = 0; i < numBars; i++) {
        // Logarithmic grouping for realistic frequency distribution
        const sampleIdx = Math.floor(Math.pow(i / numBars, 2) * (bufferLength / 2)) + 1;
        const val = dataArray[sampleIdx] / 255.0;
        const h = val * spectrumHeight;
        const bx = i * (barWidth + barSpacing);

        // Professional Ballistics (Peak Hold)
        if (val > peakLevels.current[i]) {
          peakLevels.current[i] = val;
          peakHold.current[i] = 45; // Hold for ~0.75s
        } else {
          if (peakHold.current[i] > 0) {
            peakHold.current[i]--;
          } else {
            peakLevels.current[i] *= 0.94; // Smooth decay
          }
        }

        // Realistic Gradient logic (Emerald -> Amber -> Red)
        const grd = ctx.createLinearGradient(0, spectrumYBase, 0, spectrumYBase - spectrumHeight);
        grd.addColorStop(0, '#064e3b');   // Deep Emerald
        grd.addColorStop(0.4, '#10b981'); // Vibrant Emerald
        grd.addColorStop(0.75, '#f59e0b'); // Amber
        grd.addColorStop(0.95, '#ef4444'); // Safety Red

        ctx.fillStyle = grd;
        ctx.fillRect(bx, spectrumYBase - h, barWidth, h);

        // Precision Peak Marker
        const peakH = peakLevels.current[i] * spectrumHeight;
        ctx.fillStyle = peakLevels.current[i] > 0.88 ? '#fff' : (peakLevels.current[i] > 0.7 ? '#fcd34d' : '#34d399');
        ctx.fillRect(bx, spectrumYBase - peakH - 2, barWidth, 2);
      }

      // --- 3. FREQUENCY LABELS ---
      ctx.font = 'bold 8px "JetBrains Mono"';
      ctx.fillStyle = '#444';
      const labels = ['20', '100', '500', '1k', '5k', '10k', '20k'];
      labels.forEach((label, idx) => {
        const lx = (idx / (labels.length - 1)) * (width - 40) + 20;
        ctx.fillText(label, lx, height - 4);
      });

      // Reflection Overlay (High-End Glass Feel)
      const reflection = ctx.createLinearGradient(0, 0, width, height);
      reflection.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      reflection.addColorStop(0.5, 'transparent');
      reflection.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
      ctx.fillStyle = reflection;
      ctx.fillRect(0, 0, width, height);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [isActive]);

  return (
    <div className="w-full h-80 bg-[#050507] rounded-xl border-4 border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden group">
      {/* Chrome Bezel Label */}
      <div className="absolute top-2 left-4 flex items-center gap-3 z-20 pointer-events-none">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse' : 'bg-zinc-800'}`}></div>
        <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-[0.4em]">Integrated Spectral Suite</span>
      </div>
      
      {/* Top Corner Branding */}
      <div className="absolute top-2 right-4 z-20 pointer-events-none text-[8px] font-mono font-bold text-zinc-700 tracking-widest">
        FS: 48kHz | RES: 32BIT
      </div>

      <canvas ref={canvasRef} width={800} height={400} className="w-full h-full opacity-90 transition-opacity group-hover:opacity-100" />
      
      {/* Glass Glare Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-30"></div>
    </div>
  );
};

export default FrequencyVisualizer;
