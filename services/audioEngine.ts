
import { DrumInstrument } from '../types';

const REMOTE_SAMPLE_BASE_URL = 'https://storage.googleapis.com/audio-samples-pro-trainer/samples/';
const DB_NAME = 'EarTrainingProDB';
const STORE_NAME = 'InstrumentSamples';
const SETTINGS_KEY = 'ETP_Hardware_State';

export class AudioEngine {
  public context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  
  // SSL 4000 E Precision Signal Chain
  private inputGainNode: GainNode | null = null;
  private preamp: WaveShaperNode | null = null;
  private hpf: BiquadFilterNode | null = null;
  private lpf: BiquadFilterNode | null = null;
  
  // Dynamics Section
  private compressor: DynamicsCompressorNode | null = null;
  private gateNode: GainNode | null = null;
  private gateAnalyser: AnalyserNode | null = null;
  
  private eqHF: BiquadFilterNode | null = null;
  private eqHMF: BiquadFilterNode | null = null;
  private eqLMF: BiquadFilterNode | null = null;
  private eqLF: BiquadFilterNode | null = null;
  private outputGainNode: GainNode | null = null;
  
  private analyserL: AnalyserNode | null = null;
  private analyserR: AnalyserNode | null = null;
  private splitterNode: ChannelSplitterNode | null = null;

  private currentBuffer: AudioBuffer | null = null;
  private isPlaying: boolean = false;
  private instrumentBuffers: Map<DrumInstrument | 'CUSTOM', AudioBuffer> = new Map();
  private loadedStatus: Map<DrumInstrument | 'CUSTOM', boolean> = new Map();
  private isRestoredFromDisk: boolean = false;

  // Real-time tracking for meters
  private lastCompGR: number = 0;
  private lastGateReduction: number = 0;
  private gateThreshold: number = -60;
  private gateRange: number = -40;
  private gateRelease: number = 100;
  private gateActive: boolean = false;
  
  // Dynamics In logic
  private dynIn: boolean = true;
  private compIn: boolean = true;
  private expIn: boolean = true;

  private currentEQState = {
    HMF: { freq: 1000, gain: 0, q: 1.2 }
  };

  constructor() {}

