import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import { VoiceProfile } from '../types';

interface CodeExportTabProps {
  activeVoice: VoiceProfile | null;
}

export const CodeExportTab: React.FC<CodeExportTabProps> = ({ activeVoice }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'nodejs' | 'curl'>('python');
  const [copied, setCopied] = useState(false);

  const voiceId = activeVoice?.id || 'voices/rep_th_sarawut_default';
  const langCode = activeVoice?.language || 'th-TH';

  const pythonCode = `import base64
from google import genai

# กำหนด Client ด้วย Google GenAI SDK
client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

# เรียกใช้งานโมเดล gemini-3.8-flash-tts โดยระบุ voice_id ที่โคลนไว้
interaction = client.create(
    model="gemini-3.8-flash-tts",
    input=[{
        "type": "user_input",
        "content": [{
            "type": "text",
            "text": "[excited] สวัสดีครับ! [normal] นี่คือเสียงที่สังเคราะห์ขึ้นจากระบบ Gemini Voice Replication [laughs] พร้อมรองรับ Stage Directions และลายน้ำ SynthID"
        }]
    }],
    voice_config={
        "voice_id": "${voiceId}",  # ID ที่ได้จากการ Verify เสียง
        "language_code": "${langCode}"
    }
)

# บันทึกไฟล์เสียง Audio Output (WAV 24kHz Mono 16-bit PCM)
audio_bytes = base64.b64decode(interaction.output_audio.data)
with open("output.wav", "wb") as f:
    f.write(audio_bytes)

print("สังเคราะห์และบันทึกไฟล์ output.wav สำเร็จ!")`;

  const nodejsCode = `import { GoogleGenAI } from "@google/genai";
import fs from "fs";

// Initialize Gemini client on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function synthesizeVoice() {
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash-tts",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: "[excited] ยินดีด้วยครับ! [normal] เสียงสังเคราะห์นี้พร้อมใช้งานแล้ว [laughs]",
            speechMetadata: {
              style: "Expressive, follow all stage directions precisely",
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "${activeVoice?.geminiBaseVoice || 'Puck'}" },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const wavBuffer = Buffer.from(base64Audio, "base64");
    fs.writeFileSync("output.wav", wavBuffer);
    console.log("Audio generated and saved to output.wav (24kHz Mono 16-bit PCM RIFF)");
  }
}

synthesizeVoice();`;

  const curlCode = `curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent?key=$GEMINI_API_KEY \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "[excited] สวัสดีครับ! [normal] ทดสอบ Gemini 3.8 Flash TTS ผ่าน REST API"
          }
        ]
      }
    ],
    "generationConfig": {
      "responseModalities": ["AUDIO"],
      "speechConfig": {
        "voiceConfig": {
          "prebuiltVoiceConfig": {
            "voiceName": "${activeVoice?.geminiBaseVoice || 'Puck'}"
          }
        }
      }
    }
  }'`;

  const getActiveCode = () => {
    switch (selectedLanguage) {
      case 'python':
        return pythonCode;
      case 'nodejs':
        return nodejsCode;
      case 'curl':
        return curlCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Code Export Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>โค้ดตัวอย่างการเรียกใช้ผ่าน SDK &amp; API Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              นำรหัส <code className="text-cyan-300 font-mono font-semibold">{voiceId}</code> ไปเรียกใช้ในระบบ Backend หรือ Call Center ของคุณ
            </p>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedLanguage('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedLanguage === 'python' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Python (GenAI SDK)
            </button>
            <button
              onClick={() => setSelectedLanguage('nodejs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedLanguage === 'nodejs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Node.js / TypeScript
            </button>
            <button
              onClick={() => setSelectedLanguage('curl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedLanguage === 'curl' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              cURL (REST)
            </button>
          </div>
        </div>

        {/* Code Box */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono">{selectedLanguage === 'python' ? 'main.py' : selectedLanguage === 'nodejs' ? 'tts.ts' : 'request.sh'}</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed scrollbar-thin">
            <code>{getActiveCode()}</code>
          </pre>
        </div>
      </div>

      {/* Expressive Control Cheat Sheet */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>คู่มือคำสั่งกำกับการแสดง (Stage Directions &amp; Audio Tags)</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          จุดเด่นของ Gemini 3.8 Flash TTS คือการเข้าใจบริบททางอารมณ์และคำสั่งกำกับเสียง สามารถใส่แท็กต่อไปนี้ในสคริปต์เพื่อปรับแต่งน้ำเสียงได้อย่างสมจริง:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 font-mono">[excited]</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Emotion</span>
            </div>
            <p className="text-xs text-slate-300">
              เพิ่มความกระตือรือร้น น้ำเสียงสดใส และความเร็วเล็กน้อย เหมาะสำหรับข่าวดีหรือข้อความตื่นเต้น
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900/80 p-1.5 rounded">
              &quot;[excited] ยินดีด้วยครับ! คุณได้รับรางวัล&quot;
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 font-mono">[laughs] / &lt;laugh&gt;</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Vocal Burst</span>
            </div>
            <p className="text-xs text-slate-300">
              สร้างเสียงหัวเราะที่เป็นธรรมชาติสอดแทรกระหว่างคำพูด
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900/80 p-1.5 rounded">
              &quot;[laughs] เรื่องนี้น่าทึ่งจริง ๆ ครับ&quot;
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 font-mono">|mhm| / |yeah|</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Backchanneling</span>
            </div>
            <p className="text-xs text-slate-300">
              เสียงตอบรับและขานรับสั้น ๆ เพิ่มความมีชีวิตชีวาในบทสนทนาพอดแคสต์
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900/80 p-1.5 rounded">
              &quot;ถูกต้องเลยครับ |mhm| เห็นด้วยอย่างยิ่ง&quot;
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 font-mono">&lt;breath&gt; / [sighs]</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Acoustic Gesture</span>
            </div>
            <p className="text-xs text-slate-300">
              เสียงสูดลมหายใจเพื่อเตรียมพูดต่อ หรือเสียงถอนหายใจแสดงความโล่งอก
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900/80 p-1.5 rounded">
              &quot;&lt;breath&gt; วันนี้เรามาเจาะลึกโมเดลกัน&quot;
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 font-mono">[whispering]</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Style</span>
            </div>
            <p className="text-xs text-slate-300">
              ลดระดับเสียงเป็นการกระซิบ เพิ่มบรรยากาศลึกลับสำหรับงานเล่านิทานหรือ Audiobooks
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900/80 p-1.5 rounded">
              &quot;[whispering] อย่าเอ็ดไปนะครับ...&quot;
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 font-mono">[short-pause]</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Pacing</span>
            </div>
            <p className="text-xs text-slate-300">
              เว้นวรรคจังหวะการพูดเพื่อเน้นย้ำประเด็นสำคัญ
            </p>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900/80 p-1.5 rounded">
              &quot;คำตอบก็คือ... [short-pause] ความพยายามครับ&quot;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
