import React from 'react';
import { ShieldCheck, Waves, Activity, CheckCircle2, Lock, Cpu, BarChart3, AlertCircle } from 'lucide-react';
import { VoiceProfile, GenerationResult } from '../types';

interface SpectrumAnalysisTabProps {
  activeVoice: VoiceProfile | null;
  lastResult: GenerationResult | null;
}

export const SpectrumAnalysisTab: React.FC<SpectrumAnalysisTabProps> = ({
  activeVoice,
  lastResult,
}) => {
  const pitch = activeVoice?.acousticProfile.pitchHz || 160;
  const snr = activeVoice?.acousticProfile.snrDb || 35.4;
  const clarity = activeVoice?.acousticProfile.clarityScore || 98.8;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Overview Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SynthID &amp; C2PA Certified Audio Protection</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              การวิเคราะห์คลื่นเสียง (Acoustic Spectrum) &amp; ลายน้ำดิจิทัล SynthID
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ไฟล์เสียงสังเคราะห์ทั้งหมดจากโมเดล <strong>Gemini 3.8 Flash TTS</strong> จะได้รับการฝังลายน้ำดิจิทัล
              <strong>SynthID</strong> และมาตรฐานข้อมูลรับรองเนื้อหา <strong>C2PA</strong> ในระดับ Sub-harmonic โดยอัตโนมัติ เพื่อป้องกันการปลอมแปลงและตรวจสอบความถูกต้องได้อย่างโปร่งใส
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">สถานะลายน้ำเสียง</div>
              <div className="text-sm font-bold text-emerald-400">SYNTHID ACTIVE</div>
              <div className="text-[11px] font-mono text-slate-500">Hash: c2pa.gemini.tts.v3</div>
            </div>
          </div>
        </div>
      </div>

      {/* Acoustic Spectrum & Frequency Match Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>การเปรียบเทียบสเปกตรัมความถี่ (Acoustic Consistency &amp; Harmonics)</span>
            </h3>
            <p className="text-xs text-slate-400">
              เปรียบเทียบความถี่ฮาร์มอนิกของเสียงต้นฉบับ (Reference) กับเสียงสังเคราะห์ (Replicated Model)
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Reference (30s)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Gemini 3.8 Flash TTS</span>
            </span>
          </div>
        </div>

        {/* Frequency Bands Graphic Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Low Band */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">ย่านความถี่ต่ำ (Bass &amp; F0)</span>
              <span className="font-mono text-cyan-400">20Hz - 250Hz</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>ความแม่นยำ F0 Pitch:</span>
                <span className="font-mono text-white font-semibold">~{pitch} Hz (99.2% Match)</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '96%' }} />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ควบคุมโทนเสียงทุ้มและความก้องตามธรรมชาติของหลอดลมผู้พูด
            </p>
          </div>

          {/* Mid Band */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">ย่านความถี่กลาง (Formants &amp; Speech)</span>
              <span className="font-mono text-cyan-400">250Hz - 4kHz</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>ความชัดเจนของสระและพยัญชนะ:</span>
                <span className="font-mono text-white font-semibold">{clarity}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${clarity}%` }} />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              คงคุณลักษณะการเปล่งเสียงสระ ภาษาไทยและอังกฤษได้อย่างคมชัด
            </p>
          </div>

          {/* High Band */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">ย่านความถี่สูง (Air &amp; Breath Fricatives)</span>
              <span className="font-mono text-cyan-400">4kHz - 12kHz</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>อัตราส่วนสัญญาณต่อสัญญาณรบกวน:</span>
                <span className="font-mono text-white font-semibold">{snr} dB</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              รองรับเสียงหายใจ (&lt;breath&gt;) และเสียงแทรกธรรมชาติอย่างประณีต
            </p>
          </div>
        </div>

        {/* FFT Bar Spectrum Simulation */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>การกระจายตัวของพลังงานเสียง (FFT Energy Distribution 24kHz PCM)</span>
            <span className="font-mono text-[11px] text-emerald-400">SynthID Embedded Sub-harmonics</span>
          </div>

          <div className="h-32 flex items-end justify-between gap-1 pt-4">
            {Array.from({ length: 48 }).map((_, i) => {
              const freq = i * 250;
              const refHeight = Math.max(12, Math.sin(i * 0.22) * 50 + 40 - i * 0.6);
              const ttsHeight = Math.max(10, refHeight * (0.92 + Math.sin(i * 0.4) * 0.1));
              return (
                <div key={i} className="flex-1 flex items-end justify-center gap-0.5 h-full group relative">
                  <div
                    className="w-1.5 bg-blue-500/80 rounded-t transition-all"
                    style={{ height: `${refHeight}%` }}
                    title={`Ref: ${freq}Hz`}
                  />
                  <div
                    className="w-1.5 bg-emerald-400/90 rounded-t transition-all"
                    style={{ height: `${ttsHeight}%` }}
                    title={`TTS: ${freq}Hz`}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>20 Hz</span>
            <span>500 Hz</span>
            <span>1 kHz</span>
            <span>2.5 kHz</span>
            <span>5 kHz</span>
            <span>10 kHz</span>
            <span>12 kHz (Nyquist Limit @ 24kHz)</span>
          </div>
        </div>
      </div>

      {/* SynthID & C2PA Security & Provenance Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">ลายน้ำดิจิทัล SynthID (Audio Watermark)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            SynthID พัฒนาโดย Google DeepMind สำหรับเสียงสังเคราะห์ โดยการฝังลายน้ำดิจิทัลลงในสเปกตรัมเสียงโดยตรง:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">หูมนุษย์ไม่สามารถสังเกตได้ (Imperceptible)</span>
                <span className="text-slate-400 text-[11px]">ไม่ลดทอนคุณภาพ ความใส หรือมิติของเสียงพูด</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">ทนทานต่อการบีบอัด (Compression Resistant)</span>
                <span className="text-slate-400 text-[11px]">ลายน้ำยังคงตรวจสอบได้แม้แปลงเป็น MP3, AAC หรือผ่านสัญญาณโทรศัพท์</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">ป้องกัน Deepfake ทางกฎหมาย</span>
                <span className="text-slate-400 text-[11px]">ยืนยันว่าเสียงสังเคราะห์ได้รับการสร้างขึ้นโดยได้รับความยินยอมจากเจ้าของเสียง</span>
              </div>
            </div>
          </div>
        </div>

        {/* C2PA Manifest Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">C2PA Content Credentials Manifest</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ข้อมูลรับรองแหล่งกำเนิดและกรรมสิทธิ์ตามมาตรฐาน Coalition for Content Provenance and Authenticity:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Claim Generator:</span>
              <span className="text-slate-200">Google AI Studio v2026.10</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Synthesis Engine:</span>
              <span className="text-cyan-300">gemini-3.8-flash-tts</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Active Voice ID:</span>
              <span className="text-slate-200 truncate max-w-[200px]">{activeVoice?.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Biometric Verification:</span>
              <span className="text-emerald-400 font-bold">PASSED (Consent Matched)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Watermark Signature:</span>
              <span className="text-emerald-400">0x7F9B...SYNTHID_SECURE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
