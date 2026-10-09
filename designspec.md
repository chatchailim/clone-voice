# เอกสารข้อกำหนดและการออกแบบระบบ (Requirements & System Design Specification)
## โครงการ: Gemini 3.8 Flash Voice Replication & Expressive TTS Studio
**รหัสโครงการ:** GAI-TTS-VREP-2026  
**สถานะเอกสาร:** Approved / Active Baseline  
**เวอร์ชัน:** 1.0.0  
**วันที่ปรับปรุงล่าสุด:** ตุลาคม 2026  

---

## 1. บทสรุปผู้บริหารและภาพรวมโครงการ (Executive Summary & Project Overview)

### 1.1 วัตถุประสงค์ของโครงการ (Project Objectives)
โครงการ **Gemini 3.8 Flash Voice Replication Studio** จัดทำขึ้นเพื่อเป็นสถาปัตยกรรมและกรอบการทำงาน (Framework) มาตรฐานในการโคลนเสียงสังเคราะห์ (Voice Replication) และการสร้างเสียงสังเคราะห์ที่สื่ออารมณ์เสมือนมนุษย์ (Expressive Text-to-Speech) โดยใช้โมเดลเรือธง **Google Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`)** และ **Gemini 3.8 Flash Lite TTS (`gemini-3.8-flash-lite-tts`)**

เอกสารฉบับนี้กำหนดมาตรฐานทางวิศวกรรม กระบวนการดำเนินงาน บทบาทผู้มีส่วนเกี่ยวข้อง และข้อกำหนด UX/UI เพื่อให้ทีมพัฒนา ทีมออกแบบ และทีมธุรกิจสามารถนำไปใช้เป็น **Framework ที่สามารถทำซ้ำได้ (Reusable & Reproducible Framework)** สำหรับผลิตภัณฑ์ที่ต้องการเสียงสังเคราะห์ความแม่นยำสูงในอนาคต เช่น ผู้ช่วยเสมือน (Virtual Agents), ระบบ IVR/Call Center ยุคใหม่, งานผลิตพอดแคสต์ (Dual-Speaker Screenplay), นิยายเสียง (Audiobooks) และงานผลิตสื่อโฆษณา

### 1.2 จุดเด่นของเทคโนโลยีหลัก (Key Technical Highlights)
1. **Short-Sample Voice Replication:** โคลนเสียงสังเคราะห์จากตัวอย่างเสียงสั้นเพียง 30 วินาที – 1 นาที
2. **Speaker Verification & Mandatory Consent:** ระบบตรวจสอบความยินยอมของผู้พูดทางชีวภาพและกฎหมาย ป้องกันปัญหา Deepfake โดยต้องผ่านการตรวจคู่เสียงคำแถลงความยินยอม (Consent Statement)
3. **SynthID Digital Watermarking & C2PA Provenance:** ฝังลายน้ำดิจิทัล SynthID ลงในสเปกตรัมเสียงและสร้างใบรับรอง C2PA โดยอัตโนมัติ เพื่อความโปร่งใสและตรวจสอบที่มาได้
4. **Expressive Stage Directions:** รองรับการกำกับอารมณ์ จังหวะ และเสียงแทรกธรรมชาติ เช่น `[excited]`, `[laughs]`, `[sighs]`, `|mhm|`, `<breath>` ในสคริปต์
5. **Dual-Speaker Dialogue Orchestration:** สังเคราะห์บทสนทนาโต้ตอบแบบ 2 ตัวละครพร้อมกันในรอบเดียว (One-turn Dual-speaker Scene)
6. **Studio-Grade Audio Output:** มาตรฐานไฟล์เสียง Uncompressed RIFF WAV 24kHz, Mono, 16-bit PCM

---

## 2. โครงสร้างการกำกับดูแลและผู้มีส่วนเกี่ยวข้อง (Stakeholders, Roles & RACI Matrix)

การดำเนินโครงการ Voice Replication มีความเกี่ยวข้องกับประเด็นด้านลิขสิทธิ์ ความปลอดภัยทางชีวภาพ (Biometric Ethics) และคุณภาพเสียง จึงต้องกำหนดบทบาทและหน้าที่อย่างรัดกุมตามมาตรฐานสากล

### 2.1 รายชื่อบทบาทและหน้าที่หลัก (Roles and Responsibilities)

| ลำดับ | บทบาท (Role) | ผู้รับผิดชอบตัวอย่าง | หน้าที่และความรับผิดชอบหลัก |
| :--- | :--- | :--- | :--- |
| **1** | **Product Owner (PO) / Project Sponsor** | Head of AI Products | กำหนดวิสัยทัศน์ผลิตภัณฑ์ ลำดับความสำคัญของฟีเจอร์ (Backlog Priority) และอนุมัติเกณฑ์การส่งมอบโครงการ (Acceptance Criteria) |
| **2** | **Lead AI / ML Engineer** | Senior GenAI Specialist | พัฒนาและเชื่อมต่อ Pipeline Google GenAI SDK (`@google/genai`), วาง Architecture สำหรับ Voice Modeling, ออกแบบ Prompt Metadata และปรับแต่ง Speech Config |
| **3** | **Full-Stack / Backend Engineer** | Senior Backend Engineer | พัฒนา Express REST Proxy APIs, จัดการระบบ Biometric Session, ระบบบันทึก Voice Registry, การตรวจสอบสิทธิ์การใช้งาน และ Fallback Audio Synthesis Engine |
| **4** | **Audio DSP & Acoustic Engineer** | Audio Systems Specialist | ควบคุมมาตรฐานไฟล์เสียง (24kHz Mono 16-bit PCM), ออกแบบ FFT Spectrum Visualizer, คำนวณค่า SNR, F0 Pitch Harmonics และความสอดคล้องทางเสียง (Acoustic Consistency) |
| **5** | **Legal, Ethics & Compliance Officer** | Data Protection & AI Ethics Officer | ตรวจสอบข้อความคำยินยอมทางกฎหมาย (Mandatory Consent Text), ดูแลนโยบาย PDPA/GDPR สำหรับข้อมูล Biometrics, และตรวจสอบมาตรฐานลายน้ำ SynthID และ C2PA |
| **6** | **Lead UX/UI Designer** | Senior Product Designer | ออกแบบ User Journeys, Design Tokens, Micro-interactions สำหรับการอัดเสียง/เปิดฟังเสียง, เครื่องเล่นเสียง (Player Bar) และสถานะการตรวจสอบไบโอเมตริก |
| **7** | **Quality Assurance & Audio Tester** | QA Lead / Sound QA | ทดสอบความถูกต้องในการถอดรหัสข้อความยินยอม, ตรวจสอบความหน่วง (Latency Benchmarking), ทดสอบความเข้ากันได้ของไมโครโฟนบนเบราว์เซอร์ต่าง ๆ และความถูกต้องของไฟล์ WAV |

### 2.2 RACI Matrix สำหรับกระบวนการพัฒนาและส่งมอบ

* **R (Responsible):** ผู้ปฏิบัติงานหลัก
* **A (Accountable):** ผู้มีอำนาจตัดสินใจและรับผิดชอบผลลัพธ์
* **C (Consulted):** ผู้ให้คำปรึกษาและข้อกำหนดเชิงลึก
* **I (Informed):** ผู้รับทราบความคืบหน้า

| ขั้นตอนการดำเนินงาน (Project Phase / Task) | PO | AI Eng | Backend | Audio Eng | Legal | UX/UI | QA |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 1. ออกแบบกระบวนการเก็บความยินยอม (Consent Policy & Flow) | C | I | I | I | **A/R** | C | I |
| 2. ออกแบบ UX/UI Wireframe และ Design Tokens | C | I | I | C | C | **A/R** | I |
| 3. พัฒนาระบบบันทึกเสียงไมค์และอัปโหลดไฟล์ (Browser Audio Capture) | I | I | C | C | I | C | **A/R** |
| 4. พัฒนาระบบ Biometric Speaker Verification & Gemini Transcription | I | **A/R** | R | C | C | I | C |
| 5. พัฒนาระบบ Expressive TTS Pipeline & Stage Direction Parsing | I | **A/R** | R | C | I | I | C |
| 6. พัฒนาระบบ SynthID Watermark Verification & FFT Spectrum Analysis | I | C | R | **A/R** | C | C | C |
| 7. ทดสอบความปลอดภัย อัตราหน่วง และคุณภาพเสียง (Audio Quality & Latency) | C | C | C | R | I | I | **A/R** |
| 8. ปล่อยใช้งานจริงและประเมินผล (Deployment & Compliance Audit) | **A** | R | R | I | C | I | I |

---

## 3. แผนผังกระบวนการทำงานแบบครบวงจร (End-to-End Architectural Workflows)

### 3.1 กระบวนการที่ 1: การลงทะเบียนและตรวจสอบสิทธิ์เสียง (Voice Enrollment & Consent Verification)

```
[ผู้ใช้งาน (Speaker)]
      │
      ├──> [1] บันทึกเสียงต้นฉบับ (Reference Audio: 30s-60s) ──> ตรวจสอบคุณภาพเสียงเบื้องต้น (Silence/SNR Check)
      │
      └──> [2] บันทึกเสียงยินยอม (Consent Audio) ──────────────> อ่านข้อความยินยอมบังคับ (Mandatory Legal Phrase)
                                                                            │
                                                                            ▼
                                                          [API Endpoint: POST /api/verify-voice]
                                                                            │
      ┌─────────────────────────────────────────────────────────────────────┴────────────────────────────────┐
      │                                                                                                      │
      ▼                                                                                                      ▼
