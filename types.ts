
export enum GameMode {
  FREQUENCY_BOOST = 'FREQUENCY_BOOST',
  FREQUENCY_CUT = 'FREQUENCY_CUT',
  PANNING = 'PANNING',
  GAIN_MATCHING = 'GAIN_MATCHING'
}

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  EXPERT = 'EXPERT'
}

export enum DrumInstrument {
  KICK = 'KICK',
  SNARE = 'SNARE',
  HIHAT_CLOSE = 'HIHAT_CLOSE',
  HIHAT_OPEN = 'HIHAT_OPEN',
  TOM_HIGH = 'TOM_HIGH',
  TOM_MID = 'TOM_MID',
  TOM_LOW = 'TOM_LOW',
  CRASH = 'CRASH',
  RIDE = 'RIDE',
  PERCUSSION = 'PERCUSSION',
  
  VOCALS = 'VOCALS',
  BASS = 'BASS',
  ACOUSTIC_GUITAR = 'ACOUSTIC_GUITAR',
  BRASS = 'BRASS',
  VIOLINS = 'VIOLINS',
  ELECTRIC_GUITAR = 'ELECTRIC_GUITAR',
  FULL_DRUMS = 'FULL_DRUMS',
  STRINGS = 'STRINGS',
  PIANO = 'PIANO',
  SYNTH_LEAD = 'SYNTH_LEAD',
  SYNTH_PAD = 'SYNTH_PAD',
  PINK_NOISE = 'PINK_NOISE',
  WHITE_NOISE = 'WHITE_NOISE'
}

export interface AudioState {
  isPlaying: boolean;
  isBypassed: boolean;
  volume: number;
}

export interface RoundResult {
  round: number;
  target: number;
  guessed: number;
  isCorrect: boolean;
  timestamp: number;
}

export interface QuizState {
  currentRound: number;
  totalRounds: number;
  score: number;
  targetFrequency?: number;
  targetGain?: number;
  targetPan?: number;
  selectedAnswer?: number;
  isCorrect?: boolean;
  history: RoundResult[];
}

export interface ISOFrequency {
  hz: number;
  label: string;
}

export interface GeminiFeedbackRequest {
  targetFreq: number;
  userFreq: number;
  difficulty: Difficulty;
  mode: GameMode;
}
