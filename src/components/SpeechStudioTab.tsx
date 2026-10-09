import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Volume2,
  Users,
  User,
  Zap,
  Tag,
  ShieldCheck,
  Cpu,
  Bookmark,
  Check,
  Copy,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  FileDown,
  FileUp,
  VolumeX,
} from 'lucide-react';
import { VoiceProfile, GenerationResult, DialogueLine } from '../types';
import { AudioVisualizer } from './AudioVisualizer';

interface SpeechStudioTabProps {
  voices: VoiceProfile[];
  activeVoice: VoiceProfile | null;
  setActiveVoice: (voice: VoiceProfile) => void;
  onGenerationComplete?: (result: GenerationResult) => void;
}

export const SpeechStudioTab: React.FC<SpeechStudioTabProps> = ({
  voices,
  activeVoice,
  setActiveVoice,
  onGenerationComplete,
}) => {
  // Mode: Single Speaker or Dual-Speaker Scene
  const [mode, setMode] = useState<'single' | 'dialogue'>('single');

  // Script text for single mode
  const [scriptText, setScriptText] = useState(
    '[excited] ยินดีด้วยครับ! [normal] ระบบโคลนเสียง Gemini 3.8 Flash TTS เชื่อมต่อสำเร็จแล้ว [laughs] เสียงนี้ฟังดูเป็นธรรมชาติและสมจริงมากเลยครับ'
  );

  // Dialogue lines for dual mode
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
    {
      id: '1',
      speaker: 'Alex',
      voiceId: voices[0]?.id || '',
      text: '[excited] สวัสดีครับคุณแซม! วันนี้เรามาทดสอบระบบ Gemini 3.8 Flash TTS กัน',
      style: 'Enthusiastic podcast host',
    },
    {
      id: '2',
      speaker: 'Sam',
      voiceId: voices[1]?.id || voices[0]?.id || '',
      text: '[normal] สวัสดีครับอเล็กซ์ |mhm| น่าทึ่งมากเลยครับ ที่มีระบบตรวจสอบความยินยอมและลายน้ำ SynthID ควบคู่มาด้วย',
      style: 'Curious, articulate co-host',
    },
    {
      id: '3',
      speaker: 'Alex',
      voiceId: voices[0]?.id || '',
      text: '[cheerful] ถูกต้องเลยครับ [laughs] แถมยังรองรับ Stage Directions ใส่อารมณ์ได้อย่างแม่นยำด้วย!',
      style: 'Enthusiastic host',
    },
  ]);

  // Synthesis Parameters
  const [model, setModel] = useState<'gemini-3.8-flash-tts' | 'gemini-3.8-flash-lite-tts'>('gemini-3.8-flash-tts');
  const [stageDirections, setStageDirections] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);

  // Generation status & Output
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<GenerationResult | null>(null);

  // Per-line individual testing state
  const [previewingLineId, setPreviewingLineId] = useState<string | null>(null);

  // Audio Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update dialogue lines if active voice changes
  useEffect(() => {
    if (activeVoice && dialogueLines.length > 0 && !dialogueLines[0].voiceId) {
      setDialogueLines((prev) =>
        prev.map((line, idx) => ({
          ...line,
          voiceId: idx % 2 === 0 ? activeVoice.id : voices[1]?.id || activeVoice.id,
        }))
      );
    }
  }, [activeVoice, voices]);

  // Handle stage direction tag insertion into textarea
  const insertTag = (tag: string) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = scriptText;
    const newText = text.substring(0, start) + `${tag} ` + text.substring(end);
    setScriptText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length + 1, start + tag.length + 1);
    }, 50);
  };

  // Play short auditory preview of stage direction tag
  const playTagSample = (tag: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (tag === '[excited]' || tag === '[cheerful]') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(580, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      } else if (tag === '[laughs]' || tag === '<laugh>') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(520, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(460, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      } else if (tag === '|mhm|' || tag === '|yeah|') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(290, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      } else if (tag === '<breath>' || tag === '[sighs]') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      }

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio tag preview error:', e);
    }
  };

  // Preset Script Library (Expanded with Industry Templates)
  const loadPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'thai_tech':
        setMode('single');
        setScriptText(
          '[formal] ขอต้อนรับทุกท่านสู่การเปิดตัวเทคโนโลยี Gemini 3.8 Flash TTS [excited] วันนี้เราขอนำเสนอระบบ Voice Replication [normal] ที่สามารถโคลนเสียงสังเคราะห์คุณภาพสูงในระดับ 24kHz Mono 16-bit PCM [laughs] ได้อย่างรวดเร็วและปลอดภัยครับ'
        );
        break;
      case 'thai_customer':
        setMode('single');
        setScriptText(
          '[polite] สวัสดีค่ะ ศูนย์บริการลูกค้าอัจฉริยะยินดีให้บริการ [normal] ดิฉันได้ตรวจสอบข้อมูลการลงทะเบียนเสียงของคุณเรียบร้อยแล้วค่ะ [cheerful] มีรายการใดที่ต้องการให้ช่วยดูแลเพิ่มเติมในวันนี้ไหมคะ?'
        );
        break;
      case 'thai_story':
        setMode('single');
        setScriptText(
          '[whispering] ท่ามกลางความเงียบสงัดของป่าลึก... [short-pause] [mysterious] แสงประหลาดสีฟ้าเริ่มปรากฏขึ้นบนยอดเขา [excited] ทันใดนั้นเอง! [gasp] เขาก็ตระหนักได้ว่า มีใครบางคนกำลังจ้องมองอยู่'
        );
        break;
      case 'ecom_live':
        setMode('single');
        setScriptText(
          '[excited] สวัสดีทุกคนในไลฟ์ครับ! [laughs] วันนี้จัดโปรโมชั่นพิเศษสุดคุ้ม ลดทันที 50% สำหรับ 10 ท่านแรกเท่านั้น! [cheerful] กดตะกร้าได้เลยครับ ช้าหมดอดแน่นอน!'
        );
        break;
      case 'elearn_lecture':
        setMode('single');
        setScriptText(
          '[formal] ในบทเรียนนี้ เราจะมาทำความเข้าใจเกี่ยวกับสถาปัตยกรรม Text-to-Speech ยุคใหม่ [normal] ซึ่งทำงานร่วมกับลายน้ำดิจิทัล SynthID [short-pause] เพื่อให้การนำ AI ไปใช้งานเป็นไปอย่างโปร่งใสครับ'
        );
        break;
      case 'emergency_alert':
        setMode('single');
        setScriptText(
          '[serious] ประกาศแจ้งเตือนสภาพอากาศฉุกเฉิน [short-pause] [formal] ขอให้ประชาชนในพื้นที่เสี่ยงภัยระมัดระวังฝนตกหนักและคลื่นลมแรงในระยะ 24 ชั่วโมงข้างหน้าอย่างใกล้ชิด'
        );
        break;
      case 'english_podcast':
        setMode('dialogue');
        setDialogueLines([
          {
            id: '1',
            speaker: 'Alex',
            voiceId: voices.find((v) => v.id.includes('alex'))?.id || activeVoice?.id || voices[0].id,
            text: '[excited] Welcome back everyone! <breath> Today we are testing the brand new Gemini 3.8 Flash TTS engine.',
            style: 'Enthusiastic podcast host',
          },
          {
            id: '2',
            speaker: 'Sam',
            voiceId: voices.find((v) => v.id.includes('sam'))?.id || voices[1]?.id || voices[0].id,
            text: "[normal] That's right, |yeah| the voice replication fidelity with SynthID digital watermarking is truly groundbreaking.",
            style: 'Articulate specialist',
          },
          {
            id: '3',
            speaker: 'Alex',
            voiceId: voices.find((v) => v.id.includes('alex'))?.id || activeVoice?.id || voices[0].id,
            text: '[cheerful] Absolutely! [laughs] And notice how natural the backchanneling and stage directions feel.',
            style: 'Host',
          },
        ]);
        break;
      case 'quick_test':
        setMode('single');
        setScriptText(
          '[excited] สวัสดีครับ! [mhm] นี่คือการทดสอบความเร็วและอารมณ์ของเสียงโคลน Gemini Voice Replication [laughs] ทำงานได้อย่างสมบูรณ์แบบครับ!'
        );
        break;
    }
  };

  // Export Script Project
  const exportScript = () => {
    const projectData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      mode,
      model,
      speed,
      pitch,
      stageDirections,
      singleScript: scriptText,
      dialogueLines: mode === 'dialogue' ? dialogueLines : undefined,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini_tts_script_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Import Script Project
  const handleImportScript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (json.singleScript) setScriptText(json.singleScript);
          if (json.mode) setMode(json.mode);
          if (json.dialogueLines) setDialogueLines(json.dialogueLines);
          if (json.speed) setSpeed(json.speed);
          if (json.pitch) setPitch(json.pitch);
          alert('นำเข้าสคริปต์สำเร็จเรียบร้อยแล้ว!');
        } else {
          setScriptText(text);
        }
      } catch (err) {
        alert('ไม่สามารถอ่านไฟล์สคริปต์ได้ กรุณาตรวจสอบฟอร์แมตไฟล์');
      }
    };
    reader.readAsText(file);
  };

  // Speech Generation Execution
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const payload: any = {
        model,
        voiceId: activeVoice?.id || voices[0]?.id,
        stageDirections,
        speed,
        pitch,
        isDialogueMode: mode === 'dialogue',
      };

      if (mode === 'dialogue') {
        payload.dialogueLines = dialogueLines;
      } else {
        payload.text = scriptText;
      }

      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: GenerationResult = await res.json();

      if (data.audioBase64 && audioRef.current) {
        setLastResult(data);
        if (onGenerationComplete) onGenerationComplete(data);

        const audioBlob = base64ToBlob(data.audioBase64, data.mimeType || 'audio/wav');
        const url = URL.createObjectURL(audioBlob);
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error generating audio:', err);
      alert('เกิดข้อผิดพลาดในการสังเคราะห์เสียง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
    }
  };

  // Test single line in dialogue mode
  const testSingleLine = async (line: DialogueLine) => {
    setPreviewingLineId(line.id);
    try {
      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          voiceId: line.voiceId || activeVoice?.id || voices[0]?.id,
          text: line.text,
          stageDirections: true,
          speed,
          pitch,
        }),
      });

      const data: GenerationResult = await res.json();
      if (data.audioBase64 && audioRef.current) {
        const audioBlob = base64ToBlob(data.audioBase64, 'audio/wav');
        const url = URL.createObjectURL(audioBlob);
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('Line preview error:', err);
    } finally {
      setPreviewingLineId(null);
    }
  };

  // Convert Base64 string to Blob
  const base64ToBlob = (base64: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: mimeType });
  };

  // Audio Playback Controls
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setPlaybackTime(targetTime);
    }
  };

  const changeSpeed = (newRate: number) => {
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const downloadWav = () => {
    if (!lastResult?.audioBase64) return;
    const blob = base64ToBlob(lastResult.audioBase64, 'audio/wav');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini_tts_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Dialogue Line Add/Remove/Re-order
  const addDialogueLine = () => {
    const nextSpeaker = dialogueLines.length % 2 === 0 ? 'Alex' : 'Sam';
    const nextVoice = dialogueLines.length % 2 === 0 ? voices[0]?.id : voices[1]?.id || voices[0]?.id;
    setDialogueLines([
      ...dialogueLines,
      {
        id: Date.now().toString(),
        speaker: nextSpeaker,
        voiceId: nextVoice,
        text: '[normal] ข้อความสนทนาตอนใหม่...',
        style: 'Natural speaking',
      },
    ]);
  };

  const removeDialogueLine = (id: string) => {
    if (dialogueLines.length <= 2) return;
    setDialogueLines(dialogueLines.filter((l) => l.id !== id));
  };

  const updateDialogueLine = (id: string, updates: Partial<DialogueLine>) => {
    setDialogueLines(dialogueLines.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const moveDialogueLine = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === dialogueLines.length - 1)) {
      return;
    }
    const newLines = [...dialogueLines];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newLines[index];
    newLines[index] = newLines[targetIndex];
    newLines[targetIndex] = temp;
    setDialogueLines(newLines);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setPlaybackTime(audioRef.current.currentTime);
            setPlaybackDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Hidden file input for script import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,.txt"
        onChange={handleImportScript}
        className="hidden"
      />

      {/* Mode & Voice Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Mode switch */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('single')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'single'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>โหมดผู้พูดเดี่ยว (Single Speaker)</span>
          </button>

          <button
            onClick={() => setMode('dialogue')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'dialogue'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>โหมดบทสนทนา 2 คน (Dual-Speaker Scene)</span>
          </button>
        </div>

        {/* Selected Voice info & Script Save/Load buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {mode === 'single' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">เสียง:</span>
              <select
                value={activeVoice?.id || voices[0]?.id}
                onChange={(e) => {
                  const selected = voices.find((v) => v.id === e.target.value);
                  if (selected) setActiveVoice(selected);
                }}
                className="bg-slate-950 border border-slate-800 text-cyan-300 font-semibold text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.isCustom ? 'Replicated Voice' : 'Preset'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Import / Export Script buttons */}
          <button
            onClick={exportScript}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
            title="บันทึกสคริปต์ลงเครื่อง (Export Script JSON)"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">เซฟสคริปต์</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
            title="โหลดสคริปต์จากไฟล์ (Import Script JSON)"
          >
            <FileUp className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">โหลดสคริปต์</span>
          </button>
        </div>
      </div>

      {/* Expanded Industry Presets Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap flex items-center space-x-1">
          <Bookmark className="w-3.5 h-3.5" />
          <span>เทมเพลตสคริปต์:</span>
        </span>
        <button
          onClick={() => loadPreset('thai_tech')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
        >
          ข่าวเทคโนโลยี (Tech News)
        </button>
        <button
          onClick={() => loadPreset('ecom_live')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-amber-300 whitespace-nowrap cursor-pointer transition-colors"
        >
          ไลฟ์ขายของ (E-Commerce Live)
        </button>
        <button
          onClick={() => loadPreset('thai_customer')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
        >
          บริการลูกค้า (IVR / Call Center)
        </button>
        <button
          onClick={() => loadPreset('elearn_lecture')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-cyan-300 whitespace-nowrap cursor-pointer transition-colors"
        >
          บทเรียนออนไลน์ (E-Learning)
        </button>
        <button
          onClick={() => loadPreset('thai_story')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
        >
          นิยายเสียงตื่นเต้น (Audiobook)
        </button>
        <button
          onClick={() => loadPreset('english_podcast')}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
        >
          พอดแคสต์คู่สนทนา (Dual Podcast)
        </button>
      </div>

      {/* Editor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Script / Dialogue Editor */}
        <div className="lg:col-span-2 space-y-4">
          {mode === 'single' ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>สคริปต์คำพูดพร้อม Stage Directions</span>
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {scriptText.length} ตัวอักษร
                </span>
              </div>

              {/* Quick Stage Direction Inserter Buttons with Audio Sample Preview */}
              <div className="flex flex-wrap gap-1.5 py-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider self-center mr-1">
                  คำสั่งอารมณ์:
                </span>
                {[
                  { label: 'ตื่นเต้น', tag: '[excited]', color: 'text-amber-400' },
                  { label: 'ปกติ', tag: '[normal]', color: 'text-slate-300' },
                  { label: 'หัวเราะ', tag: '[laughs]', color: 'text-emerald-400' },
                  { label: 'ถอนหายใจ', tag: '[sighs]', color: 'text-sky-400' },
                  { label: 'ตอบรับ |mhm|', tag: '|mhm|', color: 'text-cyan-400' },
                  { label: 'กระซิบ', tag: '[whispering]', color: 'text-indigo-400' },
                  { label: 'หายใจ <breath>', tag: '<breath>', color: 'text-purple-400' },
                  { label: 'ตกใจ <gasp>', tag: '<gasp>', color: 'text-pink-400' },
                  { label: 'เว้นจังหวะสั้น', tag: '[short-pause]', color: 'text-slate-400' },
                ].map((item) => (
                  <div
                    key={item.tag}
                    className="inline-flex items-center rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-mono transition-colors"
                  >
                    <button
                      onClick={() => insertTag(item.tag)}
                      className="px-2 py-1 cursor-pointer"
                      title={`คลิกเพื่อแทรก ${item.tag} ลงในสคริปต์`}
                    >
                      <span className={item.color}>{item.tag}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTagSample(item.tag);
                      }}
                      className="pr-1.5 pl-0.5 text-slate-500 hover:text-cyan-300 cursor-pointer"
                      title={`ฟังตัวอย่างเสียง ${item.tag}`}
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                rows={7}
                placeholder="พิมพ์สคริปต์ที่ต้องการสังเคราะห์เสียง... สามารถใส่คำสั่งอารมณ์ เช่น [excited], [laughs], |mhm|"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed"
              />
            </div>
          ) : (
            /* Dialogue Scene Editor with Turn Re-ordering and Individual Line Testing */
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>บทสนทนาสลับผู้พูด (Dual-Speaker Screenplay)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    จำลองบทสนทนาโต้ตอบระหว่าง 2 ผู้พูดด้วยโมเดล Gemini 3.8 Flash TTS ในรอบเดียว พร้อมปุ่มเรียงลำดับและทดสอบทีละบรรทัด
                  </p>
                </div>
                <button
                  onClick={addDialogueLine}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold inline-flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มบทสนทนา</span>
                </button>
              </div>

              <div className="space-y-3">
                {dialogueLines.map((line, index) => (
                  <div
                    key={line.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={line.speaker}
                          onChange={(e) => updateDialogueLine(line.id, { speaker: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-bold w-24"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={line.voiceId}
                          onChange={(e) => updateDialogueLine(line.id, { voiceId: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                        >
                          {voices.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name.split('(')[0]}
                            </option>
                          ))}
                        </select>

                        {/* Test Single Line Button */}
                        <button
                          onClick={() => testSingleLine(line)}
                          disabled={previewingLineId === line.id}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs cursor-pointer"
                          title="ทดลองฟังเฉพาะบรรทัดนี้"
                        >
                          {previewingLineId === line.id ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        {/* Move Up / Down Buttons */}
                        <button
                          onClick={() => moveDialogueLine(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="เลื่อนขึ้น"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveDialogueLine(index, 'down')}
                          disabled={index === dialogueLines.length - 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="เลื่อนลง"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {dialogueLines.length > 2 && (
                          <button
                            onClick={() => removeDialogueLine(line.id)}
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                            title="ลบแถวนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      value={line.text}
                      onChange={(e) => updateDialogueLine(line.id, { text: e.target.value })}
                      placeholder="ข้อความที่ผู้พูดนี้จะพูด..."
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-sans"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trigger Generate Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white shadow-xl flex items-center justify-center space-x-3 cursor-pointer transition-all ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-blue-500/20 hover:scale-[1.01]'
              }`}
            >
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
              <span>
                {isGenerating
                  ? 'กำลังสร้างเสียงสังเคราะห์ด้วย Gemini 3.8 Flash...'
                  : 'สังเคราะห์เสียงพูด (Synthesize Voice)'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Col: Parameters & Configuration */}
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>พารามิเตอร์โมเดล (Model Settings)</span>
            </h4>

            {/* Model switch */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">โมเดล Text-to-Speech</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              >
                <option value="gemini-3.8-flash-tts">gemini-3.8-flash-tts (Flagship &amp; Expressive)</option>
                <option value="gemini-3.8-flash-lite-tts">gemini-3.8-flash-lite-tts (Low-Latency)</option>
              </select>
            </div>

            {/* Stage Directions Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white block">Expressive Stage Directions</span>
                <span className="text-[11px] text-slate-400 block">เปิดใช้งานคำสั่งอารมณ์และเสียงแทรก</span>
              </div>
              <input
                type="checkbox"
                checked={stageDirections}
                onChange={(e) => setStageDirections(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Speed slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">ความเร็วในการพูด (Speech Rate):</span>
                <span className="font-mono text-cyan-400">{speed}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Pitch slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">ระดับความสูงของเสียง (Pitch Shift):</span>
                <span className="font-mono text-cyan-400">{pitch}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Specs Card */}
            <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/40 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Output Format:</span>
                <span className="font-mono font-semibold text-slate-200">WAV (24kHz Mono 16-bit)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Digital Watermark:</span>
                <span className="font-mono font-semibold text-emerald-400">SynthID + C2PA</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Latency Optimization:</span>
                <span className="font-mono font-semibold text-cyan-400">Sub-second Flash</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Audio Player & Result Card */}
      {lastResult && (
        <div className="bg-slate-900/95 border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-sm font-bold text-white">ผลลัพธ์เสียงสังเคราะห์ (Synthesis Output)</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {lastResult.voiceName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Latency: <span className="text-cyan-300 font-mono font-semibold">{lastResult.latencyMs}ms</span> &bull;
                Format: <span className="text-slate-300 font-mono">24kHz Mono 16-bit PCM RIFF</span>
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={downloadWav}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center space-x-1.5 border border-slate-700 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลด .WAV</span>
              </button>

              <div className="flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-xl text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SynthID Verified</span>
              </div>
            </div>
          </div>

          {/* Canvas Waveform */}
          <AudioVisualizer isPlaying={isPlaying} barColor="#38bdf8" height={80} />

          {/* Timeline & Controls */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 cursor-pointer transition-all shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1">
                <input
                  type="range"
                  min="0"
                  max={playbackDuration || 10}
                  step="0.05"
                  value={playbackTime}
                  onChange={handleSeek}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{playbackTime.toFixed(1)}s</span>
                  <span>{playbackDuration ? playbackDuration.toFixed(1) + 's' : '0.0s'}</span>
                </div>
              </div>

              {/* Speed Rate Pill Buttons */}
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    className={`px-2 py-1 rounded text-[10px] font-mono font-semibold cursor-pointer ${
                      playbackRate === rate ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
