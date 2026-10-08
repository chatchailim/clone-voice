import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VoiceCloneTab } from './components/VoiceCloneTab';
import { SpeechStudioTab } from './components/SpeechStudioTab';
import { SpectrumAnalysisTab } from './components/SpectrumAnalysisTab';
import { CodeExportTab } from './components/CodeExportTab';
import { VoiceProfile, GenerationResult } from './types';
import { ShieldCheck, Cpu, Mic2, HeartHandshake } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'clone' | 'tts' | 'spectrum' | 'code'>('clone');
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [activeVoice, setActiveVoice] = useState<VoiceProfile | null>(null);
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);
  const [serverReady, setServerReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch initial voices and check server health
  useEffect(() => {
    async function init() {
      try {
        const [healthRes, voicesRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/voices'),
        ]);

        if (healthRes.ok) {
          setServerReady(true);
        }

        if (voicesRes.ok) {
          const data = await voicesRes.json();
          if (data.voices && data.voices.length > 0) {
            setVoices(data.voices);
            setActiveVoice(data.voices[0]);
          }
        }
      } catch (err) {
        console.warn('Initial fetch issue:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleVoiceCreated = (newVoice: VoiceProfile) => {
    setVoices((prev) => [newVoice, ...prev]);
    setActiveVoice(newVoice);
  };

  const handleVoiceDeleted = async (voiceId: string) => {
    try {
      const res = await fetch(`/api/voices/${encodeURIComponent(voiceId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setVoices((prev) => prev.filter((v) => v.id !== voiceId));
        if (activeVoice?.id === voiceId) {
          const remaining = voices.filter((v) => v.id !== voiceId);
          setActiveVoice(remaining[0] || null);
        }
      }
    } catch (err) {
      console.error('Failed to delete voice:', err);
    }
  };

  const handleGenerationComplete = (result: GenerationResult) => {
    setLastResult(result);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeVoice={activeVoice}
        serverReady={serverReady}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">กำลังเชื่อมต่อระบบ Gemini 3.8 Flash Voice Engine...</p>
          </div>
        ) : (
          <>
            {activeTab === 'clone' && (
              <VoiceCloneTab
                voices={voices}
                activeVoice={activeVoice}
                setActiveVoice={setActiveVoice}
                onVoiceCreated={handleVoiceCreated}
                onVoiceDeleted={handleVoiceDeleted}
                onProceedToTTS={() => setActiveTab('tts')}
              />
            )}

            {activeTab === 'tts' && (
              <SpeechStudioTab
                voices={voices}
                activeVoice={activeVoice}
                setActiveVoice={setActiveVoice}
                onGenerationComplete={handleGenerationComplete}
              />
            )}

            {activeTab === 'spectrum' && (
              <SpectrumAnalysisTab
                activeVoice={activeVoice}
                lastResult={lastResult}
              />
            )}

            {activeTab === 'code' && (
              <CodeExportTab activeVoice={activeVoice} />
            )}
          </>
        )}
      </main>

      {/* Footer & Compliance Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Google Gemini 3.8 Flash TTS Voice Replication Architecture</span>
            <span className="text-slate-600">&bull;</span>
            <span className="font-mono text-slate-500">WAV 24kHz Mono 16-bit PCM</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SynthID &amp; C2PA Protected</span>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-400">Speaker Consent Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