[Acoustic Feature Extraction]                                                        [Gemini Model Transcription]
- สกัดความถี่หลัก (F0 Pitch Hz)                                                     - ถอดรหัสเสียงพูดภาษาไทย/อังกฤษ
- ตรวจสอบความสอดคล้องของคลื่นเสียง (Consistency)                                     - ตรวจจับคำยินยอมทางกฎหมาย (Legal Consent Match)
      │                                                                                                      │
      └──────────────────────────────────┬───────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
                      [ประเมินผลคะแนนความสอดคล้องทางชีวภาพ (Biometric Score)]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │ ผ่านเกณฑ์ (Score >= 85% & Consent Matched)     │ ไม่ผ่านเกณฑ์ (คำพูดไม่ตรง / สัญญาณเสียงไม่ชัดเจน)
                 ▼                                               ▼
     [สร้างและบันทึก Voice ID ประจำตัว]                   [ส่งข้อผิดพลาดกลับไปยัง UI พร้อมสาเหตุอย่างชัดเจน]
     - รูปแบบ: voices/rep_{lang}_{id}                            - ข้อความระบุสิ่งที่ตรวจพบ vs สิ่งที่ต้องการ
     - ออกใบรับรอง SynthID Compliance                           - แนะนำให้ผู้ใช้อัดเสียงยินยอมใหม่อีกครั้ง
     - บันทึกลงในระบบ Voice Registry
```

### 3.2 กระบวนการที่ 2: การสังเคราะห์เสียงพูดและการกำกับอารมณ์ (TTS Synthesis & Expressive Parsing)

```
[ผู้ใช้งานป้อนสคริปต์ใน Speech Studio]
      │
      ├──> สคริปต์เดี่ยวพร้อม Stage Directions (เช่น "[excited] ยินดีด้วยครับ! [laughs]")
      │    หรือ สคริปต์บทสนทนา 2 คน (Dual-Speaker Screenplay: Alex & Sam)
      │
      ▼
[API Endpoint: POST /api/generate-speech]
      │
      ├──> ตรวจสอบ Voice ID และโครงสร้างคำสั่งอารมณ์ (Stage Direction Tags)
      │
      ▼
[Google GenAI Client Pipeline (@google/genai)]
      │
      ├──> โมเดล gemini-3.8-flash-tts หรือ gemini-3.8-flash-lite-tts
      ├──> กำหนด speechConfig (Voice Config หรือ MultiSpeakerVoiceConfig)
      ├──> แปลง Stage Directions เข้าสู่ speechMetadata.style
      │
      ▼
[การประมวลผลสัญญาณและลายน้ำดิจิทัล (Google Audio Engine)]
      │
      ├──> สังเคราะห์เสียงพูดความละเอียดสูง
      ├──> ฝังลายน้ำดิจิทัล SynthID ลงในคลื่นเสียง
      ├──> ออกใบรับรอง C2PA Provenance Manifest
      │
      ▼
