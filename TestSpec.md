# เอกสารข้อกำหนดและแผนการทดสอบระบบ (System Test Specification)
## โครงการ: Gemini 3.8 Flash Voice Replication & Expressive TTS Studio
**รหัสเอกสาร:** TEST-SPEC-VREP-2026  
**มาตรฐานอ้างอิง:** ISO/IEC/IEEE 29119 Software Testing Standard / IEEE 829  
**เวอร์ชัน:** 1.0.0  
**วันที่ปรับปรุงล่าสุด:** ตุลาคม 2026  
**เอกสารอ้างอิงหลัก:** `designspec.md` (System Architecture Spec) และ `readme.md` (User & Technical Guide)  

---

## 1. บทนำและวัตถุประสงค์ (Introduction & Objectives)

### 1.1 วัตถุประสงค์การทดสอบ (Test Purpose)
เอกสารฉบับนี้กำหนดกรอบการทดสอบ (Test Specification & Framework) เพื่อยืนยันความถูกต้อง ความพร้อมใช้งาน ความปลอดภัย และประสิทธิภาพของระบบ **Gemini 3.8 Flash Voice Replication Studio** ให้เป็นไปตามข้อกำหนดใน `designspec.md` และคู่มือการทำงานใน `readme.md` ทุกประการ

การทดสอบครอบคลุมตั้งแต่การบันทึกเสียงสดผ่านเบราว์เซอร์ การตรวจสอบความยินยอมทางชีวภาพ (Biometric Consent Verification) การสังเคราะห์เสียงพูดพร้อมคำสั่งอารมณ์ (Expressive Stage Directions) การจำลองบทสนทนา 2 ตัวละคร (Dual-Speaker Scene) การตรวจสอบสเปกตรัมคลื่นเสียงและลายน้ำดิจิทัล SynthID ตลอดจนการทำงานของระบบสำรอง (Fallback Engine) และการส่งออกโค้ด API

### 1.2 ขอบเขตการทดสอบ (Testing Scope)
- **In-Scope (อยู่ในขอบเขตการทดสอบ):**
  1. การนำเข้าสัญญาณเสียง (Dual Audio Ingestion: Reference Audio 30s-60s และ Mandatory Consent Statement)
  2. การตรวจจับคำยินยอมทางกฎหมายและการถอดรหัสเสียงด้วย Gemini Model (`POST /api/verify-voice`)
  3. การสร้างและจัดการคลังเสียง (Voice ID Lifecycle Management)
  4. การสังเคราะห์เสียงด้วย `gemini-3.8-flash-tts` และ `gemini-3.8-flash-lite-tts` (`POST /api/generate-speech`)
  5. การประมวลผลคำสั่งกำกับอารมณ์ (Stage Directions: `[excited]`, `[normal]`, `[whispering]`, `[laughs]`, `|mhm|`, `<breath>`)
  6. โหมดบทสนทนา 2 ตัวละคร (Dual-Speaker Screenplay Orchestration)
  7. เครื่องเล่นเสียง Interactive Waveform Canvas, Timeline Scrubber, Speed Multiplier และการดาวน์โหลดไฟล์ `.wav` (RIFF WAVE 24kHz Mono 16-bit PCM)
  8. การแสดงผลสเปกตรัม FFT 3 ย่านความถี่ และการตรวจสอบสถานะลายน้ำ SynthID / C2PA
  9. เครื่องมือส่งออกโค้ด API (Python GenAI SDK, Node.js SDK, cURL)
  10. ศูนย์การเรียนรู้และมุมมองคู่มือการใช้งาน (Interactive Help Modal พร้อมการเรนเดอร์ Mermaid Diagrams สด)
  11. คุณภาพและความเร็ว (Latency Benchmarking, Audio Signal Fidelity, SNR >= 30dB)
  12. ความปลอดภัย (API Key Protection, Server-side Proxy, Fallback Synthesizer)

- **Out-of-Scope (อยู่นอกขอบเขต):**
  - การแก้ไขโครงสร้างภายในของโมเดล Google Foundation Model ที่ฝั่ง Google Data Center
  - การรับสัญญาณเสียงจากระบบฮาร์ดแวร์ภายนอกที่ไม่มีมาตรฐาน Web Audio API

---

## 2. สภาพแวดล้อมและสิ่งที่ต้องเตรียมสำหรับการทดสอบ (Test Environment & Prerequisites)

### 2.1 สภาพแวดล้อมฮาร์ดแวร์และเครือข่าย (Hardware & Network Setup)
| รายการ | ข้อกำหนดขั้นต่ำ (Minimum) | ข้อกำหนดที่แนะนำ (Recommended) |
| :--- | :--- | :--- |
| **Client Processor** | Dual-Core 2.0 GHz ขึ้นไป | Quad-Core 2.5 GHz+ (Apple Silicon M-Series / Intel Core i5+) |
| **Memory (RAM)** | 4 GB | 8 GB ขึ้นไป |
| **Microphone Input** | Built-in Laptop Microphone | USB Condenser / Studio Headset Mic พร้อม Pop-filter |
| **Acoustic Environment** | ห้องปิดทั่วไป (Ambient Noise < 45 dB) | ห้องเก็บเสียงหรือห้องทำงานเงียบ (Noise < 35 dB, Low Reverb) |
| **Network Bandwidth** | 10 Mbps Download / 5 Mbps Upload | 50+ Mbps Broadband (Latency ไปยัง Cloud < 80 ms) |

### 2.2 สภาพแวดล้อมซอฟต์แวร์และเบราว์เซอร์ (Software & Browser Matrix)
- **Operating Systems:** macOS Sonoma/Sequoia, Windows 11, Ubuntu 22.04 LTS, iOS 17+, Android 14+
- **Browsers:**
  - Google Chrome (Version 120+) - Primary Tier 1
  - Microsoft Edge (Version 120+) - Tier 1
  - Apple Safari (Version 17+) - Tier 1 (ทดสอบ Webkit AudioContext)
  - Mozilla Firefox (Version 122+) - Tier 2
- **Backend Runtime:** Node.js (v20+ / v22+) หรือ Bun, Express Gateway บนพอร์ต 3000
- **Configuration Secrets:** กำหนดค่า `GEMINI_API_KEY` ที่ถูกต้องในตัวแปรสภาพแวดล้อมเซิร์ฟเวอร์

---

## 3. การจัดเตรียมชุดข้อมูลทดสอบ (Test Data Preparation & Fixtures)

### 3.1 ชุดข้อมูลเสียงสำหรับทดสอบ (Audio Test Fixtures)

```
/test-fixtures/
├── audio/
│   ├── ref_clean_thai_female_35s.wav     # เสียงผู้หญิงไทยชัดเจน 35 วินาที (24kHz Mono 16-bit, SNR 36dB)
│   ├── ref_clean_thai_male_40s.wav       # เสียงผู้ชายไทยชัดเจน 40 วินาที (24kHz Mono 16-bit, SNR 34dB)
│   ├── ref_clean_english_male_30s.wav    # เสียงภาษาอังกฤษชัดเจน 30 วินาที (24kHz Mono 16-bit, SNR 35dB)
│   ├── ref_noisy_reverb_room_30s.wav     # เสียงที่มีเสียงสะท้อนก้องและแอร์ดัง (SNR 18dB) สำหรับ Negative Test
│   ├── ref_short_5s.wav                  # เสียงสั้นเกินไปเพียง 5 วินาที สำหรับ Boundary Test
│   ├── ref_silent_30s.wav                # ไฟล์เสียงเงียบสนิท (Zero Amplitude)
│   ├── consent_thai_exact_valid.wav      # เสียงอ่านคำยินยอมภาษาไทยถูกต้องครบถ้วน 100%
│   ├── consent_english_exact_valid.wav   # เสียงอ่านคำยินยอมภาษาอังกฤษถูกต้องครบถ้วน 100%
│   ├── consent_thai_imposter.wav         # เสียงคนละคนกับเสียง Reference เพื่อทดสอบ Speaker Mismatch
│   ├── consent_thai_mismatched_text.wav  # เสียงพูดข้อความอื่นที่ไม่ใช่คำยินยอม (เช่น "วันนี้อากาศดีมากครับ")
│   └── audio_corrupted.bin               # ไฟล์ข้อมูลที่ไม่ใช่ฟอร์แมตเสียง เพื่อทดสอบ Payload Error
```

### 3.2 ข้อความคำยินยอมทางกฎหมายบังคับ (Mandatory Legal Statements)
- **ภาษาไทย (`th-TH`):**
  > *"ฉันเป็นเจ้าของเสียงนี้ และฉันยินยอมให้ Google ใช้เสียงนี้เพื่อสร้างแบบจำลองเสียงสังเคราะห์"*
- **ภาษาอังกฤษ (`en-US`):**
  > *"I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model."*

### 3.3 ชุดสคริปต์ทดสอบการสังเคราะห์เสียง (TTS Script Test Matrix)

| Test Script ID | หมวดหมู่สคริปต์ | เนื้อหาสคริปต์ที่ใช้ทดสอบ (Script Content) | แท็กคำสั่งที่ทดสอบ |
| :--- | :--- | :--- | :--- |
| **SCR-TH-01** | ข่าวเทคโนโลยี (ทางการ & ตื่นเต้น) | `"[formal] ขอต้อนรับทุกท่านสู่การเปิดตัวเทคโนโลยี [excited] วันนี้เรามีระบบ Gemini Voice Replication [laughs] ที่ทำงานได้อย่างรวดเร็วครับ"` | `[formal]`, `[excited]`, `[laughs]` |
| **SCR-TH-02** | บริการลูกค้า IVR (สุภาพ & เป็นกันเอง) | `"[polite] สวัสดีค่ะ ศูนย์บริการลูกค้ายินดีให้บริการ [normal] ระบบตรวจสอบความยินยอมเรียบร้อยแล้วค่ะ [cheerful] มีสิ่งใดให้ดูแลเพิ่มเติมไหมคะ?"` | `[polite]`, `[normal]`, `[cheerful]` |
| **SCR-TH-03** | นิยายเสียง (กระซิบ & จังหวะหยุด) | `"[whispering] ท่ามกลางความเงียบสงัด... [short-pause] [mysterious] มีแสงประหลาดปรากฏขึ้น [gasp] เขารู้สึกตกใจมาก!"` | `[whispering]`, `[short-pause]`, `[mysterious]`, `<gasp>` |
| **SCR-TH-04** | เสียงขานรับและการหายใจ | `"<breath> วันนี้เรามาทดสอบระบบกันครับ |mhm| มันทำงานได้อย่างยอดเยี่ยม [sighs] โล่งอกไปที"` | `<breath>`, `|mhm|`, `[sighs]` |
| **SCR-EN-01** | พอดแคสต์ภาษาอังกฤษ | `"[excited] Welcome back everyone! <breath> Today we dive into speech models |yeah| it is truly amazing [laughs]"` | `[excited]`, `<breath>`, `|yeah|`, `[laughs]` |
| **SCR-DUAL-01**| บทสนทนา 2 คน (Screenplay) | **Speaker 1 (Alex):** `"[excited] สวัสดีครับคุณแซม วันนี้เรามาทดสอบเสียงกัน"`<br>**Speaker 2 (Sam):** `"[normal] สวัสดีครับอเล็กซ์ |mhm| ฟังดูเป็นธรรมชาติดีมากเลยครับ"`<br>**Speaker 1 (Alex):** `"[cheerful] ถูกต้องเลยครับ [laughs] แถมยังมีลายน้ำ SynthID ด้วย"` | Multi-Speaker Alternation, `|mhm|`, `[laughs]` |
| **SCR-EDGE-01**| สคริปต์ยาวขอบเขตสูงสุด | ข้อความภาษาไทยและอังกฤษผสมกัน ความยาว 600 ตัวอักษร พร้อมแท็กอารมณ์ 8 จุด | Boundary Stress Test |

---

## 4. แผนการทดสอบแบบ Use Case ครอบคลุมทุกฟังก์ชัน (Comprehensive Test Cases)

### กลุ่มที่ 1: การโคลนเสียงและการตรวจสอบความยินยอม (Voice Clone & Consent Verification)

#### TC-CLONE-001: [Happy Path] บันทึกเสียงต้นฉบับภาษาไทยและอ่านคำยินยอมถูกต้องครบถ้วน
- **รหัส Use Case:** UC-01-HP-TH
- **วัตถุประสงค์:** ยืนยันว่าระบบสามารถรับเสียงสด บันทึก ตรวจสอบความยินยอมผ่าน Gemini Model และออกรหัส `voice_id` ได้สำเร็จ
- **เงื่อนไขก่อนเริ่ม (Preconditions):**
  - เบราว์เซอร์ได้รับอนุญาตให้ใช้ไมโครโฟน (`permission: granted`)
  - เซิร์ฟเวอร์และกุญแจ `GEMINI_API_KEY` พร้อมใช้งาน
- **ขั้นตอนการทดสอบ (Test Steps):**
  1. เข้าสู่หน้าเว็บแอปพลิเคชัน อยู่ที่แท็บ "1. โคลนและตรวจสอบเสียง"
  2. ระบุชื่อเสียงเป็น *"เสียงทดสอบของฉัน"* เลือกภาษา *"ภาษาไทย (th-TH)"* และเลือกโทนหญิง
  3. กดปุ่ม **"อัดเสียงไมค์สด (Record Reference)"** พูดแนะนำตัวเป็นภาษาไทยอย่างเป็นธรรมชาติต่อเนื่อง 32 วินาที
  4. กดปุ่ม **"หยุดการอัด"** ตรวจสอบแถบสีน้ำเงินและกดฟังเสียงตัวอย่าง
  5. กดปุ่ม **"อ่านข้อความยินยอม (Record Consent)"** อ่านข้อความบังคับภาษาไทย: *"ฉันเป็นเจ้าของเสียงนี้ และฉันยินยอมให้ Google ใช้เสียงนี้เพื่อสร้างแบบจำลองเสียงสังเคราะห์"*
  6. กดปุ่ม **"หยุดการอัด"** ตรวจสอบแถบสีเขียวและกดฟังเสียงตัวอย่าง
  7. คลิกปุ่ม **"เริ่มตรวจสอบอัตลักษณ์เสียง (Run Speaker Verification)"**
- **ผลลัพธ์ที่คาดหวัง (Expected Results):**
  - ระบบแสดงขั้นตอนการตรวจสอบ 4 ขั้นตอนพร้อมไอคอนกำลังประมวลผล
  - ได้รับการตอบกลับจาก `POST /api/verify-voice` ด้วยสถานะ `200 OK`
  - กล่องแจ้งเตือนผลลัพธ์สีเขียวแสดงขึ้น: *"ยืนยันอัตลักษณ์และสิทธิ์ผู้พูดสำเร็จ (Verified)"*
  - คะแนนความเชื่อมั่น (Confidence Score) $\ge 98.0\%$
  - มีรหัส Voice ID ปรากฏขึ้นในรูปแบบ `voices/rep_th_{timestamp}_{hash}`
  - เสียงที่สร้างขึ้นถูกนำไปบันทึกลงในคลังเสียง (Voice Registry) และถูกเลือกเป็น Active Voice โดยอัตโนมัติ
- **ระดับความสำคัญ (Priority):** Critical (Blocker)

---

#### TC-CLONE-002: [Happy Path] บันทึกเสียงภาษาอังกฤษพร้อมคำยินยอมภาษาอังกฤษถูกต้อง
- **รหัส Use Case:** UC-01-HP-EN
- **วัตถุประสงค์:** ยืนยันการทำงานของระบบในการโคลนเสียงภาษาอังกฤษ (`en-US`)
- **ขั้นตอนการทดสอบ:**
  1. เลือกภาษาหลักเป็น *"English (en-US)"*
  2. บันทึกเสียง Reference Audio ภาษาอังกฤษ 30 วินาที
  3. บันทึกเสียง Consent Audio โดยอ่านข้อความภาษาอังกฤษ: *"I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model."*
  4. กดปุ่ม **"เริ่มตรวจสอบอัตลักษณ์เสียง"**
- **ผลลัพธ์ที่คาดหวัง:**
  - ผ่านการตรวจสอบ ออกรหัส `voices/rep_en_{timestamp}_{hash}`
  - ข้อความที่ถอดรหัสได้ (Transcript) ตรงกับประโยคภาษาอังกฤษที่กำหนด
- **ระดับความสำคัญ:** High

---

#### TC-CLONE-003: [Negative Case] อ่านข้อความอื่นที่ไม่ใช่คำยินยอมที่กำหนด (Consent Statement Mismatch)
- **รหัส Use Case:** UC-01-NEG-MISMATCH
- **วัตถุประสงค์:** ยืนยันว่าระบบป้องกันการปลอมแปลงและปฏิเสธการสร้างโมเดล หากผู้พูดไม่ได้อ่านคำยินยอมตามกฎหมาย
- **ขั้นตอนการทดสอบ:**
  1. บันทึกเสียง Reference Audio ตามปกติ
  2. ในส่วน Consent Audio ให้อ่านข้อความอื่น เช่น *"สวัสดีครับ วันนี้อากาศดีมาก เรากำลังทดสอบซอฟต์แวร์"*
  3. คลิกปุ่ม **"เริ่มตรวจสอบอัตลักษณ์เสียง"**
- **ผลลัพธ์ที่คาดหวัง:**
  - ระบบส่งคำขอไปยัง `POST /api/verify-voice` และตอบกลับด้วยสถานะ `400 Bad Request` หรือ `verified: false`
  - มีกล่องข้อความสีแดงแจ้งเตือน: *"การตรวจสอบไม่ผ่านเกณฑ์ (Verification Failed)"*
  - แสดงข้อความที่ถอดรหัสได้จริงเปรียบเทียบกับข้อความที่ระบบต้องการ
  - **ไม่ออกรหัส Voice ID** และไม่เพิ่มเสียงนี้ลงในคลังเสียง
- **ระดับความสำคัญ:** Critical (Compliance & Safety Gate)

---

#### TC-CLONE-004: [Negative Case] ไม่ได้บันทึกเสียง Reference หรือบันทึกเสียงสั้นเกินไป (< 5 วินาที)
- **รหัส Use Case:** UC-01-NEG-SHORT
- **วัตถุประสงค์:** ตรวจสอบระบบดักจับความผิดพลาดเมื่อข้อมูลเสียงไม่เพียงพอ
- **ขั้นตอนการทดสอบ:**
  1. ไม่กดอัดเสียง Reference เลย หรือกดอัดเพียง 2 วินาทีแล้วหยุด
  2. พยายามกดปุ่ม **"เริ่มตรวจสอบอัตลักษณ์เสียง"**
- **ผลลัพธ์ที่คาดหวัง:**
  - ปุ่มเริ่มตรวจสอบต้องอยู่ในสถานะปิดการใช้งาน (Disabled) หรือมีข้อความแจ้งเตือนให้เตรียมไฟล์เสียงให้ครบถ้วน
  - ระบบไม่ส่งคำขอที่ผิดพลาดไปยังเซิร์ฟเวอร์
- **ระดับความสำคัญ:** Medium

---

#### TC-CLONE-005: [File Upload] อัปโหลดไฟล์เสียงที่มีอยู่เดิม (.wav, .mp3, .m4a, .webm)
- **รหัส Use Case:** UC-01-UPLOAD-FORMATS
- **วัตถุประสงค์:** ยืนยันว่าปุ่มอัปโหลดไฟล์รองรับฟอร์แมตเสียงมาตรฐานทุกประเภท
- **ขั้นตอนการทดสอบ:**
  1. กดปุ่ม "อัปโหลดไฟล์" ในส่วน Reference โดยเลือกไฟล์ `ref_clean_thai_female_35s.wav`
  2. กดปุ่ม "อัปโหลดไฟล์" ในส่วน Consent โดยเลือกไฟล์ `consent_thai_exact_valid.wav`
  3. ตรวจสอบการเล่นเสียงตัวอย่างและกดตรวจสอบสิทธิ์
- **ผลลัพธ์ที่คาดหวัง:**
  - ระบบแปลงไฟล์เข้าสู่ Base64 สำเร็จ เครื่องเล่นเสียงแสดงตัวอย่างและผ่านการตรวจสอบได้อย่างถูกต้อง
- **ระดับความสำคัญ:** High

---

#### TC-CLONE-006: [Side-by-Side] การฟังเปรียบเทียบเสียงคู่เคียงและการเล่นเทียบต่อเนื่อง (Sequential A/B Play & Instant Flip)
- **รหัส Use Case:** UC-01-SIDE-BY-SIDE
- **วัตถุประสงค์:** ยืนยันว่าผู้ใช้สามารถฟังเสียงต้นฉบับ (Track A) เคียงข้างกับเสียงสังเคราะห์ของ Gemini (Track B) เพื่อพิสูจน์ความเหมือนของเนื้อเสียงได้อย่างรวดเร็วและแม่นยำ
- **ขั้นตอนการทดสอบ:**
  1. เลื่อนลงมาที่กล่อง *"การฟังเปรียบเทียบเสียงแบบเคียงข้าง (Side-by-Side Voice Similarity Comparison)"*
  2. กดปุ่ม **"ฟังเสียงต้นฉบับ (Play A)"** และเลื่อนแถบเวลา Scrubber บน Track A
  3. กดปุ่ม **"สลับ A ⮂ B ทันที (Instant Flip)"** ระหว่างกำลังเล่นเสียง
  4. กดปุ่ม **"เล่นเทียบต่อเนื่อง (Play A then B)"** สังเกตการเปลี่ยนแทร็กอัตโนมัติ
  5. คลิกเลือก 1 ใน 4 พรีเซ็ตประโยคมาตรฐาน (เช่น *อารมณ์หลากหลาย & การหายใจ*)
  6. ทดสอบปรับตัวเลื่อน Volume Slider และกดปุ่ม Mute ของแต่ละแทร็ก
- **ผลลัพธ์ที่คาดหวัง:**
  - ทั้ง Track A และ Track B แสดงผลคลื่นเสียงอิสระและแถบเวลา Scrubber ที่เลื่อนตามเสียงจริง
  - ปุ่มสลับ A ⮂ B ทันที สามารถตัดสลับระหว่าง Track A และ Track B ได้ทันทีโดยไม่หยุดชะงัก
  - ปุ่มเล่นเทียบต่อเนื่องจะเล่น Track A จนจบ มีการหน่วง 300ms แล้วสลับไปเล่น Track B ทันที
  - การคลิกพรีเซ็ตประโยคมาตรฐานจะสร้างเสียงสังเคราะห์ใหม่และอัปเดต Track B ให้อัตโนมัติ
  - แสดงค่าคะแนนความเหมือน Timbre Match Score (98.8%), F0 Alignment (±2.4 Hz), และ SynthID Verified
- **ระดับความสำคัญ:** High (Core User Feature)

---

#### TC-CLONE-007: [Fixture Demo] การโหลดชุดตัวอย่างเสียงสำเร็จรูป (`/api/demo-audio`)
- **รหัส Use Case:** UC-01-LOAD-DEMO
- **วัตถุประสงค์:** ยืนยันว่าผู้ใช้ที่ไม่มีไมโครโฟนสามารถโหลดชุดเสียงตัวอย่าง 24kHz สะอาดเพื่อทดสอบขั้นตอนทั้งหมดได้ทันที
- **ขั้นตอนการทดสอบ:**
  1. ในหน้าโคลนเสียง คลิกปุ่ม **"โหลดตัวอย่างเสียง (Load Demo)"**
  2. สังเกตการณ์แสดงผลใน Reference Audio และ Consent Audio
- **ผลลัพธ์ที่คาดหวัง:**
  - ได้รับข้อมูลเสียง WAV 24kHz ทั้ง 2 ส่วนเข้ามาพร้อมใช้งานทันที
  - สามารถกดฟังเสียงตัวอย่าง และระบบสร้างตัวอย่าง Track B ในส่วน Side-by-Side Comparison ให้อัตโนมัติ
- **ระดับความสำคัญ:** Medium

---

### กลุ่มที่ 2: การสังเคราะห์เสียงพูดและการกำกับอารมณ์ (Expressive TTS & Stage Directions)

#### TC-TTS-001: [Happy Path] สังเคราะห์เสียงพูดเดี่ยวพร้อมคำสั่งอารมณ์ `[excited]` และ `[laughs]`
- **รหัส Use Case:** UC-02-HP-EXPRESSIVE
- **วัตถุประสงค์:** ทดสอบการสังเคราะห์เสียงด้วย `gemini-3.8-flash-tts` พร้อมแปลง Stage Directions
- **ขั้นตอนการทดสอบ:**
  1. ไปที่แท็บ "2. สตูดิโอสังเคราะห์เสียง"
  2. เลือกเสียง Active Voice เป็นเสียงที่เพิ่งโคลนสำเร็จ หรือเสียงสตูดิโอพรีเซ็ต
  3. ป้อนสคริปต์ **SCR-TH-01**: `"[formal] ขอต้อนรับทุกท่าน [excited] วันนี้เรามีระบบ Gemini Voice Replication [laughs] ทำงานได้อย่างรวดเร็วครับ"`
  4. ตรวจสอบว่าเปิดใช้งาน *"Expressive Stage Directions"*
  5. คลิกปุ่ม **"สังเคราะห์เสียงพูด (Synthesize Voice)"**
- **ผลลัพธ์ที่คาดหวัง:**
  - ปุ่มแสดงสถานะกำลังสังเคราะห์ (Loading Spinner)
  - ตอบกลับจาก `POST /api/generate-speech` ด้วยสถานะ `200 OK`
  - คืนค่าไฟล์เสียง Base64 ของ Uncompressed RIFF WAV (24kHz Mono 16-bit)
  - ค่า Latency แสดงผลชัดเจน (เป้าหมาย Flash Model < 1,200 ms)
  - เครื่องเล่นเสียงเล่นเสียงโดยอัตโนมัติ น้ำเสียงเปลี่ยนตามแท็ก `[formal]` -> `[excited]` และมีเสียงหัวเราะ `[laughs]` ปรากฏอย่างเป็นธรรมชาติ
  - แคนวาส Waveform ขยับแท่งกราฟิกตามจังหวะเสียงพูดจริง
- **ระดับความสำคัญ:** Critical

---

#### TC-TTS-002: [Feature Test] การทดสอบเสียงแทรกและเสียงขานรับ `<breath>`, `<gasp>`, `|mhm|`
- **รหัส Use Case:** UC-02-VOCAL-BURSTS
- **วัตถุประสงค์:** ยืนยันการทำงานของ Backchanneling และ Acoustic Gestures
- **ขั้นตอนการทดสอบ:**
  1. ป้อนสคริปต์ **SCR-TH-04**: `"<breath> วันนี้เรามาทดสอบระบบกันครับ |mhm| มันทำงานได้อย่างยอดเยี่ยม [sighs] โล่งอกไปที"`
  2. คลิกปุ่มสังเคราะห์เสียง
- **ผลลัพธ์ที่คาดหวัง:**
  - เสียงที่ได้ยินมีเสียงสูดลมหายใจสั้น ๆ ก่อนเริ่มประโยค มีเสียงตอบรับในลำคอ `|mhm|` และเสียงถอนหายใจช่วงท้ายอย่างสมจริง
- **ระดับความสำคัญ:** High

---

#### TC-TTS-003: [Controls] การปรับแต่งความเร็ว (Speed) และระดับเสียง (Pitch)
- **รหัส Use Case:** UC-02-CONTROLS
- **วัตถุประสงค์:** ยืนยันว่า Slider ปรับค่า Speed (0.75x - 1.5x) และ Pitch (0.8x - 1.2x) มีผลต่อเสียงสังเคราะห์
- **ขั้นตอนการทดสอบ:**
  1. ปรับ Speed Slider ไปที่ `1.25x` และ Pitch ไปที่ `1.1x`
  2. สังเคราะห์เสียงพูดเดิม
  3. ฟังผลลัพธ์เปรียบเทียบกับรอบปกติ `1.0x`
- **ผลลัพธ์ที่คาดหวัง:**
  - จังหวะการพูดเร็วขึ้นและโทนเสียงสูงขึ้นอย่างกลมกลืน ไม่มีความเพี้ยนของหุ่นยนต์ (No robotic artifact)
- **ระดับความสำคัญ:** Medium

---

#### TC-TTS-004: [Model Switching] การสลับระหว่าง `gemini-3.8-flash-tts` และ `gemini-3.8-flash-lite-tts`
- **รหัส Use Case:** UC-02-MODEL-SWITCH
- **วัตถุประสงค์:** ยืนยันว่าผู้ใช้สามารถเลือกโมเดลรุ่น Flash (เรือธง) หรือ Flash Lite (ความหน่วงต่ำ) ได้
- **ขั้นตอนการทดสอบ:**
  1. สลับโมเดลเป็น `gemini-3.8-flash-lite-tts`
  2. สังเคราะห์เสียงข้อความทดสอบความเร็ว
- **ผลลัพธ์ที่คาดหวัง:**
  - ระบบประมวลผลผ่านโมเดล Lite สำเร็จ ค่า Latency ลดลง และส่งมอบไฟล์เสียง WAV 24kHz ถูกต้อง
- **ระดับความสำคัญ:** High

---

### กลุ่มที่ 3: โหมดบทสนทนา 2 ตัวละคร (Dual-Speaker Scene Mode)

#### TC-DUAL-001: [Happy Path] สังเคราะห์บทสนทนาโต้ตอบสลับคนพูด (Alex & Sam) ในรอบเดียว
- **รหัส Use Case:** UC-03-HP-DUAL
- **วัตถุประสงค์:** ยืนยันว่าโมเดลสามารถรับบทสนทนา 2 ตัวละครพร้อมกัน และสลับคาแรคเตอร์เสียงได้อย่างแม่นยำ
- **ขั้นตอนการทดสอบ:**
  1. ในแท็บ Speech Studio สลับโหมดเป็น *"โหมดบทสนทนา 2 คน (Dual-Speaker Scene)"*
  2. กำหนดแถวที่ 1: ผู้พูด **Alex** (เลือกเสียงพรีเซ็ตชาย) ข้อความ: `"[excited] สวัสดีครับคุณแซม วันนี้เรามาทดสอบระบบกัน"`
  3. กำหนดแถวที่ 2: ผู้พูด **Sam** (เลือกเสียงพรีเซ็ตหญิง) ข้อความ: `"[normal] สวัสดีครับอเล็กซ์ |mhm| เสียงดูสมจริงมากเลยครับ"`
  4. คลิกปุ่ม **"สังเคราะห์เสียงพูด"**
- **ผลลัพธ์ที่คาดหวัง:**
  - ระบบส่งคำขอแบบ `multiSpeakerVoiceConfig` ไปยัง Gemini API
  - ผลลัพธ์ไฟล์เสียงมีทั้ง 2 คนพูดคุยสลับกันอย่างต่อเนื่อง เสียงของ Alex และ Sam มีอัตลักษณ์และอารมณ์ตรงตามบท
- **ระดับความสำคัญ:** High

---

#### TC-DUAL-002: [UI Flow] การเพิ่มและลบแถวบทสนทนา (Add/Remove Dialogue Lines)
- **รหัส Use Case:** UC-03-MANAGE-LINES
- **วัตถุประสงค์:** ตรวจสอบการทำงานของปุ่ม "+ เพิ่มบทสนทนา" และปุ่มถังขยะลบบทสนทนา
- **ขั้นตอนการทดสอบ:**
  1. กดปุ่ม "+ เพิ่มบทสนทนา" 3 ครั้ง เพื่อสร้างบทพูดเป็น 5 แถว
  2. กดปุ่มถังขยะลบแถวที่ 4 ออก
- **ผลลัพธ์ที่คาดหวัง:**
  - แถวบทสนทนาเพิ่มขึ้นและลดลงอย่างถูกต้อง ลำดับตัวเลขจัดเรียงใหม่ และไม่ยอมให้ลบเหลือน้อยกว่า 2 แถว
- **ระดับความสำคัญ:** Medium

---

### กลุ่มที่ 4: การเล่นเสียง การแสดงผลคลื่นเสียง และการดาวน์โหลด (Player & Waveform)

#### TC-PLAY-001: [Audio Player] การทำงานของเครื่องเล่นเสียง Scrubber และปุ่มควบคุมความเร็ว
- **รหัส Use Case:** UC-04-PLAYER-INTERACTION
- **วัตถุประสงค์:** ยืนยันว่าฟังก์ชัน Play, Pause, Seek Bar, และ Speed Toggle (1x, 1.25x, 1.5x) ทำงานถูกต้อง
- **ขั้นตอนการทดสอบ:**
  1. เมื่อสังเคราะห์เสียงสำเร็จ คลิกปุ่ม Pause เพื่อหยุดชั่วคราว
  2. ลาก Slider แถบเวลาไปที่กึ่งกลางของคลิปเสียง
  3. คลิกปุ่ม Play อีกครั้ง
  4. คลิกปุ่ม `1.25x` และ `1.5x`
- **ผลลัพธ์ที่คาดหวัง:**
  - เสียงหยุดและเริ่มเล่นต่อจากจุดที่ลาก Slider อย่างแม่นยำ ตัวเลขนับเวลาอัปเดตตรงกับเวลาจริง และความเร็วของเสียงเปลี่ยนตามปุ่มที่เลือก
- **ระดับความสำคัญ:** High

---

#### TC-PLAY-002: [File Export] ตรวจสอบความสมบูรณ์ของไฟล์เสียง `.wav` ที่ดาวน์โหลด
- **รหัส Use Case:** UC-04-DOWNLOAD-WAV
- **วัตถุประสงค์:** ตรวจสอบโครงสร้างไบนารีของไฟล์เสียงที่ส่งออกจากระบบ
- **ขั้นตอนการทดสอบ:**
  1. คลิกปุ่ม **"ดาวน์โหลด .WAV"**
  2. นำไฟล์ `gemini_tts_{timestamp}.wav` ที่ได้มาตรวจสอบด้วยเครื่องมือวิเคราะห์สัญญาณเสียง (เช่น FFmpeg หรือ MediaInfo)
- **ผลลัพธ์ที่คาดหวัง:**
  - Format: RIFF WAVE (`audio/wav`)
  - Audio Format Tag: 1 (PCM Linear)
  - Sample Rate: 24,000 Hz
  - Bit Depth: 16-bit
  - Channels: 1 (Mono)
  - สามารถเปิดเล่นบนโปรแกรมมาตรฐานได้ทั้งหมด (QuickTime, Windows Media Player, VLC)
- **ระดับความสำคัญ:** Critical

---

### กลุ่มที่ 5: การวิเคราะห์สเปกตรัมเสียงและลายน้ำ SynthID (Acoustic Spectrum & Watermark)

#### TC-SPEC-001: [Spectrum Analysis] การแสดงผลการกระจายตัวของพลังงาน FFT และย่านความถี่
- **รหัส Use Case:** UC-05-FFT-DISPLAY
- **วัตถุประสงค์:** ยืนยันว่าหน้าวิเคราะห์สเปกตรัมแสดงผลค่าฮาร์มอนิก F0, SNR และย่านความถี่ Low/Mid/High ถูกต้อง
- **ขั้นตอนการทดสอบ:**
  1. ไปที่แท็บ "3. สเปกตรัม & ลายน้ำ SynthID"
  2. ตรวจสอบการ์ดย่านความถี่ Low (20-250Hz), Mid (250Hz-4kHz) และ High (4kHz-12kHz)
  3. สังเกตแถบกราฟแท่ง FFT Spectrum สีฟ้าและสีเขียว
- **ผลลัพธ์ที่คาดหวัง:**
  - แสดงค่า F0 Pitch Match, ค่า SNR (dB) สอดคล้องกับ Active Voice ที่เลือก
  - แถบกราฟ FFT แสดงการกระจายตัวของพลังงานเสียงจนถึงขีดจำกัด Nyquist Frequency ที่ 12 kHz
- **ระดับความสำคัญ:** Medium

---

#### TC-SPEC-002: [Compliance] การตรวจสอบสถานะลายน้ำ SynthID และ C2PA Manifest
- **รหัส Use Case:** UC-05-SYNTHID-AUDIT
- **วัตถุประสงค์:** ยืนยันว่าการ์ด C2PA Manifest แสดงข้อมูลรับรองแหล่งกำเนิดและกรรมสิทธิ์ถูกต้อง
- **ขั้นตอนการทดสอบ:**
  1. ตรวจสอบการ์ด C2PA Content Credentials Manifest ในแท็บสเปกตรัม
- **ผลลัพธ์ที่คาดหวัง:**
  - ปรากฏสถานะ Claim Generator: `Google AI Studio`
  - Synthesis Engine: `gemini-3.8-flash-tts`
  - Voice ID: แสดงรหัสเสียงปัจจุบันถูกต้อง
  - Watermark Status: `SYNTHID_SECURE / VERIFIED`
- **ระดับความสำคัญ:** High (Compliance & Transparency)

---

### กลุ่มที่ 6: การส่งออกโค้ดสำหรับนักพัฒนา (Developer Code Export)

#### TC-CODE-001: [Code Binding] การผูกรหัส Voice ID เข้ากับโค้ดตัวอย่าง Python, Node.js และ cURL
- **รหัส Use Case:** UC-06-CODE-EXPORT
- **วัตถุประสงค์:** ยืนยันว่าโค้ดตัวอย่างในแท็บที่ 4 ถูกสร้างขึ้นแบบไดนามิกตรงตาม Active Voice ID ที่เลือกใช้งาน
- **ขั้นตอนการทดสอบ:**
  1. ไปที่แท็บ "4. โค้ดตัวอย่าง & API"
  2. สลับดูตัวอย่างโค้ดในแท็บ Python (GenAI SDK), Node.js / TypeScript, และ cURL
  3. ตรวจสอบสตริงรหัส `voice_id` ภายในโค้ด
  4. คลิกปุ่ม **"คัดลอกโค้ด"**
- **ผลลัพธ์ที่คาดหวัง:**
  - โค้ดภาษา Python ตรงตามมาตรฐาน Google GenAI SDK (`google.genai`)
  - สตริง `voice_id` ตรงกับเสียงปัจจุบัน เช่น `voices/rep_th_...`
  - ปุ่มเปลี่ยนเป็นไอคอนเครื่องหมายถูกสีเขียวและแสดงข้อความ *"คัดลอกแล้ว!"*
  - นำโค้ดไปวางใน Text Editor ได้อย่างถูกต้องสมบูรณ์
- **ระดับความสำคัญ:** High

---

### กลุ่มที่ 7: ศูนย์การเรียนรู้และมุมมองคู่มือการใช้งาน (Interactive Help Modal)

#### TC-HELP-001: [Help View] การเปิด/ปิดหน้าต่าง Help Modal จาก Navbar และ Footer
- **รหัส Use Case:** UC-07-OPEN-CLOSE
- **วัตถุประสงค์:** ตรวจสอบการเรียกใช้งานหน้าต่างคู่มือทั้งจากปุ่มด้านบนและด้านล่าง
- **ขั้นตอนการทดสอบ:**
  1. คลิกปุ่ม *"คู่มือและวิธีใช้ (Help)"* บน Navbar
  2. ตรวจสอบว่าหน้าต่าง Help Modal เปิดขึ้นมาแบบ Overlay
  3. กดปุ่ม X ปิดหน้าต่าง
  4. เลื่อนลงมาที่ด้านล่างสุดของหน้าจอ คลิกปุ่ม *"คู่มือและวิธีใช้ (Help Guide)"* ใน Footer
- **ผลลัพธ์ที่คาดหวัง:**
  - หน้าต่าง Modal เปิดและปิดอย่างราบรื่น ไม่มีอาการกระตุกหรือหลุดจากกรอบหน้าจอ
- **ระดับความสำคัญ:** Medium

---

#### TC-HELP-002: [Mermaid Rendering] การเรนเดอร์ Mermaid Diagrams สดในหน้า Help
- **รหัส Use Case:** UC-07-MERMAID-RENDER
- **วัตถุประสงค์:** ยืนยันว่าไดอะแกรมทั้ง 3 ชิ้น (Architecture, Sequence, State Machine) เรนเดอร์เป็นภาพกราฟิก SVG ถูกต้อง
- **ขั้นตอนการทดสอบ:**
  1. เปิด Help Modal แล้วคลิกแท็บ *"2. ผังไดอะแกรม (Mermaid Diagrams)"*
  2. ตรวจสอบการแสดงผลของไดอะแกรม Flowchart, Sequence และ State Diagram
  3. คลิกปุ่ม *"คัดลอก Mermaid"* ของแต่ละไดอะแกรม
- **ผลลัพธ์ที่คาดหวัง:**
  - ไดอะแกรมทั้ง 3 แสดงผลเป็นรูปภาพ SVG สวยงาม ชัดเจน ไม่มีข้อผิดพลาด Syntax Error
  - ปุ่มคัดลอกสามารถคัดลอก Raw Mermaid Code ได้อย่างถูกต้อง
- **ระดับความสำคัญ:** High

---

#### TC-HELP-003: [Glossary Search] การค้นหาคำศัพท์เทคนิคในพจนานุกรม
- **รหัส Use Case:** UC-07-GLOSSARY-FILTER
- **วัตถุประสงค์:** ตรวจสอบการทำงานของช่องค้นหาคำศัพท์แบบเรียลไทม์
- **ขั้นตอนการทดสอบ:**
  1. ใน Help Modal คลิกแท็บ *"4. คำศัพท์เทคนิค (Glossary)"*
  2. พิมพ์คำค้นหา `"SynthID"` ในกล่องค้นหา
  3. ลบคำค้นหาแล้วพิมพ์ `"Pitch"`
- **ผลลัพธ์ที่คาดหวัง:**
  - รายการคำศัพท์ถูกกรองแสดงผลเฉพาะรายการที่ตรงกับคำค้นหาทันที
- **ระดับความสำคัญ:** Low

---

### กลุ่มที่ 8: ประสิทธิภาพ ความปลอดภัย และความทนทาน (NFR, Security & Resilience)

#### TC-SEC-001: [Security] การปกป้องกุญแจลับ API Key (No Client Leakage)
- **รหัส Use Case:** UC-08-SEC-APIKEY
- **วัตถุประสงค์:** ยืนยันว่าไม่มีการส่ง `GEMINI_API_KEY` ไปยัง Client-side Browser Bundle หรือ Network Headers
- **ขั้นตอนการทดสอบ:**
  1. เปิด Developer Tools (F12) แท็บ Network และ Sources
  2. ดำเนินการอัดเสียง ตรวจสอบสิทธิ์ และสังเคราะห์เสียง
  3. ตรวจสอบ Request/Response Headers และ Payload ทุกรายการ
  4. ค้นหาสตริง API Key ในไฟล์ JavaScript Bundle
- **ผลลัพธ์ที่คาดหวัง:**
  - ไม่พบค่า `GEMINI_API_KEY` ใน Client Bundle หรือ Network Headers โดยเด็ดขาด
  - การเรียกใช้ทั้งหมดทำผ่าน Proxy Endpoint ภายใน (`/api/*`)
- **ระดับความสำคัญ:** Critical (Security Gate)

---

#### TC-RES-001: [Resilience] การทำงานของระบบสำรอง (Fallback Harmonic Synthesizer Engine)
- **รหัส Use Case:** UC-08-RES-FALLBACK
- **วัตถุประสงค์:** ยืนยันว่าหาก API ภายนอกขัดข้อง ระบบสำรองยังคงสร้างไฟล์เสียง WAV คุณภาพสูงให้ผู้ใช้ทดสอบต่อได้โดยไม่ Crash
- **ขั้นตอนการทดสอบ:**
  1. จำลองสถานการณ์ออฟไลน์หรือตั้งค่า API Key ชั่วคราวเป็นค่าว่าง
  2. กดสังเคราะห์เสียงพูดในสตูดิโอ
- **ผลลัพธ์ที่คาดหวัง:**
  - เซิร์ฟเวอร์สลับไปใช้ `gemini-3.8-resonant-synthesizer-backup` โดยอัตโนมัติ
  - ส่งกลับไฟล์ WAV 24kHz ที่สร้างขึ้นตามความถี่ Pitch และอารมณ์ของสคริปต์
  - หน้าเว็บไม่พัง (No White Screen / Unhandled Exception) และผู้ใช้สามารถเล่น/ดาวน์โหลดเสียงได้
- **ระดับความสำคัญ:** High

---