  public saveState(state: any) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
  }

  public loadState(): any | null {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  public async initialize(): Promise<void> {
    if (this.context) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioContextClass({ latencyHint: 'interactive' });
    
    this.inputGainNode = this.context.createGain();
    this.preamp = this.context.createWaveShaper();
    this.hpf = this.context.createBiquadFilter();
    this.lpf = this.context.createBiquadFilter();
    
    this.compressor = this.context.createDynamicsCompressor();
    this.gateNode = this.context.createGain();
    this.gateAnalyser = this.context.createAnalyser();
    this.gateAnalyser.fftSize = 256;
    
    this.eqHF = this.context.createBiquadFilter();
    this.eqHMF = this.context.createBiquadFilter();
    this.eqLMF = this.context.createBiquadFilter();
    this.eqLF = this.context.createBiquadFilter();
    this.outputGainNode = this.context.createGain();
    this.masterGain = this.context.createGain();
    this.splitterNode = this.context.createChannelSplitter(2);
    this.analyserL = this.context.createAnalyser();
    this.analyserR = this.context.createAnalyser();

    this.hpf.type = 'highpass';
    this.lpf.type = 'lowpass';
    this.eqHF.type = 'highshelf';
    this.eqHMF.type = 'peaking';
    this.eqLMF.type = 'peaking';
    this.eqLF.type = 'lowshelf';

    this.inputGainNode.connect(this.preamp);
    this.preamp.connect(this.hpf);
    this.hpf.connect(this.lpf);
    this.lpf.connect(this.compressor);
    this.compressor.connect(this.gateNode);
    this.gateNode.connect(this.eqHF);
    
    this.lpf.connect(this.gateAnalyser);

    this.eqHF.connect(this.eqHMF);
    this.eqHMF.connect(this.eqLMF);
    this.eqLMF.connect(this.eqLF);
    this.eqLF.connect(this.outputGainNode);
    this.outputGainNode.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
    
    this.masterGain.connect(this.splitterNode);
    this.splitterNode.connect(this.analyserL, 0);
    this.splitterNode.connect(this.analyserR, 1);

    await this.loadAllSamples();
    this.startGateProcessing();
  }

  private startGateProcessing() {
    const process = () => {
      if (!this.gateAnalyser || !this.gateNode || !this.context) {
        requestAnimationFrame(process);
        return;
      }

      const data = new Uint8Array(this.gateAnalyser.frequencyBinCount);
      this.gateAnalyser.getByteTimeDomainData(data);
      
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const x = (data[i] - 128) / 128;
        sum += x * x;
      }
      const rms = Math.sqrt(sum / data.length);
      const db = 20 * Math.log10(rms + 0.00001);

      if (this.dynIn && this.expIn) {
          const isOpen = db > this.gateThreshold;
          const targetGain = isOpen ? 1 : Math.pow(10, this.gateRange / 20);
          const timeConstant = isOpen ? 0.005 : (this.gateRelease / 1000);
          this.gateNode.gain.setTargetAtTime(targetGain, this.context.currentTime, timeConstant);
          const currentGainDb = 20 * Math.log10(this.gateNode.gain.value + 0.00001);
          this.lastGateReduction = -currentGainDb;
      } else {
          this.gateNode.gain.setTargetAtTime(1, this.context.currentTime, 0.05);
          this.lastGateReduction = 0;
      }

      requestAnimationFrame(process);
    };
    process();
  }

  public setInputGain(db: number) {
      if (!this.inputGainNode || !this.context) return;
      this.inputGainNode.gain.setTargetAtTime(Math.pow(10, db / 20), this.context.currentTime, 0.05);
  }

  public setDynamics(comp: any, switches: { dynIn: boolean, compIn: boolean, expIn: boolean }) {
    if (!this.compressor || !this.context) return;
    this.dynIn = switches.dynIn;
    this.compIn = switches.compIn;
    this.expIn = switches.expIn;

    const now = this.context.currentTime;
    
    if (this.dynIn && this.compIn) {
        this.compressor.threshold.setTargetAtTime(comp.threshold, now, 0.05);
        this.compressor.ratio.setTargetAtTime(comp.ratio, now, 0.05);
        this.compressor.attack.setTargetAtTime(comp.attack / 1000, now, 0.05);
        this.compressor.release.setTargetAtTime(comp.release / 1000, now, 0.05);
    } else {
        // Bypass compressor
        this.compressor.threshold.setTargetAtTime(20, now, 0.05);
        this.compressor.ratio.setTargetAtTime(1, now, 0.05);
    }
  }

  public setGate(gate: any) {
      this.gateThreshold = gate.threshold;
      this.gateRange = -(gate.range || 40); // User expects positive range in UI
      this.gateRelease = gate.release || 100;
  }

  public getDynamicsLevels() {
      const compGR = (this.compressor && this.dynIn && this.compIn) ? -this.compressor.reduction : 0;
      return {
          compGR,
          gateGR: this.lastGateReduction
      };
  }

  public setSSLEQ(band: 'HF' | 'HMF' | 'LMF' | 'LF', freq: number, gain: number, Q: number = 1.2, isBell: boolean = false) {
      const nodes = { HF: this.eqHF, HMF: this.eqHMF, LMF: this.eqLMF, LF: this.eqLF };
      const node = nodes[band];
      if (node && this.context) {
          const now = this.context.currentTime;
          if (band === 'HF') node.type = isBell ? 'peaking' : 'highshelf';
          if (band === 'LF') node.type = isBell ? 'peaking' : 'lowshelf';
          node.frequency.setTargetAtTime(freq, now, 0.1);
          node.gain.setTargetAtTime(gain, now, 0.1);
          node.Q.setTargetAtTime(Q, now, 0.1);
          if (band === 'HMF') this.currentEQState.HMF = { freq, gain, q: Q };
      }
  }

  public setFilters(hpfFreq: number, lpfFreq: number) {
      if (!this.hpf || !this.lpf || !this.context) return;
      const now = this.context.currentTime;
      this.hpf.frequency.setTargetAtTime(hpfFreq, now, 0.05);
      this.lpf.frequency.setTargetAtTime(lpfFreq, now, 0.05);
  }

  public setMasterVolume(val: number) {
      if (this.masterGain && this.context) {
          this.masterGain.gain.setTargetAtTime(val, this.context.currentTime, 0.05);
      }
  }

  public getStereoLevels(): { left: number, right: number } {
     if (!this.analyserL || !this.analyserR) return { left: 0, right: 0 };
     const getRMS = (analyser: AnalyserNode) => {
         const data = new Uint8Array(analyser.fftSize);
         analyser.getByteTimeDomainData(data);
         let sum = 0;
         for (let i = 0; i < data.length; i++) {
             const x = (data[i] - 128) / 128.0;
             sum += x * x;
         }
         return Math.sqrt(sum / data.length);
     };
     return { left: getRMS(this.analyserL), right: getRMS(this.analyserR) };
  }

  public getAnalyser(): AnalyserNode | null {
    const a = this.context?.createAnalyser();
    if (a && this.masterGain) this.masterGain.connect(a);
    return a || null;
  }

  public async start(): Promise<void> {
    if (!this.context || !this.currentBuffer) return;
    if (this.context.state === 'suspended') await this.context.resume();
    if (this.isPlaying) return;
    this.sourceNode = this.context.createBufferSource();
    this.sourceNode.buffer = this.currentBuffer;
    this.sourceNode.loop = true;
    this.sourceNode.connect(this.inputGainNode!);
    this.sourceNode.start();
    this.isPlaying = true;
  }

  public stop(): void {
    if (this.sourceNode) { try { this.sourceNode.stop(); } catch (e) {} }
    this.sourceNode = null;
    this.isPlaying = false;
  }

  private async loadAllSamples() {
    if (!this.context) return;
    const instruments = Object.values(DrumInstrument);
    const promises = instruments.map(async (inst) => {
        try {
          const response = await fetch(`${REMOTE_SAMPLE_BASE_URL}${inst.toLowerCase().replace(/_/g, '-')}.mp3`);
          if (!response.ok) throw new Error();
          const arrayBuffer = await response.arrayBuffer();
          const buffer = await this.context!.decodeAudioData(arrayBuffer);
          this.instrumentBuffers.set(inst, buffer);
          this.loadedStatus.set(inst, true);
        } catch (e) {}
    });
    await Promise.all(promises);
  }

  public isInstrumentLoaded(type: DrumInstrument | 'CUSTOM'): boolean { return this.loadedStatus.get(type) || false; }
  public wasRestored(): boolean { return this.isRestoredFromDisk; }
  public setInstrument(instrument: DrumInstrument | 'CUSTOM'): void {
      const buffer = this.instrumentBuffers.get(instrument);
      if (buffer) {
          this.currentBuffer = buffer;
          if (this.isPlaying) { this.stop(); this.start(); }
      }
  }
  public playPreview(instrument: DrumInstrument | 'CUSTOM'): void {
      if (!this.context) return;
      const buffer = this.instrumentBuffers.get(instrument);
      if (!buffer) return;
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.inputGainNode!);
      source.start();
  }
  public async assignFileToInstrument(instrument: DrumInstrument, file: File): Promise<void> {
    if (!this.context) return;
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.instrumentBuffers.set(instrument, audioBuffer);
    this.loadedStatus.set(instrument, true);
    this.currentBuffer = audioBuffer;
  }
  public playUISound(type: 'init' | 'save') {
    if (!this.context) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const g = this.context.createGain();
    osc.frequency.setValueAtTime(type === 'init' ? 440 : 880, now);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(g);
    g.connect(this.context.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }
  public commitCurrentPreset(): Promise<void> { this.isRestoredFromDisk = true; return Promise.resolve(); }
  public bypassFilter(bypass: boolean): void {
      if (!this.eqHMF || !this.context) return;
      const now = this.context.currentTime;
      this.eqHMF.gain.setTargetAtTime(bypass ? 0 : this.currentEQState.HMF.gain, now, 0.05);
  }
  public setVHD(amount: number) {
      if (!this.preamp) return;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const k = amount * 10;
      for (let i = 0; i < n_samples; ++i) {
          const x = (i * 2) / n_samples - 1;
          curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
      }
      this.preamp.curve = curve;
  }
}

export const audioEngine = new AudioEngine();