[ส่งกลับไฟล์เสียง Uncompressed RIFF WAV (24kHz Mono 16-bit PCM)]
      │
      ▼
[Interactive Audio Player & Waveform Visualizer ในหน้าเว็บแอป]
```

---

## 4. ข้อกำหนดเชิงฟังก์ชัน (Functional Requirements - FR)

### FR-01: การรับสัญญาณเสียงต้นฉบับ (Reference Audio Ingestion)
- **FR-01.1:** ระบบต้องรองรับการบันทึกเสียงไมโครโฟนสดผ่านเบราว์เซอร์ โดยใช้ `navigator.mediaDevices.getUserMedia` และ `MediaRecorder API`
- **FR-01.2:** ระบบต้องแสดงผลตัวนับเวลา (Recording Timer), มิเตอร์วัดระดับเสียงสด (Volume VU-meter) และ Waveform Visualizer แบบเรียลไทม์
- **FR-01.3:** ระบบต้องรองรับการอัปโหลดไฟล์เสียงที่มีอยู่เดิมในฟอร์แมต `.wav`, `.mp3`, `.m4a`, และ `.webm`
- **FR-01.4:** ระบบต้องให้คำแนะนำทางเทคนิคแก่ผู้ใช้: ความยาวที่เหมาะสม 30 วินาที – 1 นาที, อัดในห้องเงียบไม่มีเสียงสะท้อน (Reverberation) หรือดนตรีพื้นหลัง

### FR-02: การตรวจสอบความยินยอมและยืนยันตัวตนผู้พูด (Speaker Verification & Consent Check)
- **FR-02.1:** ผู้พูดต้องอ่านข้อความทางกฎหมายบังคับ (Mandatory Legal Statement):
  - **ภาษาไทย (`th-TH`):** *"ฉันเป็นเจ้าของเสียงนี้ และฉันยินยอมให้ Google ใช้เสียงนี้เพื่อสร้างแบบจำลองเสียงสังเคราะห์"*
  - **ภาษาอังกฤษ (`en-US`):** *"I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model."*
- **FR-02.2:** ระบบฝั่งเซิร์ฟเวอร์ต้องใช้โมเดล Gemini เพื่อถอดรหัสเสียงยินยอม และคำนวณค่าความสอดคล้องของข้อความ (Phrase Matching) หากตรวจไม่พบคำแสดงเจตนายินยอม ระบบต้องปฏิเสธการสร้างโมเดลโดยทันที
- **FR-02.3:** ระบบต้องตรวจสอบ Acoustic Consistency ระหว่างเสียงต้นฉบับและเสียงยินยอม เช่น ช่วงความถี่หลัก (F0 Pitch), อัตราสัญญาณต่อเสียงรบกวน (SNR) และระดับไดนามิกเรนจ์

### FR-03: การออกรหัสและการจัดการคลังเสียง (Voice ID & Registry Management)
- **FR-03.1:** เมื่อผ่านการตรวจสอบ ระบบต้องสร้างรหัสประจำตัวเสียงรูปแบบมาตรฐาน เช่น `voices/rep_th_{timestamp}_{hash}`
- **FR-03.2:** ระบบต้องแสดงคลังเสียง (Voice Registry) ที่พร้อมใช้งาน ทั้งเสียงที่ผู้ใช้โคลนขึ้นเอง (Custom Replicated Voices) และเสียงมาตรฐานของระบบ (Studio Preset Voices: Sarawut, Kanda, Alex, Sam)
- **FR-03.3:** ผู้ใช้สามารถลบโมเดลเสียงส่วนตัวที่ตนเองสร้างขึ้นได้

### FR-04: การสังเคราะห์เสียงพูดและการควบคุมอารมณ์ (Expressive Control & Stage Directions)
- **FR-04.1:** ระบบต้องรองรับการสังเคราะห์เสียงด้วยโมเดล `gemini-3.8-flash-tts` และ `gemini-3.8-flash-lite-tts`
- **FR-04.2:** ระบบต้องรองรับและประมวลผลคำสั่งกำกับการแสดง (Stage Directions & Audio Tags) ในข้อความสคริปต์:
  - **แท็กอารมณ์:** `[excited]`, `[normal]`, `[whispering]`, `[cheerful]`, `[sad]`, `[formal]`, `[polite]`
  - **เสียงแทรกธรรมชาติและเสียงขานรับ:** `[laughs]`, `[sighs]`, `|mhm|`, `|yeah|`, `<breath>`, `<gasp>`, `<laugh>`
  - **การควบคุมจังหวะหยุด:** `[short-pause]`, `[long-pause]`
- **FR-04.3:** หน้า UI ต้องมีปุ่มลัด (Quick Tags) ให้ผู้ใช้งานสามารถคลิกเพื่อแทรกคำสั่งลงในสคริปต์ตรงตำแหน่งเคอร์เซอร์ได้อย่างรวดเร็ว
- **FR-04.4:** มีคลังเทมเพลตสคริปต์พร้อมใช้งาน (Tech News, Customer Service IVR, Storytelling Audiobook, Podcast Intro)

### FR-05: โหมดบทสนทนา 2 ตัวละคร (Dual-Speaker Scene Mode)
- **FR-05.1:** ระบบต้องรองรับการสลับผู้พูดระหว่าง 2 คาแรคเตอร์ (เช่น Speaker A และ Speaker B) โดยสามารถผูกแต่ละตัวละครเข้ากับ Voice ID ที่แตกต่างกันได้
- **FR-05.2:** ส่งคำขอแบบ Multi-Speaker Voice Config ไปยัง `gemini-3.8-flash-tts` เพื่อสังเคราะห์บทสนทนาโต้ตอบที่มีการขานรับสลับไปมาอย่างเป็นธรรมชาติในรอบเดียว

### FR-06: เครื่องเล่นเสียงและการแสดงผลคลื่นเสียง (Interactive Audio Player)
- **FR-06.1:** แสดงผลคลื่นเสียง (Canvas Waveform) ขณะเล่นเสียง
- **FR-06.2:** มีแถบควบคุมเวลา (Scrubber Bar), ปุ่มย้อนหลัง/เล่นซ้ำ, การปรับความเร็วการเล่น (1.0x, 1.25x, 1.5x)
- **FR-06.3:** มีปุ่มดาวน์โหลดไฟล์เสียง `.wav` คุณภาพสูง (24kHz Mono 16-bit PCM RIFF)
- **FR-06.4:** แสดงผลตัวเลขค่า Latency ในหน่วยมิลลิวินาที (ms) ของการสังเคราะห์ในรอบนั้น ๆ

### FR-07: การตรวจสอบสเปกตรัมเสียงและลายน้ำ SynthID (Acoustic Spectrum & Watermark Analysis)
- **FR-07.1:** หน้าจอแสดงผลการวิเคราะห์สเปกตรัมความถี่เปรียบเทียบ (Reference vs Replicated Voice)
- **FR-07.2:** แสดงการกระจายตัวของพลังงานความถี่ FFT แบ่งตามย่าน Low (20-250Hz), Mid (250Hz-4kHz) และ High (4kHz-12kHz)
- **FR-07.3:** แสดงสถานะการรับรองลายน้ำดิจิทัล SynthID และข้อมูล C2PA Content Credentials Manifest

### FR-08: การสร้างโค้ดสำหรับนักพัฒนา (Developer Code Export)
- **FR-08.1:** ระบบต้องสร้างโค้ดภาษา **Python** โดยใช้ Google GenAI SDK (`google.genai`) ที่นำเข้า Voice ID ปัจจุบันและสคริปต์ที่ใช้งานอยู่โดยอัตโนมัติ
- **FR-08.2:** ระบบต้องสร้างโค้ดภาษา **Node.js / TypeScript** (`@google/genai`)
- **FR-08.3:** ระบบต้องสร้างคำสั่ง **cURL REST API** พร้อมปุ่มคัดลอกโค้ดคลิกเดียว (One-click Copy)

---

## 5. ข้อกำหนดเชิงคุณภาพและเทคนิค (Non-Functional Requirements - NFR)

### 5.1 มาตรฐานสัญญาณเสียง (Audio Signal & Acoustic Specs)
- **Sample Rate:** 24,000 Hz (24 kHz)
- **Bit Depth:** 16-bit Linear PCM
- **Channels:** 1 Channel (Mono)
- **Container Format:** RIFF WAVE (`audio/wav`) พร้อมส่วนหัว RIFF Header ขนาด 44 ไบต์ที่ถูกต้อง
- **Nyquist Frequency:** 12,000 Hz
- **Signal-to-Noise Ratio (SNR):** แนะนำ >= 30 dB สำหรับไฟล์เสียงต้นฉบับ

### 5.2 มาตรฐานความเร็วและความหน่วง (Latency Performance Targets)
- **TTS Generation Latency (Unary Response):** ต้องประมวลผลและส่งมอบไฟล์เสียงสำหรับข้อความความยาวไม่เกิน 100 คำ ภายในเวลาน้อยกว่า **1,200 ms** (เป้าหมาย Flash Model < 800 ms)
- **Speaker Verification Processing Time:** ต้องถอดรหัสและประเมินผลคำยินยอมภายในเวลาน้อยกว่า **3,000 ms**

### 5.3 ความปลอดภัยและการจัดการกุญแจลับ (Security & Secrets Management)
- **No Client-side API Keys:** ห้ามฝังหรือเปิดเผยกุญแจ `GEMINI_API_KEY` ไปยัง Client-side Browser Bundle โดยเด็ดขาด
- **Server-side Proxy Architecture:** การเรียกใช้ Google GenAI SDK ทั้งหมดต้องดำเนินการผ่านฝั่งเซิร์ฟเวอร์ (`server.ts`)
- **In-memory Transient Processing:** สัญญาณเสียงที่อัปโหลดเพื่อการตรวจสอบจะไม่ถูกนำไปเผยแพร่สาธารณะ และถูกจัดเก็บด้วยรหัสอ้างอิงเฉพาะ session

### 5.4 ความทนทานและการทำงานสำรอง (Fault Tolerance & Graceful Fallback)
- ระบบต้องมี **Resonant Harmonic Synthesizer Engine** ประจำเซิร์ฟเวอร์ เพื่อรองรับกรณีที่การเชื่อมต่อภายนอกหรือ API โควตาเกิดปัญหาชั่วคราว ทำให้ผู้ใช้งานสามารถทดสอบกระบวนการทั้งหมด, การเรนเดอร์ Waveform, การดาวน์โหลดไฟล์ และการออกใบรับรองได้โดยไม่สะดุด

---

## 6. ข้อกำหนดการออกแบบประสบการณ์ผู้ใช้และส่วนติดต่อผู้ใช้งาน (UX/UI Specification)

การออกแบบยึดหลัก **"Dark Studio Aesthetic with High Information Density"** เพื่อสะท้อนถึงเครื่องมือระดับมืออาชีพในสตูดิโอเสียงและแพลตฟอร์ม AI ขั้นสูง

### 6.1 ระบบชุดสีและตัวพิมพ์ (Design Tokens: Color Palette & Typography)

#### ชุดสีหลัก (Color Palette)
- **Background Layer 0 (App Canvas):** `#090d16` (Deep Obsidian Void)
- **Surface Layer 1 (Card/Panel Container):** `#0f172a` (Slate 900) อัตราความโปร่งใส `80-90%` ผสม Backdrop Blur `16px`
- **Surface Layer 2 (Input/Sub-card Container):** `#020617` (Slate 950)
- **Borders & Dividers:** `#1e293b` (Slate 800) ถึง `#334155` (Slate 700)
- **Primary Brand Accent (Electric Cyan/Blue):**
  - Primary Base: `#3b82f6` (Blue 500)
  - Hover/Focus: `#60a5fa` (Blue 400)
  - Deep Glow: `rgba(59, 130, 246, 0.4)`
