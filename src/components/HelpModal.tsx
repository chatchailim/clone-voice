import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  HelpCircle,
  BookOpen,
  GitFork,
  Terminal,
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle2,
  Mic2,
  Volume2,
  Layers,
  Cpu,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import mermaid from 'mermaid';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: 'clone' | 'tts' | 'spectrum' | 'code') => void;
}

// Mermaid Renderer Component
const MermaidViewer: React.FC<{ chart: string; id: string }> = ({ chart, id }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Noto Sans Thai, Plus Jakarta Sans, sans-serif',
      themeVariables: {
        darkMode: true,
        background: '#090d16',
        primaryColor: '#2563eb',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#3b82f6',
        lineColor: '#60a5fa',
        secondaryColor: '#059669',
        tertiaryColor: '#1e293b',
      },
    });

    let isMounted = true;
    const renderChart = async () => {
      if (!containerRef.current) return;
      try {
        const uniqueId = `mermaid-${id}-${Math.random().toString(36).substring(2, 8)}`;
        const { svg } = await mermaid.render(uniqueId, chart);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err: any) {
        console.warn('Mermaid rendering issue:', err);
        if (isMounted) {
          setError(err?.message || 'Rendering error');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, id]);

  if (error) {
    return (
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 overflow-x-auto">
        <div className="text-amber-400 font-bold mb-2">Mermaid Source Code:</div>
        <pre>{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 flex justify-center items-center min-h-[160px] text-slate-200"
    />
  );
};

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onSelectTab }) => {
  const [activeSection, setActiveSection] = useState<'guide' | 'diagrams' | 'tags' | 'glossary' | 'faq'>('guide');
  const [glossarySearch, setGlossarySearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  // Mermaid Diagrams source definitions
  const architectureDiagram = `flowchart TD
    subgraph Client["🖥️ ส่วนหน้าบ้านผู้ใช้งาน (Browser UI)"]
        R1["🎙️ บันทึกเสียงต้นฉบับ (30s)"]
        R2["📜 บันทึกคำยินยอมบังคับ"]
        Studio["✍️ สคริปต์ + Stage Directions"]
        Player["🔊 เครื่องเล่นเสียง Interactive Waveform"]
    end

    subgraph Server["⚙️ เซิร์ฟเวอร์เกตเวย์ (Express Backend)"]
        V_API["POST /api/verify-voice"]
        T_API["POST /api/generate-speech"]
        Registry[("🗄️ Voice Registry")]
    end

    subgraph GoogleAI["☁️ Google GenAI Cloud"]
        Transcribe["🤖 Gemini Transcribe (ตรวจคำยินยอม)"]
        FlashTTS["⚡ gemini-3.8-flash-tts"]
        SynthID["🛡️ SynthID Watermark Engine"]
    end

    R1 & R2 --> V_API
    V_API --> Transcribe
    Transcribe -- ยินยอมถูกต้อง --> Registry
    Studio --> T_API
    Registry -. ดึง voice_id .-> Studio
    T_API --> FlashTTS --> SynthID --> T_API
    T_API -- WAV 24kHz Mono 16-bit --> Player`;

  const sequenceDiagram = `sequenceDiagram
    autonumber
    actor User as ผู้ใช้งาน
    participant UI as เว็บแอปพลิเคชัน
    participant Server as เซิร์ฟเวอร์เกตเวย์
    participant Gemini as Google Gemini 3.8 Flash

    User->>UI: บันทึกเสียงต้นฉบับ 30s + เสียงยินยอม
    User->>UI: คลิก "เริ่มตรวจสอบอัตลักษณ์เสียง"
    UI->>Server: POST /api/verify-voice
    Server->>Gemini: ถอดเสียงและตรวจคำยินยอม (Transcribe & Match)
    Gemini-->>Server: ข้อความยินยอมถูกต้อง 100%
    Server-->>UI: อนุมัติสำเร็จ! ออกรหัส voice_id
    UI-->>User: แสดงการ์ดสีเขียว ปลดล็อกสตูดิโอ

    User->>UI: ใส่สคริปต์ [excited] ยินดีด้วยครับ! [laughs]
    User->>UI: คลิก "สังเคราะห์เสียงพูด"
    UI->>Server: POST /api/generate-speech
    Server->>Gemini: สังเคราะห์ด้วย gemini-3.8-flash-tts
    Gemini->>Gemini: ฝังลายน้ำดิจิทัล SynthID ในคลื่นเสียง
    Gemini-->>Server: ส่งกลับไฟล์ Uncompressed WAV 24kHz
    Server-->>UI: ส่งมอบ audioBase64
    UI->>UI: เล่นเสียงและเรนเดอร์ Waveform`;

  const stateDiagram = `stateDiagram-v2
    [*] --> Idle: เปิดหน้าเว็บแอปพลิเคชัน
    Idle --> RecordingRef: อัดเสียงต้นฉบับ (Reference)
    RecordingRef --> RefReady: อัดครบ 30 วินาที
    RefReady --> RecordingConsent: อัดเสียงอ่านคำยินยอม
    RecordingConsent --> ConsentReady: อ่านประโยคกฎหมายครบถ้วน
    ConsentReady --> Verifying: กดตรวจสอบอัตลักษณ์
    
    state Verifying {
        [*] --> CheckSNR: ตรวจสอบความชัดเจนและเสียงรบกวน
        CheckSNR --> Transcribe: Gemini ถอดรหัสข้อความ
        Transcribe --> CheckLegal: ตรวจจับคำยินยอมทางกฎหมาย
    }

    Verifying --> Failed: ไม่พบคำยินยอม / ผิดประโยค
    Failed --> RecordingConsent: แนะนำให้อัดใหม่
    Verifying --> Approved: ผ่านเกณฑ์ (Score >= 85%)
    Approved --> VoiceActive: ออกรหัส Voice ID
    VoiceActive --> [*]`;

  // Glossary items
  const glossaryItems = [
    {
      term: 'Gemini 3.8 Flash TTS',
      en: 'gemini-3.8-flash-tts',
      badge: 'Core Model',
      desc: 'โมเดลปัญญาประดิษฐ์รุ่นใหม่ของ Google ที่ออกแบบมาสำหรับงาน Voice Design, บทสนทนา 2 ตัวละคร, และการประมวลผลคำสั่งอารมณ์ความเร็วสูงในระดับมิลลิวินาที',
    },
    {
      term: 'Voice ID',
      en: 'Replicated Voice Identifier',
      badge: 'Identifier',
      desc: 'รหัสประจำตัวเฉพาะของโมเดลเสียงโคลน เช่น voices/rep_th_20261009_a4f1 ที่นำไปใช้เรียกสั่งสังเคราะห์เสียงผ่าน API หรือระบบอัตโนมัติ',
    },
    {
      term: 'Mandatory Consent Statement',
      en: 'Legal Consent Audio Statement',
      badge: 'Compliance',
      desc: 'ข้อความยินยอมบังคับทางกฎหมายที่ผู้พูดต้องอ่านด้วยเสียงจริงของตนเอง เพื่อป้องกันการแอบอ้างขโมยอัตลักษณ์เสียง (Anti-Impersonation) และป้องกัน Deepfake',
    },
    {
      term: 'SynthID',
      en: 'Digital Audio Watermark',
      badge: 'Security',
      desc: 'เทคโนโลยีลายน้ำดิจิทัลของ Google DeepMind ที่ฝังแพทเทิร์นคณิตศาสตร์ลงในสเปกตรัมเสียงอย่างแนบเนียน หูมนุษย์ไม่ได้ยิน และไม่หายไปแม้แปลงฟอร์แมตหรือบีบอัดไฟล์',
    },
    {
      term: 'C2PA',
      en: 'Content Credentials Standard',
      badge: 'Provenance',
      desc: 'มาตรฐานสากลว่าด้วยข้อมูลรับรองแหล่งกำเนิดและกรรมสิทธิ์ของเนื้อหาดิจิทัล ยืนยันว่าเสียงถูกสังเคราะห์อย่างโปร่งใสด้วย AI ของ Google',
    },
    {
      term: 'RIFF WAV 24kHz Mono 16-bit',
      en: 'Audio Output Standard',
      badge: 'DSP Spec',
      desc: 'มาตรฐานฟอร์แมตไฟล์เสียงที่ไม่ผ่านการบีบอัด แซมเปิลเรต 24,000Hz 16-bit ช่องสัญญาณเดี่ยว พร้อมส่วนหัว 44-byte RIFF Header ให้ความคมชัดระดับห้องอัดเสียง',
    },
    {
      term: 'Stage Directions',
      en: 'Expressive Script Annotations',
      badge: 'Audio Tags',
      desc: 'คำสั่งกำกับอารมณ์และการแสดงที่เขียนในเครื่องหมายก้ามปู เช่น [excited], [normal], [whispering], [laughs] เพื่อให้น้ำเสียงมีความรู้สึกเสมือนมนุษย์จริง',
    },
    {
      term: 'Backchanneling',
      en: 'Conversational Backchanneling',
      badge: 'Dialogue Tag',
      desc: 'เสียงขานรับในลำคอหรือเสียงตอบรับสั้น ๆ เช่น |mhm|, |yeah| ที่ใช้ในบทสนทนาพอดแคสต์เพื่อให้การคุยโต้ตอบเป็นไปอย่างเป็นธรรมชาติ',
    },
    {
      term: 'Vocal Bursts',
      en: 'Acoustic Bursts & Gestures',
      badge: 'Acoustic Tag',
      desc: 'เสียงแทรกทางสรีรวิทยา เช่น เสียงหัวเราะ [laughs] หรือ <laugh>, เสียงสูดลมหายใจ <breath>, เสียงถอนหายใจ [sighs], เสียงตกใจ <gasp>',
    },
    {
      term: 'F0 Pitch (Fundamental Frequency)',
      en: 'Fundamental Voice Frequency',
      badge: 'Acoustics',
      desc: 'ความถี่มูลฐานของเส้นเสียงมนุษย์ (หน่วย Hz) บ่งบอกระดับความทุ้มหรือแหลมของเสียงพูด เช่น ผู้ชาย ~125Hz, ผู้หญิง ~210Hz',
    },
    {
      term: 'Signal-to-Noise Ratio (SNR)',
      en: 'Signal-to-Noise Ratio',
      badge: 'Acoustics',
      desc: 'อัตราส่วนความแรงของเสียงพูดเทียบกับเสียงรบกวนรอบข้างในหน่วย dB ค่า SNR ที่ดีควรมากกว่า 30 dB เพื่อให้การโคลนเสียงมีความคมชัดสูงสุด',
    },
    {
      term: 'Nyquist Frequency',
      en: 'Nyquist Limit (12 kHz)',
      badge: 'DSP Spec',
      desc: 'ขีดจำกัดความถี่สูงสุดที่ระบบสามารถบันทึกได้โดยไม่มีความเพี้ยน เท่ากับครึ่งหนึ่งของ Sample Rate (24kHz / 2 = 12kHz)',
    },
  ];

  const filteredGlossary = glossaryItems.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.en.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.desc.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  คู่มือและศูนย์การเรียนรู้ระบบ (Help &amp; Documentation)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  gemini-3.8-flash-tts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                เรียนรู้ขั้นตอนการทำงาน สถาปัตยกรรม ผังไดอะแกรม และคู่มือคำสั่งอารมณ์อย่างครบถ้วน
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="ปิดหน้าต่างคู่มือ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center space-x-2 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveSection('guide')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeSection === 'guide'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. ขั้นตอนการใช้งาน (Step-by-Step Guide)</span>
          </button>

          <button
            onClick={() => setActiveSection('diagrams')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeSection === 'diagrams'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>2. ผังไดอะแกรม (Mermaid Diagrams)</span>
          </button>

          <button
            onClick={() => setActiveSection('tags')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeSection === 'tags'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>3. คำสั่งอารมณ์ (Stage Directions)</span>
          </button>

          <button
            onClick={() => setActiveSection('glossary')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeSection === 'glossary'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. คำศัพท์เทคนิค (Glossary)</span>
          </button>

          <button
            onClick={() => setActiveSection('faq')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
              activeSection === 'faq'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>5. การแก้ปัญหา (Troubleshooting &amp; FAQ)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300 scrollbar-thin">
          {/* SECTION 1: Step-by-Step Guide */}
          {activeSection === 'guide' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/40 text-blue-200 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-white block mb-1">ยินดีต้อนรับสู่ระบบ Gemini Voice Replication Studio!</span>
                ระบบนี้ช่วยให้คุณสามารถสร้างแบบจำลองเสียงสังเคราะห์ส่วนบุคคล และนำไปสังเคราะห์ข้อความพร้อมใส่อารมณ์ได้อย่างเป็นธรรมชาติ
                เพียงทำตาม 6 ขั้นตอนง่าย ๆ ด้านล่างนี้:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                    <h3 className="font-bold text-white text-sm">บันทึกเสียงต้นฉบับ (Reference)</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ไปที่แท็บแรก <strong>"1. โคลนและตรวจสอบเสียง"</strong> แล้วกดปุ่มอัดเสียงไมค์ พูดคุยด้วยน้ำเสียงธรรมชาติ ความยาว <strong>30 วินาที – 1 นาที</strong> ในห้องที่เงียบ
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <h3 className="font-bold text-white text-sm">อ่านคำยินยอมบังคับ (Consent)</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    อ่านข้อความในกรอบสีเขียว: <br />
                    <span className="text-emerald-300 italic text-[11px] font-medium">
                      &ldquo;ฉันเป็นเจ้าของเสียงนี้ และฉันยินยอมให้ Google ใช้เสียงนี้เพื่อสร้างแบบจำลองเสียงสังเคราะห์&rdquo;
                    </span>
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                    <h3 className="font-bold text-white text-sm">ตรวจสอบอัตลักษณ์ &amp; ฟังเทียบเสียงคู่เคียง</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    คลิกปุ่ม <strong>"เริ่มตรวจสอบอัตลักษณ์เสียง"</strong> เพื่อรับรหัส <strong>`voice_id`</strong> และใช้ฟีเจอร์ <strong>Side-by-Side Comparison</strong> ฟังเสียงต้นฉบับคู่กับเสียงสังเคราะห์ของ Gemini ได้ทันที
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                    <h3 className="font-bold text-white text-sm">พิมพ์สคริปต์ &amp; ใส่ Stage Tags</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ไปที่แท็บ <strong>"2. สตูดิโอสังเคราะห์เสียง"</strong> พิมพ์สคริปต์ที่ต้องการ แล้วคลิกปุ่มคำสั่งอารมณ์ เช่น <code className="text-amber-300">[excited]</code>, <code className="text-emerald-300">[laughs]</code> หรือ <code className="text-cyan-300">|mhm|</code>
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">5</span>
                    <h3 className="font-bold text-white text-sm">สังเคราะห์และดาวน์โหลด WAV</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    กดปุ่ม <strong>"สังเคราะห์เสียงพูด"</strong> เพื่อฟังเสียงที่สร้างขึ้น ปรับความเร็ว 1x/1.25x/1.5x หรือกดปุ่มดาวน์โหลดไฟล์ <code className="text-slate-300">.wav</code> (24kHz Mono 16-bit)
                  </p>
                </div>

                {/* Step 6 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">6</span>
                    <h3 className="font-bold text-white text-sm">นำโค้ดไปใช้ในระบบของคุณ (API)</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ไปที่แท็บ <strong>"4. โค้ดตัวอย่าง &amp; API"</strong> เพื่อคัดลอกโค้ด <strong>Python</strong> (Google GenAI SDK) หรือ <strong>Node.js</strong> ที่มีรหัสเสียงผูกไว้พร้อมใช้งาน
                  </p>
                </div>
              </div>

              {/* Call to action button to jump directly */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">พร้อมเริ่มต้นหรือยัง?</h4>
                  <p className="text-xs text-slate-400">ปิดหน้าต่างนี้แล้วเริ่มบันทึกเสียงคู่ในแท็บแรกได้ทันที</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onSelectTab) onSelectTab('clone');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  เริ่มโคลนเสียงทันที
                </button>
              </div>
            </div>
          )}

          {/* SECTION 2: Mermaid Diagrams */}
          {activeSection === 'diagrams' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Diagram 1 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <GitFork className="w-4 h-4 text-cyan-400" />
                    <span>1. ผังโครงสร้างการทำงานรวม (System Architecture)</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(architectureDiagram, 'arch')}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedCode === 'arch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'arch' ? 'คัดลอกแล้ว' : 'คัดลอก Mermaid'}</span>
                  </button>
                </div>
                <MermaidViewer chart={architectureDiagram} id="architecture" />
              </div>

              {/* Diagram 2 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span>2. ลำดับขั้นตอนการสื่อสาร (Sequence Diagram)</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(sequenceDiagram, 'seq')}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedCode === 'seq' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'seq' ? 'คัดลอกแล้ว' : 'คัดลอก Mermaid'}</span>
                  </button>
                </div>
                <MermaidViewer chart={sequenceDiagram} id="sequence" />
              </div>

              {/* Diagram 3 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>3. สถานะการตรวจสอบความยินยอม (State Machine)</span>
                  </h3>
                  <button
                    onClick={() => copyToClipboard(stateDiagram, 'state')}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
                  >
                    {copiedCode === 'state' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'state' ? 'คัดลอกแล้ว' : 'คัดลอก Mermaid'}</span>
                  </button>
                </div>
                <MermaidViewer chart={stateDiagram} id="state-machine" />
              </div>
            </div>
          )}

          {/* SECTION 3: Stage Directions */}
          {activeSection === 'tags' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>การควบคุมอารมณ์และคำสั่งกำกับการแสดง (Expressive Stage Directions)</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  จุดเด่นที่ทำให้ Gemini 3.8 Flash TTS แตกต่างจาก TTS ทั่วไป คือความสามารถในการตีความคำสั่งกำกับอารมณ์ในสคริปต์
                  คุณสามารถพิมพ์แท็กเหล่านี้ลงในเนื้อหาได้โดยตรงเพื่อให้น้ำเสียงเปลี่ยนตามความต้องการ:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-amber-400">[excited]</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">อารมณ์ตื่นเต้น</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    พูดด้วยน้ำเสียงสดใส กระตือรือร้น มีชีวิตชีวา และจังหวะที่เร็วขึ้นเล็กน้อย
                  </p>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-400">
                    &quot;[excited] ยินดีด้วยครับ! คุณได้รับคัดเลือก&quot;
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-emerald-400">[laughs] หรือ &lt;laugh&gt;</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">เสียงหัวเราะแทรก</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    แทรกเสียงหัวเราะอย่างเป็นธรรมชาติในประโยคโดยไม่ทำให้คำพูดขาดตอน
                  </p>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-400">
                    &quot;[laughs] เรื่องนี้ตลกมากเลยครับ&quot;
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-cyan-400">|mhm| หรือ |yeah|</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">เสียงขานรับในลำคอ</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    เสียงตอบรับสั้น ๆ เพิ่มความเป็นธรรมชาติในบทสนทนาพอดแคสต์
                  </p>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-400">
                    &quot;ถูกต้องเลยครับ |mhm| ผมเห็นด้วย&quot;
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-purple-400">&lt;breath&gt; หรือ [sighs]</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">เสียงหายใจ / ถอนหายใจ</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    เสียงสูดลมหายใจเพื่อเตรียมพูดต่อ หรือเสียงถอนหายใจแสดงความโล่งอก
                  </p>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-400">
                    &quot;&lt;breath&gt; เรามาเริ่มขั้นตอนถัดไปกันเลย&quot;
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-indigo-400">[whispering]</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">เสียงกระซิบ</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    ลดความดังลงเป็นเสียงกระซิบ สร้างบรรยากาศลึกลับสำหรับงานเล่านิทาน
                  </p>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-400">
                    &quot;[whispering] เบา ๆ หน่อยนะครับ เขากำลังหลับ&quot;
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-slate-400">[short-pause]</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">เว้นจังหวะหยุด</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    เว้นจังหวะหยุดสั้น ๆ เพื่อเน้นย้ำประเด็นสำคัญในประโยค
                  </p>
                  <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-400">
                    &quot;และคำตอบก็คือ... [short-pause] ความพยายามครับ&quot;
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Technical Glossary */}
          {activeSection === 'glossary' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Search box */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  placeholder="ค้นหาคำศัพท์ทางเทคนิค เช่น SynthID, F0 Pitch, WAV, C2PA..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Glossary list */}
              <div className="space-y-3">
                {filteredGlossary.map((item) => (
                  <div key={item.term} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{item.term}</span>
                        <span className="text-xs font-mono text-slate-400">({item.en})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: FAQ & Troubleshooting */}
          {activeSection === 'faq' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>คำถาม: ทำไมระบบจึงแจ้งว่า &ldquo;การตรวจสอบไม่ผ่านเกณฑ์ (Verification Failed)&rdquo;?</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>คำตอบ:</strong> เกิดจาก 2 สาเหตุหลัก:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-2">
                    <li>
                      ข้อความที่อ่านในส่วน Consent Audio ไม่ตรงกับประโยคที่กำหนด (เช่น อ่านตกหล่น หรืออ่านข้อความอื่น)
                    </li>
                    <li>
                      เสียงมีเสียงรบกวนมากเกินไปจน Gemini ไม่สามารถถอดรหัสข้อความได้
                    </li>
                  </ul>
                  <p className="text-xs text-emerald-400 mt-1">
                    <strong>วิธีแก้:</strong> อัดเสียงในส่วน Consent Audio ใหม่อีกครั้ง โดยอ่านตามประโยคที่เน้นไว้ในกรอบสีเขียวอย่างชัดเจน
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-cyan-400" />
                    <span>คำถาม: ทำอย่างไรให้เสียงที่โคลนออกมามีความเหมือนและเป็นธรรมชาติที่สุด?</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>คำตอบ:</strong> แนะนำให้ปฏิบัติตามมาตรฐานห้องอัดเสียงเบื้องต้น:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 ml-2">
                    <li>อัดเสียงในห้องที่เงียบสนิท ไม่มีเสียงพัดลม แอร์เป่าไมค์ หรือเสียงสะท้อนจากผนังห้องโล่ง</li>
                    <li>พูดด้วยระดับเสียงและจังหวะที่เป็นธรรมชาติ ไม่เกร็งหรือตะโกน</li>
                    <li>ใช้ไมโครโฟนคุณภาพดีห่างจากริมฝีปากประมาณ 10-15 เซนติเมตร</li>
                    <li>ไฟล์เสียงทั้ง 2 ส่วน (Reference และ Consent) ต้องใช้ไมโครโฟนและสภาพแวดล้อมเดียวกัน</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-purple-400" />
                    <span>คำถาม: ลายน้ำ SynthID ทำงานอย่างไร และจะทำให้เสียงดรอปลงหรือไม่?</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>คำตอบ:</strong> SynthID เป็นอัลกอริทึมขั้นสูงของ Google DeepMind ที่ฝังแพทเทิร์นลงในสเปกตรัมความถี่ย่อย (Sub-harmonic)
                    ซึ่งมนุษย์ไม่สามารถได้ยินความแตกต่าง และไม่ทำให้คุณภาพเสียงสูญเสียไป แต่ซอฟต์แวร์ตรวจสอบสามารถยืนยันความเป็นของแท้ได้
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    <span>คำถาม: สามารถนำ Voice ID ไปเรียกใช้ในระบบภายนอก (เช่น Call Center หรือ Python App) ได้อย่างไร?</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>คำตอบ:</strong> คุณสามารถไปที่แท็บ <strong>&ldquo;4. โค้ดตัวอย่าง &amp; API&rdquo;</strong> แล้วคัดลอกโค้ดภาษา Python ที่ใช้ Google GenAI SDK ไปวางในแอปพลิเคชันของคุณได้ทันที โดยใส่กุญแจ `GEMINI_API_KEY` ของคุณ
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Gemini 3.8 Flash TTS Voice Architecture &bull; Official Documentation</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors"
          >
            ปิดหน้าต่าง (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
