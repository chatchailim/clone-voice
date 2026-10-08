export interface VoiceProfile {
  id: string;
  name: string;
  language: 'th-TH' | 'en-US';
  gender: 'male' | 'female' | 'neutral';
  description: string;
  isCustom: boolean;
  speakerVerificationScore?: number;
  synthIdVerified: boolean;
  createdAt: string;
  geminiBaseVoice: string;
  acousticProfile: {
    sampleRate: number;
    pitchHz: number;
    clarityScore: number;
    snrDb: number;
  };
}

export interface DialogueLine {
  id: string;
  speaker: string;
  voiceId: string;
  text: string;
  style?: string;
}

export interface GenerationResult {
  audioBase64: string;
  mimeType: string;
  voiceId: string;
  voiceName: string;
  latencyMs: number;
  synthIdWatermarked: boolean;
  c2paCompliant: boolean;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  provider: string;
  stageDirectionsParsed: boolean;
}

export interface VerificationResult {
  success: boolean;
  verified: boolean;
  voice?: VoiceProfile;
  transcript?: string;
  expectedStatement?: string;
  confidenceScore?: number;
  synthIdWatermark?: string;
  c2paCompliant?: boolean;
  message?: string;
  error?: string;
  reason?: string;
}