- **Safety & Verification Status (Emerald Green):**
  - Base: `#10b981` (Emerald 500)
  - Light Accent: `#34d399` (Emerald 400)
  - Glow: `rgba(16, 185, 129, 0.4)`
- **Warning / Expressive Accent (Vibrant Amber / Coral):**
  - Base: `#f59e0b` (Amber 500)
  - Light Accent: `#fbbf24` (Amber 400)
- **Typography Colors:**
  - Headings & Primary Text: `#f8fafc` (Slate 50)
  - Body Text: `#cbd5e1` (Slate 300)
  - Subdued / Secondary Labels: `#94a3b8` (Slate 400)
  - Disabled / Footnotes: `#64748b` (Slate 500)

#### การกำหนดตัวอักษร (Typography Scale)
- **ภาษาไทย (Thai Body & Display):** `'Noto Sans Thai', sans-serif`
- **ภาษาอังกฤษและตัวเลข (Global UI):** `'Plus Jakarta Sans', system-ui, sans-serif`
- **โค้ดและข้อมูลเทคนิค (Code, Latency, Audio Metadata):** `'JetBrains Mono', monospace`

| สไตล์ข้อความ (Text Style) | ฟอนต์ (Font Family) | ขนาด (Size) | น้ำหนัก (Weight) | ระยะบรรทัด (Line Height) |
| :--- | :--- | :--- | :--- | :--- |
| **Display Header** | Plus Jakarta Sans / Noto Sans Thai | 24px - 28px | 800 (Bold) | 1.25 |
| **Section Title** | Plus Jakarta Sans / Noto Sans Thai | 18px - 20px | 700 (Semi-bold) | 1.3 |
| **Card Header** | Plus Jakarta Sans / Noto Sans Thai | 15px - 16px | 600 (Semi-bold) | 1.4 |
| **Body Regular** | Noto Sans Thai / Plus Jakarta Sans | 13px - 14px | 400 (Regular) | 1.6 |
| **Button Label** | Plus Jakarta Sans / Noto Sans Thai | 13px - 14px | 600 (Semi-bold) | 1.0 |
| **Metadata & Code** | JetBrains Mono | 11px - 12px | 500 (Medium) | 1.4 |

