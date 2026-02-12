import React from 'react';
import { Target, Trophy, Percent, CheckCircle2, XCircle, ChevronRight, Activity } from 'lucide-react';
import { RoundResult } from '../types';

interface Props {
  history: RoundResult[];
  isVisible: boolean;
  totalRounds: number;
}

const QuizStatusPanel: React.FC<Props> = ({ history, isVisible, totalRounds }) => {
  if (!isVisible || history.length === 0) return null;

  const latest = history[history.length - 1];
  const correctCount = history.filter(h => h.isCorrect).length;
  const totalCount = history.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);

  return (
    <div className="w-full max-w-2xl animate-fade-in font-mono">
      {/* SESSION PROGRESS INDICATOR */}
      <div className="mb-6 bg-black/40 p-3 rounded-lg border border-white/5 shadow-inner">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3 h-3" /> Session Progress
          </span>
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
            {totalCount} / {totalRounds} Rounds
          </span>
        </div>
        <div className="flex gap-1.5 h-2">
           {Array.from({ length: totalRounds }).map((_, i) => {
             const result = history[i];
             const isCurrent = i === totalCount - 1;
             return (
               <div 
                 key={i} 
                 className={`flex-1 rounded-sm transition-all duration-500 ${
                   result 
                    ? (result.isCorrect ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]') 
                    : (isCurrent ? 'bg-amber-500/40 animate-pulse' : 'bg-zinc-800')
                 }`}
               ></div>
             );
           })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LATEST RESPONSE MODULE */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-black/60 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Signal Analysis</span>
            </div>
            <div className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${latest.isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
               {latest.isCorrect ? 'Phase Match' : 'Spectral Error'}
            </div>
          </div>
          
          <div className="flex-1 p-4 flex items-center justify-around bg-gradient-to-br from-black to-zinc-900">
            <div className="text-center">
              <div className="text-[8px] text-zinc-500 uppercase mb-1">Target</div>
              <div className="text-xl font-display font-bold text-amber-500 tracking-tighter">
                {latest.target >= 1000 ? `${latest.target / 1000}k` : latest.target}<span className="text-xs ml-0.5">Hz</span>
              </div>
            </div>
            
            <div className="flex items-center text-zinc-700">
              <ChevronRight className="w-6 h-6 animate-pulse" />
            </div>

            <div className="text-center">
              <div className="text-[8px] text-zinc-500 uppercase mb-1">Detected</div>
              <div className={`text-xl font-display font-bold tracking-tighter ${latest.isCorrect ? 'text-emerald-400' : 'text-red-500'}`}>
                {latest.guessed >= 1000 ? `${latest.guessed / 1000}k` : latest.guessed}<span className="text-xs ml-0.5">Hz</span>
              </div>
            </div>
          </div>
        </div>

        {/* SESSION PERFORMANCE MODULE */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-black/60 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Score</span>
          </div>
          
          <div className="flex-1 grid grid-cols-2 p-4 gap-4 bg-zinc-950">
            <div className="flex flex-col items-center justify-center border-r border-zinc-800">
                <div className="text-[8px] text-zinc-500 uppercase mb-1">Correct</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-bold text-white">{correctCount}</span>
                  <span className="text-zinc-600 text-xs">/ {totalCount}</span>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center">
                <div className="text-[8px] text-zinc-500 uppercase mb-1">Accuracy</div>
                <div className="flex items-center gap-2">
                  <Percent className="w-3 h-3 text-cyan-500" />
                  <span className="text-2xl font-display font-bold text-cyan-400">{accuracy}%</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizStatusPanel;