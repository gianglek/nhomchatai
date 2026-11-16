// config.js - NHA RIENG CUA API KEY 🔑
// ⚠️ file nay KHONG duoc dua len GitHub (da co trong .gitignore), dung gui cho ai nha!
// thay chu DAN_KEY_... bang key that, GIU NGUYEN dau ngoac kep
var CONFIG = {
  gemini: {
    key: "DAN_KEY_GEMINI_VAO_DAY",          // lay o aistudio.google.com
    model: "gemini-2.5-flash"                // model chu + xem anh luon
  },
  groq: {
    key: "DAN_KEY_GROQ_VAO_DAY",            // lay o console.groq.com
    model: "llama-3.1-8b-instant",           // model chu, nhanh nhu chop 🏃‍♂️💨
    visionModel: "qwen/qwen3.8-27b"          // model xem anh (doi ten thi sua o day)
  }
};