---

### 6.2 สถาปัตยกรรมข้อมูลและการนำทาง (Information Architecture & Navigation)

หน้าจอหลักถูกจัดแบ่งเป็น 4 แท็บฟังก์ชันหลักที่เรียงลำดับตามขั้นตอนการทำงานของผู้ใช้งาน (Logical User Journey):

```
[Sticky Navbar: Logo + Model Badges + Active Voice Pill]
───────────────────────────────────────────────────────────────────────────
[Tab 1: Voice Clone & Consent] ──> [Tab 2: Speech Studio] ──> [Tab 3: Spectrum & SynthID] ──> [Tab 4: API & Code Export]
- การอัดเสียงต้นฉบับ (30s)          - สคริปต์เดี่ยว / สนทนา 2 คน      - การวิเคราะห์ฮาร์มอนิก F0           - โค้ด Python (Google GenAI)
- การอัดเสียงคำยินยอมบังคับ           - เครื่องมือแทรก Stage Tags      - การกระจายย่านความถี่ FFT           - โค้ด Node.js / TypeScript
- การตรวจสอบ Biometric Verification  - เครื่องเล่นเสียงและ Waveform     - ใบรับรอง SynthID & C2PA           - คำสั่ง cURL REST API
- คลังเสียง Voice Registry          - ปรับความเร็วและดาวน์โหลด WAV                                        - คู่มือการใช้งาน Stage Tags
```

---

### 6.3 รายละเอียดส่วนประกอบ UI (Component Specifications)

#### Component 1: กล่องบันทึกเสียงคู่ (Dual Audio Ingestion Panels)
- แบ่งเป็น 2 คอลัมน์ที่ชัดเจน:
  - **ซ้าย: เสียงต้นฉบับ (Reference Audio):** ป้ายแท็กสีน้ำเงิน "ส่วนที่ 1" พร้อมแถบระบุความยาวเป้าหมาย (30 วินาที – 1 นาที)
  - **ขวา: เสียงยินยอม (Mandatory Consent Audio):** ป้ายแท็กสีเขียวมรกต "ส่วนที่ 2 (ข้อบังคับ)" พร้อมกล่องข้อความอ้างอิงที่มีเส้นขอบเน้นสีเขียว แสดงประโยคที่ต้องอ่านอย่างชัดเจน
- **ปุ่มอัดเสียง:** เมื่อกดอัดเสียง ปุ่มจะเปลี่ยนเป็นสีแดงพร้อมไอคอนสี่เหลี่ยมหยุด มีเอฟเฟกต์กระพริบ (Pulsing) และตัวนับเวลา `00:00`
- **Canvas Visualizer:** มีมินิแคนวาสแสดงคลื่นเสียงสดขณะพูด (แท่งคลื่นสีน้ำเงินสำหรับ Reference และแท่งคลื่นสีเขียวสำหรับ Consent)
- **แถบแสดงสถานะพร้อมใช้งาน:** เมื่อบันทึกเสร็จ จะมีแถบสีเขียวพร้อมปุ่ม Play/Pause เพื่อให้ผู้ใช้กดฟังทบทวนก่อนส่งตรวจสอบ

#### Component 2: แถบคำสั่งอารมณ์ด่วน (Quick Stage Direction Tag Inserter)
- ตั้งอยู่เหนือช่องพิมพ์สคริปต์
- นำเสนอในลักษณะปุ่มชิป (Chip Buttons) ที่จัดกลุ่มตามสี:
  - **อารมณ์:** `[excited]` (สีส้ม), `[normal]` (สีขาว), `[whispering]` (สีม่วง)
  - **เสียงแทรก:** `[laughs]` (สีเขียว), `[sighs]` (สีฟ้า), `<breath>` (สีม่วงลาเวนเดอร์), `<gasp>` (สีชมพู)
  - **เสียงขานรับ:** `|mhm|`, `|yeah|` (สีไซแอน)
  - **จังหวะ:** `[short-pause]` (สีเทา)
- **การตอบสนอง:** เมื่อคลิก ระบบจะแทรกแท็กดังกล่าวพร้อมเว้นวรรค 1 เคาะลงในตำแหน่งเคอร์เซอร์ของ Textarea ทันที โดยไม่ทำให้สูญเสียสถานะ Focus

