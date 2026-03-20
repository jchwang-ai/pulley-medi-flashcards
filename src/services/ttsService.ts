export function generateSpeech(
  text: string,
  lang: string = "en-US",
  rate: number = 1,
  pitch: number = 1
): boolean {
  if (!text || typeof window === "undefined" || !window.speechSynthesis) {
    return false;
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((voice) => voice.lang === lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return true;
  } catch (error) {
    console.error("Browser TTS Error:", error);
    return false;
  }
}