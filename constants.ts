import { ISOFrequency } from './types';

// Beginner: Standard 1 Octave bands (ISO 266 preferred numbers for 10-band EQ)
export const ISO_FREQUENCIES_BEGINNER: ISOFrequency[] = [
  { hz: 63, label: '63Hz' },
  { hz: 125, label: '125Hz' },
  { hz: 250, label: '250Hz' },
  { hz: 500, label: '500Hz' },
  { hz: 1000, label: '1kHz' },
  { hz: 2000, label: '2kHz' },
  { hz: 4000, label: '4kHz' },
  { hz: 8000, label: '8kHz' },
  { hz: 16000, label: '16kHz' },
];

// Intermediate: Standard 2/3 Octave bands (ISO 266 for 15-band EQ)
// Note: Center frequencies shift compared to 1 Octave.
export const ISO_FREQUENCIES_INTERMEDIATE: ISOFrequency[] = [
  { hz: 40, label: '40Hz' },
  { hz: 63, label: '63Hz' },
  { hz: 100, label: '100Hz' },
  { hz: 160, label: '160Hz' },
  { hz: 250, label: '250Hz' },
  { hz: 400, label: '400Hz' },
  { hz: 630, label: '630Hz' },
  { hz: 1000, label: '1k' },
  { hz: 1600, label: '1.6k' },
  { hz: 2500, label: '2.5k' },
  { hz: 4000, label: '4k' },
  { hz: 6300, label: '6.3k' },
  { hz: 10000, label: '10k' },
  { hz: 16000, label: '16k' },
];

// Expert: Standard 1/3 Octave bands (ISO 266 for 31-band EQ)
export const ISO_FREQUENCIES_EXPERT: ISOFrequency[] = [
  { hz: 50, label: '50' },
  { hz: 63, label: '63' },
  { hz: 80, label: '80' },
  { hz: 100, label: '100' },
  { hz: 125, label: '125' },
  { hz: 160, label: '160' },
  { hz: 200, label: '200' },
  { hz: 250, label: '250' },
  { hz: 315, label: '315' },
  { hz: 400, label: '400' },
  { hz: 500, label: '500' },
  { hz: 630, label: '630' },
  { hz: 800, label: '800' },
  { hz: 1000, label: '1k' },
  { hz: 1250, label: '1.25k' },
  { hz: 1600, label: '1.6k' },
  { hz: 2000, label: '2k' },
  { hz: 2500, label: '2.5k' },
  { hz: 3150, label: '3.15k' },
  { hz: 4000, label: '4k' },
  { hz: 5000, label: '5k' },
  { hz: 6300, label: '6.3k' },
  { hz: 8000, label: '8k' },
  { hz: 10000, label: '10k' },
  { hz: 12500, label: '12.5k' },
  { hz: 16000, label: '16k' },
];

export const DEFAULT_GAIN_DB = 9; // 9dB boost/cut for tests
export const DEFAULT_Q = 2.5; // Slightly sharper Q for higher density drills