#### Component 3: เครื่องเล่นเสียงแบบตอบสนอง (Interactive Floating Audio Player)
- แสดงขึ้นมาทันทีเมื่อการสังเคราะห์เสียงเสร็จสมบูรณ์
- **ส่วนหัวผลลัพธ์:** แสดงสถานะจุดสีเขียวกระพริบ, ชื่อเสียงที่ใช้, ค่า Latency ในหน่วย ms (เช่น `235ms`), และขนาดไฟล์/ฟอร์แมต `24kHz Mono 16-bit PCM RIFF`
- **แคนวาสแสดงคลื่นเสียงหลัก:** ความกว้างเต็มกรอบ แสดงคลื่นเสียงที่ขยับตามการเล่นจริงด้วยเฉดสีฟ้านีออนไล่ระดับ
- **แถบเลื่อนเวลา (Scrubber Bar):** สีฟ้าไซแอน ปรับเปลี่ยนเวลาได้ละเอียดระดับ `0.05s`
- **ปุ่มควบคุมความเร็ว:** กลุ่มปุ่มสลับความเร็ว `1.0x`, `1.25x`, `1.5x` แบบคลิกเดียว
- **ปุ่มดาวน์โหลด:** ปุ่มสีเข้มพร้อมไอคอน Download สั่งเซฟไฟล์ลงเครื่องในชื่อ `gemini_tts_{timestamp}.wav`

#### Component 4: เครื่องเล่นเสียงเปรียบเทียบเคียงข้าง (Side-by-Side Dual-Deck A/B Timbre Verification Player)
- **Deck A (Reference Audio):** แสดงคลื่นเสียงเสียงต้นฉบับของผู้พูดที่บันทึกไว้ พร้อมแถบ Scrubber เลื่อนเวลาอิสระ, ปุ่ม Play/Pause, และตัวเลื่อนระดับเสียง (Volume Slider + Mute Toggle)
- **Deck B (Gemini Replicated Model):** แสดงคลื่นเสียงสังเคราะห์จากโมเดล Gemini 3.8 Flash TTS พร้อมแถบ Scrubber, สถานะ SynthID Active, และปุ่มสร้างตัวอย่างใหม่ (Regenerate)
- **ปุ่มควบคุมการเปรียบเทียบ A/B:**
  - `เล่นเทียบต่อเนื่อง (Sequential Play A → B):` เล่นเสียง Track A จนจบ แล้วสลับเล่นต่อด้วย Track B ทันทีโดยมีจังหวะหยุด 300ms ให้ผู้ฟังประเมินความต่อเนื่องของเนื้อเสียง
  - `สลับ A ⮂ B ทันที (Instant A/B Flip):` สลับระหว่าง Track A และ Track B ขณะกำลังเล่น เพื่อให้หูมนุษย์เปรียบเทียบ Harmonic Timbre ได้ทันที
  - `ชุดประโยคทดสอบมาตรฐาน (4 Quick Presets):` ปรับเปลี่ยนข้อความทดสอบได้ 4 สไตล์ (Intro ทั่วไป, ข่าวสารทางการ, อารมณ์และการหายใจ, กระซิบ) พร้อมสร้างตัวอย่างด้วยคลิกเดียว
- **แถบประเมินความเหมือนเชิงปริมาณ (Similarity Scorecard):** แสดง Timbre Match Score (98.8%), Fundamental Pitch Alignment (±2.4 Hz), SNR (> 35.2 dB), และลายน้ำ SynthID

---

## 7. ข้อกำหนดทางสถาปัตยกรรมและการเชื่อมต่อ (System Architecture & API Specifications)

### 7.1 ผังโครงสร้างเซิร์ฟเวอร์ (Server Architecture)
ระบบถูกออกแบบเป็น Single-tier Full-stack Application โดยใช้ **Node.js + Express** ทำหน้าที่เป็น Application Server และ Proxy Gateway ครอบ **Vite Dev Server** ในโหมด Development และส่งมอบ Production Static Assets ในโหมด Production

```
[Web Browser Client (React 19 SPA)]
                │
                │ HTTP Requests (JSON / Audio Base64)
                ▼
[Express Gateway Server (server.ts - Port 3000)]
  ├── /api/health          -> สถานะโมเดลและกุญแจลับ
  ├── /api/voices          -> รายการคลังเสียง
  ├── /api/demo-audio      -> ชุดเสียงตัวอย่างอ้างอิงและยินยอม 24kHz สำเร็จรูป
  ├── /api/verify-voice    -> วิเคราะห์ไบโอเมตริกและถอดรหัสความยินยอม
  └── /api/generate-speech -> เชื่อมต่อไปยัง Google GenAI SDK
                │
                │ Google GenAI TypeScript SDK (@google/genai v2.4.0)
                ▼
[Google Gemini Foundation Models]
  ├── gemini-3.8-flash (Speech Verification & Analysis)
  └── gemini-3.8-flash-tts / gemini-3.8-flash-lite-tts (Speech Synthesis)
```

### 7.2 รายละเอียดข้อกำหนด API (API Endpoint Contracts)

#### 1. `GET /api/health`
ตรวจสอบสถานะความพร้อมของเซิร์ฟเวอร์และการเชื่อมต่อโมเดล
- **Response (200 OK):**
```json
{
  "status": "ok",
  "hasApiKey": true,
  "modelName": "gemini-3.8-flash-tts",
  "supportedModels": [
    "gemini-3.8-flash-tts",
    "gemini-3.8-flash-lite-tts"
  ],
  "synthIdSupported": true,
  "speakerVerificationReady": true,
  "totalVoices": 4
}
```

---

#### 2. `POST /api/verify-voice`
ตรวจสอบความถูกต้องของเสียงคำยินยอมและลงทะเบียน Voice ID ใหม่
- **Request Body:**
```json
{
  "voiceName": "เสียงของฉัน (My Custom Voice)",
  "language": "th-TH",
  "gender": "female",
  "referenceAudio": {
    "data": "UklGRi...",
    "mimeType": "audio/webm",
    "duration": 35
  },
  "consentAudio": {
    "data": "UklGRi...",
    "mimeType": "audio/webm"
  }
}
```

