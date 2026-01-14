// src/components/shared/soundUtils.ts

// เก็บฟังก์ชัน beep เดิมไว้เป็น fallback หรือใช้คู่กัน
export const playBeepSound = () => {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log("Audio play failed:", e);
  }
};

// ==================== TEXT TO SPEECH ====================
export const playTTS = (text: string, lang: string = "th-TH") => {
  if (!("speechSynthesis" in window)) {
    console.warn("Browser does not support Text-to-Speech");
    playBeepSound(); // Fallback ไปใช้เสียง beep ถ้า browser ไม่รองรับ
    return;
  }

  // ยกเลิกเสียงที่พูดค้างอยู่ (ถ้ามี) เพื่อพูดประโยคใหม่ทันที
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang; // บังคับภาษาไทย
  utterance.rate = 0.9; // ความเร็วในการพูด (0.1 - 10), 1 คือปกติ, 0.9 จะช้าลงนิดหน่อยให้ฟังชัด
  utterance.pitch = 1; // ระดับเสียง (0 - 2)
  utterance.volume = 1; // ความดัง (0 - 1)

  // พยายามหาเสียงภาษาไทย (ถ้ามี)
  const voices = window.speechSynthesis.getVoices();
  const thaiVoice = voices.find((voice) => voice.lang.includes("th"));
  if (thaiVoice) {
    utterance.voice = thaiVoice;
  }

  window.speechSynthesis.speak(utterance);
};