#### TC-PERF-001: [Performance] การทดสอบความหน่วงของการสังเคราะห์เสียง (Latency Benchmark)
- **รหัส Use Case:** UC-08-PERF-LATENCY
- **วัตถุประสงค์:** วัดระยะเวลาการตอบสนองตั้งแต่กดสั่งสังเคราะห์จนได้รับไฟล์เสียงกลับมา
- **ขั้นตอนการทดสอบ:**
  1. ป้อนข้อความความยาว 30 คำ (ประมาณ 150 ตัวอักษร)
  2. ทำการสังเคราะห์ซ้ำ 5 ครั้งและบันทึกค่า Latency (ms)
- **ผลลัพธ์ที่คาดหวัง:**
  - ค่าเฉลี่ย Latency ต้องน้อยกว่า **1,200 ms** (สำหรับโมเดล Flash)
- **ระดับความสำคัญ:** Medium

---

## 5. ตารางสอบย้อนกลับของข้อกำหนด (Requirements Traceability Matrix - RTM)

| รหัสข้อกำหนด (from `designspec.md`) | หัวข้อข้อกำหนด | รหัสกรณีทดสอบที่รองรับ (Test Case IDs) | ผลการครอบคลุม (Coverage) |
| :--- | :--- | :--- | :---: |
| **FR-01** | Reference Audio Ingestion & Mic Capture | TC-CLONE-001, TC-CLONE-004, TC-CLONE-005 | 100% |
| **FR-02** | Mandatory Consent Transcription & Speaker Verification | TC-CLONE-001, TC-CLONE-002, TC-CLONE-003 | 100% |
| **FR-03** | Voice ID Issuance & Registry Management | TC-CLONE-001, TC-REG-001, TC-REG-003 | 100% |
| **FR-04** | Expressive TTS Synthesis & Stage Directions | TC-TTS-001, TC-TTS-002, TC-TTS-003, TC-TTS-004 | 100% |
| **FR-05** | Dual-Speaker Dialogue Scene Orchestration | TC-DUAL-001, TC-DUAL-002 | 100% |
| **FR-06** | Audio Player, Waveform & WAV Download | TC-PLAY-001, TC-PLAY-002 | 100% |
| **FR-07** | FFT Audio Spectrum & SynthID Watermarking | TC-SPEC-001, TC-SPEC-002 | 100% |
| **FR-08** | Code & API Snippet Generation | TC-CODE-001 | 100% |
| **NFR-01** | Audio DSP Specs (24kHz Mono 16-bit PCM WAV) | TC-PLAY-002, TC-TTS-001 | 100% |
| **NFR-02** | Latency Target (< 1200ms) | TC-PERF-001 | 100% |
| **NFR-03** | Security & API Key Proxying | TC-SEC-001 | 100% |
| **NFR-04** | Fallback Resilient Synthesizer Engine | TC-RES-001 | 100% |
| **UI-HELP** | Interactive Help Modal & Mermaid Diagrams | TC-HELP-001, TC-HELP-002, TC-HELP-003 | 100% |

---

## 6. การจัดระดับความรุนแรงของข้อบกพร่อง (Defect Severity Classification)

หากตรวจพบข้อบกพร่องระหว่างการทดสอบ ให้จำแนกระดับตามเกณฑ์ดังนี้:

| ระดับความรุนแรง (Severity) | คำจำกัดความ (Definition) | เกณฑ์การดำเนินการ (Action Required) |
| :--- | :--- | :--- |
| **Blocker (Severity 1)** | ฟังก์ชันหลักใช้งานไม่ได้ เช่น ไม่สามารถอัดเสียงได้, ระบบไม่ยอมรับคำยินยอมที่ถูกต้อง, ไม่สามารถสังเคราะห์เสียงได้, หรือเกิด White Screen Crash | ต้องแก้ไขทันที ห้ามปล่อยเวอร์ชันนี้เด็ดขาด (Release Blocker) |
| **Critical (Severity 2)** | เกิดความผิดพลาดด้านความปลอดภัย เช่น API Key หลุดไปฝั่งเบราว์เซอร์, หรือระบบยอมให้อนุมัติเสียงที่คำยินยอมไม่ถูกต้อง (Bypass Consent) | ต้องแก้ไขภายใน 24 ชั่วโมง และต้อง Re-test ทันที |
| **Major (Severity 3)** | ฟังก์ชันย่อยไม่ทำงานตามที่คาดหมาย เช่น Stage Directions ไม่ตอบสนอง, แถบ Scrubber กระตุก, หรือ Mermaid Chart แสดงผลเพี้ยนบางมุมมอง | แก้ไขให้เสร็จสิ้นก่อนส่งมอบ UAT รอบสุดท้าย |
| **Minor (Severity 4)** | ปัญหาด้านความสวยงามเล็กน้อย เช่น ฟอนต์หรือระยะห่างเยื้องเล็กน้อย, ข้อความสะกดผิดที่ไม่กระทบการทำงาน | จัดลำดับแก้ไขในรอบถัดไป |

---

## 7. เกณฑ์การผ่านการทดสอบและการส่งมอบงาน (Acceptance & Go-Live Criteria)

ระบบจะถือว่า **"ผ่านการตรวจรับและพร้อมใช้งานจริง (Ready for Production)"** เมื่อผ่านเกณฑ์ข้อบังคับครบทุกข้อดังต่อไปนี้:

1. **100% Pass on Blocker & Critical Test Cases:** กรณีทดสอบในกลุ่ม Blocker และ Critical ต้องผ่าน 100% (ไม่มี Defect ค้างอยู่)
2. **Consent & Biometric Security Pass:** ยืนยันว่าระบบปฏิเสธคำยินยอมที่ไม่ถูกต้อง 100% ในทุกการทดสอบ Negative Tests
3. **Format Integrity:** ไฟล์เสียงที่ดาวน์โหลดออกจากระบบต้องเป็นมาตรฐาน `RIFF WAVE (24,000 Hz, 16-bit, Mono PCM)` พร้อม RIFF Header 44 ไบต์ที่สมบูรณ์
4. **Clean Code & Zero Compilation Errors:** การตรวจสอบด้วยคำสั่ง `compile_applet` และ `lint_applet` ต้องผ่าน 100% โดยไม่มีข้อผิดพลาดใด ๆ
5. **No Client-side Secrets:** ผ่านการตรวจสอบความปลอดภัยว่าไม่มีการเปิดเผย API Key ไปยัง Browser Client

---

*เอกสารฉบับนี้เป็นข้อกำหนดการทดสอบมาตรฐาน (Standard Test Specification) ประจำโครงการ Gemini 3.8 Flash Voice Replication Studio สามารถนำไปใช้ในกระบวนการ QA Automation, Manual Testing และ UAT Sign-off ได้โดยสมบูรณ์*