- **Response (200 OK - กรณีผ่านเกณฑ์):**
```json
{
  "success": true,
  "verified": true,
  "voice": {
    "id": "voices/rep_th_20261009_a4f1",
    "name": "เสียงของฉัน (My Custom Voice)",
    "language": "th-TH",
    "gender": "female",
    "description": "โคลนจากตัวอย่างเสียงต้นฉบับ ผ่านการตรวจสอบ Biometric Speaker Verification และ SynthID สำเร็จ",
    "isCustom": true,
    "speakerVerificationScore": 99.2,
    "synthIdVerified": true,
    "createdAt": "2026-10-09T08:00:00.000Z",
    "geminiBaseVoice": "Kore",
    "acousticProfile": {
      "sampleRate": 24000,
      "pitchHz": 210,
      "clarityScore": 98.7,
      "snrDb": 35.2
    }
  },
  "transcript": "ฉันเป็นเจ้าของเสียงนี้ และฉันยินยอมให้ Google ใช้เสียงนี้เพื่อสร้างแบบจำลองเสียงสังเคราะห์",
  "expectedStatement": "ฉันเป็นเจ้าของเสียงนี้ และฉันยินยอมให้ Google ใช้เสียงนี้เพื่อสร้างแบบจำลองเสียงสังเคราะห์",
  "confidenceScore": 99.2,
  "synthIdWatermark": "SYNTHID_AUDIO_WATERMARK_VERIFIED_V3",
  "c2paCompliant": true,
  "message": "ยืนยันอัตลักษณ์และสิทธิ์ผู้พูดสำเร็จ Voice ID ได้รับการอนุมัติแล้ว"
}
```

- **Response (400 Bad Request - กรณีคำยินยอมไม่ถูกต้อง):**
```json
{
  "success": false,
  "verified": false,
  "transcript": "สวัสดีครับ วันนี้อากาศดีมาก",
  "expectedStatement": "ฉันเป็นเจ้าของเสียงนี้ และฉันยินยอมให้ Google ใช้เสียงนี้เพื่อสร้างแบบจำลองเสียงสังเคราะห์",
  "reason": "ข้อความยินยอมไม่ตรงกับที่ระบุ กรุณาอ่านตามประโยคที่กำหนดเพื่อยืนยันอัตลักษณ์เสียง"
}
```

---

#### 3. `POST /api/generate-speech`
สังเคราะห์เสียงพูดด้วย Gemini 3.8 Flash TTS
- **Request Body (โหมดผู้พูดเดี่ยว):**
```json
{
  "model": "gemini-3.8-flash-tts",
  "voiceId": "voices/rep_th_20261009_a4f1",
  "text": "[excited] สวัสดีครับ! [laughs] การสังเคราะห์เสียงทำงานได้อย่างแม่นยำ",
  "stageDirections": true,
  "speed": 1.0,
  "pitch": 1.0,
  "isDialogueMode": false
}
```

- **Request Body (โหมดบทสนทนา 2 คน):**
```json
{
  "model": "gemini-3.8-flash-tts",
  "isDialogueMode": true,
  "dialogueLines": [
    {
      "id": "1",
      "speaker": "Alex",
      "voiceId": "voices/rep_en_alex_host",
      "text": "[excited] Welcome back! Today we are testing voice replication.",
      "style": "Enthusiastic podcast host"
    },
    {
      "id": "2",
      "speaker": "Sam",
      "voiceId": "voices/rep_en_sam_articulate",
      "text": "[normal] That's right |yeah| it sounds incredibly natural.",
      "style": "Articulate specialist"
    }
  ]
}
```

- **Response (200 OK):**
```json
{
  "success": true,
  "audioBase64": "UklGRlruAwBXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YYDWAw...",
  "mimeType": "audio/wav",
  "voiceId": "voices/rep_th_20261009_a4f1",
  "voiceName": "เสียงของฉัน (My Custom Voice)",
  "latencyMs": 285,
  "synthIdWatermarked": true,
  "c2paCompliant": true,
  "sampleRate": 24000,
  "channels": 1,
  "bitDepth": 16,
  "provider": "gemini-3.8-flash-tts",
  "stageDirectionsParsed": true
}
```

---

## 8. กรอบการทำงานเพื่อการเริ่มต้นโครงการและนำไปทำซ้ำ (Reproducible Project Framework)

เพื่อให้ทีมงานสามารถหยิบ Framework นี้ไปขึ้นโครงสร้างโครงการใหม่ได้อย่างรวดเร็ว ได้กำหนดโครงสร้างไดเรกทอรีและขั้นตอนการเริ่มงาน (Checklist) ดังนี้:

### 8.1 โครงสร้างไฟล์มาตรฐาน (Project Directory Blueprint)
```
/
├── .env.example                     # แม่แบบตัวแปรสภาพแวดล้อม (GEMINI_API_KEY, PORT)
├── index.html                       # HTML Entry point พร้อมฟอนต์ Google Fonts และ Meta Tags
├── metadata.json                    # Metadata ของแอปและสิทธิ์การเข้าถึงไมโครโฟน
├── package.json                     # รายการ Dependencies และคำสั่ง build/dev/start
├── server.ts                        # Express API Gateway และ Google GenAI SDK Proxy
├── tsconfig.json                    # การตั้งค่า TypeScript คอมไพเลอร์
├── vite.config.ts                   # การตั้งค่า Vite build plugin และ Path Aliases
└── src/
    ├── main.tsx                     # React DOM Root Entry point
    ├── index.css                    # Tailwind CSS v4 directives และ Global Styles
    ├── App.tsx                      # Root Component และ Main Viewport Layout
    ├── types.ts                     # TypeScript Data Contracts & Interfaces
    └── components/
        ├── Navbar.tsx               # ส่วนหัว Navigation Bar และสถานะของโมเดล
        ├── AudioVisualizer.tsx      # Canvas Waveform & Spectrum Visualizer
        ├── VoiceCloneTab.tsx        # หน้าจออัดเสียงต้นฉบับและเสียงคำยินยอม
        ├── SpeechStudioTab.tsx      # สตูดิโอใส่ Stage Directions และเล่นเสียง
        ├── SpectrumAnalysisTab.tsx  # หน้าวิเคราะห์ความถี่ FFT และลายน้ำ SynthID
        └── CodeExportTab.tsx        # เครื่องมือ Export โค้ด Python, Node.js, cURL
```

### 8.2 ขั้นตอนการเริ่มต้นโครงการ 5 ขั้นตอน (5-Step Initiation Checklist)

1. **Step 1: Environment & Dependency Provisioning**
   - ติดตั้ง Node.js (>= 20.x) หรือ Bun
   - ติดตั้งแพ็กเกจหลัก: `@google/genai`, `express`, `dotenv`, `lucide-react`, `tailwindcss`
   - กำหนดค่า `GEMINI_API_KEY` ใน Environment Secrets

2. **Step 2: Backend Proxy Server Setup (`server.ts`)**
   - ติดตั้ง Express Router สำหรับรับ Request เสียงขนาดใหญ่ (`express.json({ limit: '60mb' })`)
   - ผูก GoogleGenAI Client พร้อมระบุ Header `User-Agent: 'aistudio-build'`
   - สร้าง In-memory Voice Repository และ Fallback PCM Synthesizer

3. **Step 3: Audio DSP & Browser Recording Integration**
   - พัฒนา Web Audio Context และ MediaRecorder ให้บันทึกด้วยความละเอียดที่เหมาะสม
   - สร้างโมดูล Canvas Visualizer เพื่อแปลง Time-domain Data และ Frequency Data ออกมาเป็นภาพคลื่นเสียงสด

4. **Step 4: Expressive Parsing & Dual-Speaker Engine**
   - เชื่อมต่อตัวตรวจจับ Stage Directions (`[excited]`, `[laughs]`, `|mhm|`, `<breath>`)
   - นำค่าอารมณ์ไปแปลงเป็น `speechMetadata.style` และส่งเข้าสู่ Gemini API
   - ตรวจสอบให้แน่ใจว่าไฟล์ที่ได้มีส่วนหัว 44-byte RIFF WAVE ถูกต้อง

5. **Step 5: Compliance & Security Audit**
   - ทดสอบความถูกต้องของการตรวจจับข้อความยินยอมภาษาไทยและภาษาอังกฤษ
   - ตรวจสอบการฝังลายน้ำ SynthID ในระดับเสียง Sub-harmonic
   - ตรวจสอบว่าไม่มี API Key หรือข้อมูลความลับรั่วไหลไปยังฝั่งเบราว์เซอร์

---

## 9. ข้อกำหนดด้านกฎหมาย จริยธรรม และการคุ้มครองข้อมูลส่วนบุคคล (Legal, Ethics & Compliance Protocol)

1. **Explicit Biometric Consent (การให้ความยินยอมทางชีวภาพอย่างชัดแจ้ง):**
   - เสียงของผู้พูดถือเป็นข้อมูลชีวภาพ (Biometric Data) ภายใต้กฎหมายคุ้มครองข้อมูลส่วนบุคคล (PDPA/GDPR)
   - ระบบจะไม่อนุญาตให้โคลนเสียงจากไฟล์ที่มีแต่เสียงพูดทั่วไปโดยไม่มีไฟล์เสียงยินยอมยืนยันกำกับอย่างเด็ดขาด
2. **Anti-Impersonation & Deepfake Prevention:**
   - การอ่านข้อความยืนยันด้วยตนเองช่วยป้องกันการนำเสียงของบุคคลสาธารณะที่บันทึกจากสื่อมาแอบอ้างทำแบบจำลองเสียง
3. **SynthID Digital Provenance:**
   - ไฟล์เสียงสังเคราะห์ทุกไฟล์จะต้องฝังลายน้ำดิจิทัล SynthID ซึ่งไม่สามารถลบออกได้แม้จะทำการแปลงฟอร์แมตหรือบีบอัด เพื่อให้ผู้รับฟังหรือระบบตรวจสอบภายนอกสามารถยืนยันได้ว่าเสียงนี้ถูกสร้างขึ้นด้วย AI ของ Google อย่างถูกกฎหมาย

---

## 10. แผนการทดสอบและการยอมรับระบบ (Testing Strategy & Acceptance Criteria)

| หมวดการทดสอบ (Test Category) | กรณีทดสอบ (Test Case) | ผลลัพธ์ที่คาดหวัง (Expected Result) | สถานะเกณฑ์ผ่าน (Pass Criteria) |
| :--- | :--- | :--- | :--- |
| **Verification Gate** | อ่านข้อความยินยอมตรงตามที่กำหนดครบถ้วน | ได้รับ `verified: true`, คะแนน Biometric Match >= 98% และได้ Voice ID | **Mandatory Pass** |
| **Rejection Gate** | อัดเสียงอื่นที่ไม่ใช่ข้อความยินยอม (เช่น เสียงคุยเล่น) | ระบบตอบกลับ `verified: false` พร้อมแจ้งเตือนข้อความที่ไม่ตรงกัน | **Mandatory Pass** |
| **Audio Format** | ตรวจสอบไฟล์ `.wav` ที่ดาวน์โหลดจากระบบ | ฟอร์แมตต้องเป็น RIFF WAVE, 24,000 Hz, 16-bit, Mono ความยาวตรงกับเวลาเล่น | **Mandatory Pass** |
| **Stage Directions** | ป้อนสคริปต์ที่มี `[excited]` และ `[laughs]` | โมเดลต้องสังเคราะห์น้ำเสียงตื่นเต้นและมีเสียงหัวเราะแทรกอย่างสมจริง | **Subjective Review Pass** |
| **Dual Speaker** | ป้อนบทสนทนา 2 ตัวละคร Alex และ Sam | เสียงต้องสลับกันอย่างลื่นไหลและใช้ Voice Profile แยกกันถูกต้อง | **Mandatory Pass** |
| **Latency Benchmark** | วัดเวลาตั้งแต่คลิก Synthesize จนเสียงเริ่มเล่น | ต้องใช้เวลาน้อยกว่า 1,500 ms ภายใต้การเชื่อมต่ออินเทอร์เน็ตปกติ | **Performance Pass** |

---

*เอกสารฉบับนี้พร้อมใช้งานเป็นพิมพ์เขียวมาตรฐาน (Standard Architectural Blueprint) สำหรับการเริ่มต้น พัฒนา และต่อยอดโครงการในรอบถัดไปได้อย่างสมบูรณ์*
